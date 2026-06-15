from src.repository.helpers import (
    estado_texto,
    generar_codigo,
    nombre_completo,
    normalizar_grado_nombre,
    obtener_estudiantes_ids_por_docente,
)
from src.services.database import get_supabase

SELECT_DETAIL = (
    "id,codigo_estudiante,fecha_nacimiento,observaciones,"
    "perfiles(id,nombres,apellidos,correo_institucional,dni,telefono,estado),"
    "matriculas(id,fecha_matricula,estados_matricula(codigo,nombre),"
    "anios_academicos(anio),secciones(nombre,grados(nombre,niveles_educativos(nombre,codigo)))),"
    "apoderado_estudiante(parentesco,es_principal,apoderados(id,perfiles(nombres,apellidos,correo_institucional,telefono)))"
)


def _ultima_matricula(matriculas: list | None) -> dict | None:
    if not matriculas:
        return None
    if isinstance(matriculas, list):
        return matriculas[-1]
    return matriculas


class EstudianteRepository:
    def find_all(self) -> list[dict]:
        client = get_supabase()
        response = client.table("estudiantes").select(SELECT_DETAIL).execute()
        return [self._map_row(row) for row in response.data or []]

    def find_by_docente(
        self,
        docente_id: str,
        curso_id: str | None = None,
        seccion_id: str | None = None,
    ) -> list[dict]:
        ids = obtener_estudiantes_ids_por_docente(docente_id, curso_id=curso_id, seccion_id=seccion_id)
        if not ids:
            return []
        client = get_supabase()
        response = client.table("estudiantes").select(SELECT_DETAIL).in_("id", list(ids)).execute()
        return [self._map_row(row) for row in response.data or []]

    def find_by_id(self, estudiante_id: str) -> dict | None:
        client = get_supabase()
        response = (
            client.table("estudiantes")
            .select(SELECT_DETAIL)
            .eq("id", estudiante_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return self._map_detail(response.data[0])

    def crear(self, data: dict) -> dict:
        client = get_supabase()
        try:
            auth_user = client.auth.admin.create_user(
                {
                    "email": data["correo_institucional"],
                    "password": data["password"],
                    "email_confirm": True,
                }
            )
        except Exception as exc:
            msg = str(exc).lower()
            if "not allowed" in msg or "user not allowed" in msg:
                raise ValueError(
                    "No se puede crear usuario Auth: la SUPABASE_KEY no es service_role. "
                    "Copie la service_role (JWT) en Backend/.env desde Supabase → Settings → API."
                ) from exc
            raise ValueError(f"No se pudo crear el usuario en Auth: {exc}") from exc
        user_id = auth_user.user.id
        codigo = generar_codigo("EST", "estudiantes", "codigo_estudiante")

        client.table("perfiles").insert(
            {
                "id": user_id,
                "nombres": data["nombres"],
                "apellidos": data["apellidos"],
                "correo_institucional": data["correo_institucional"],
                "dni": data.get("dni"),
                "telefono": data.get("telefono"),
                "estado": True,
            }
        ).execute()

        est_resp = (
            client.table("estudiantes")
            .insert(
                {
                    "perfil_id": user_id,
                    "codigo_estudiante": codigo,
                    "fecha_nacimiento": data.get("fecha_nacimiento"),
                    "observaciones": data.get("observaciones"),
                }
            )
            .execute()
        )

        rol_resp = (
            client.table("roles").select("id").eq("codigo", "ESTUDIANTE").limit(1).execute()
        )
        if rol_resp.data:
            client.table("usuarios_roles").insert(
                {"perfil_id": user_id, "rol_id": rol_resp.data[0]["id"], "activo": True}
            ).execute()

        return self.find_by_id(est_resp.data[0]["id"])

    def actualizar(self, estudiante_id: str, data: dict) -> dict:
        client = get_supabase()
        est_resp = (
            client.table("estudiantes")
            .select("perfil_id")
            .eq("id", estudiante_id)
            .limit(1)
            .execute()
        )
        if not est_resp.data:
            raise ValueError("Estudiante no encontrado")

        perfil_id = est_resp.data[0]["perfil_id"]
        perfil_update = {
            k: v
            for k, v in {
                "nombres": data.get("nombres"),
                "apellidos": data.get("apellidos"),
                "correo_institucional": data.get("correo_institucional"),
                "dni": data.get("dni"),
                "telefono": data.get("telefono"),
                "estado": data.get("estado"),
            }.items()
            if v is not None
        }
        if perfil_update:
            client.table("perfiles").update(perfil_update).eq("id", perfil_id).execute()

        est_update = {
            k: v
            for k, v in {
                "fecha_nacimiento": data.get("fecha_nacimiento"),
                "observaciones": data.get("observaciones"),
            }.items()
            if v is not None
        }
        if est_update:
            client.table("estudiantes").update(est_update).eq("id", estudiante_id).execute()

        result = self.find_by_id(estudiante_id)
        if not result:
            raise ValueError("Estudiante no encontrado")
        return result

    def _map_row(self, row: dict) -> dict:
        perfil = row.get("perfiles") or {}
        matricula = _ultima_matricula(row.get("matriculas"))
        seccion = (matricula or {}).get("secciones") or {}
        grado = seccion.get("grados") or {}
        nivel = grado.get("niveles_educativos") or {}
        anio = (matricula or {}).get("anios_academicos") or {}

        return {
            "id": row["id"],
            "code": row.get("codigo_estudiante", ""),
            "fullName": nombre_completo(perfil),
            "level": nivel.get("nombre", "Sin matrícula"),
            "grade": normalizar_grado_nombre(grado.get("nombre", "—")),
            "section": seccion.get("nombre", "—"),
            "academicYear": str(anio.get("anio", "—")),
            "status": estado_texto(perfil.get("estado", True)),
        }

    def _map_detail(self, row: dict) -> dict:
        base = self._map_row(row)
        perfil = row.get("perfiles") or {}
        matricula = _ultima_matricula(row.get("matriculas"))
        estado_mat = (matricula or {}).get("estados_matricula") or {}
        apoderados = []
        for link in row.get("apoderado_estudiante") or []:
            ap = link.get("apoderados") or {}
            ap_perfil = ap.get("perfiles") or {}
            apoderados.append(
                {
                    "id": ap.get("id"),
                    "fullName": nombre_completo(ap_perfil),
                    "email": ap_perfil.get("correo_institucional", ""),
                    "phone": ap_perfil.get("telefono", ""),
                    "relationship": link.get("parentesco", ""),
                    "isPrimary": link.get("es_principal", False),
                }
            )

        return {
            **base,
            "firstName": perfil.get("nombres", ""),
            "lastName": perfil.get("apellidos", ""),
            "email": perfil.get("correo_institucional", ""),
            "dni": perfil.get("dni", ""),
            "phone": perfil.get("telefono", ""),
            "birthDate": row.get("fecha_nacimiento"),
            "notes": row.get("observaciones", ""),
            "enrollmentId": (matricula or {}).get("id"),
            "enrollmentStatus": estado_mat.get("nombre", "Sin matrícula"),
            "guardians": apoderados,
        }
