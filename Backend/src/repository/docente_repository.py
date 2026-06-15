from src.repository.helpers import generar_codigo, nombre_completo, estado_texto, normalizar_grado_nombre, obtener_rol_id
from src.services.database import get_supabase


class DocenteRepository:
    def find_all(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("docentes")
            .select(
                "id,codigo_docente,especialidad,cargo,"
                "perfiles(nombres,apellidos,correo_institucional,telefono,estado),"
                "cursos_asignados(id,asignaturas(nombre),secciones(nombre,grados(nombre)))"
            )
            .execute()
        )
        return [self._map_row(row) for row in response.data or []]

    def find_by_id(self, docente_id: str) -> dict | None:
        client = get_supabase()
        response = (
            client.table("docentes")
            .select(
                "id,codigo_docente,especialidad,cargo,grado_academico,"
                "perfiles(nombres,apellidos,correo_institucional,telefono,dni,estado),"
                "cursos_asignados(id,asignaturas(nombre),secciones(nombre,grados(nombre,niveles_educativos(nombre))))"
            )
            .eq("id", docente_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return self._map_detail(response.data[0])

    def crear(self, data: dict) -> dict:
        client = get_supabase()
        auth_user = client.auth.admin.create_user(
            {
                "email": data["correo_institucional"],
                "password": data["password"],
                "email_confirm": True,
            }
        )
        user_id = auth_user.user.id
        codigo = generar_codigo("DOC", "docentes", "codigo_docente")

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

        doc_resp = (
            client.table("docentes")
            .insert(
                {
                    "perfil_id": user_id,
                    "codigo_docente": codigo,
                    "especialidad": data.get("especialidad"),
                    "cargo": data.get("cargo"),
                    "grado_academico": data.get("grado_academico"),
                }
            )
            .execute()
        )

        rol_id = obtener_rol_id("DOCENTE")
        if rol_id:
            client.table("usuarios_roles").insert(
                {"perfil_id": user_id, "rol_id": rol_id, "activo": True}
            ).execute()

        return self.find_by_id(doc_resp.data[0]["id"])

    def actualizar(self, docente_id: str, data: dict) -> dict:
        client = get_supabase()
        doc_resp = (
            client.table("docentes")
            .select("perfil_id")
            .eq("id", docente_id)
            .limit(1)
            .execute()
        )
        if not doc_resp.data:
            raise ValueError("Docente no encontrado")

        perfil_id = doc_resp.data[0]["perfil_id"]
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

        doc_update = {
            k: v
            for k, v in {
                "especialidad": data.get("especialidad"),
                "cargo": data.get("cargo"),
                "grado_academico": data.get("grado_academico"),
            }.items()
            if v is not None
        }
        if doc_update:
            client.table("docentes").update(doc_update).eq("id", docente_id).execute()

        result = self.find_by_id(docente_id)
        if not result:
            raise ValueError("Docente no encontrado")
        return result

    def _map_row(self, row: dict) -> dict:
        perfil = row.get("perfiles") or {}
        cursos = row.get("cursos_asignados") or []

        return {
            "id": row["id"],
            "code": row.get("codigo_docente", ""),
            "fullName": nombre_completo(perfil),
            "specialty": row.get("especialidad") or row.get("cargo") or "—",
            "email": perfil.get("correo_institucional", ""),
            "status": estado_texto(perfil.get("estado", True)),
            "active": bool(perfil.get("estado", True)),
            "coursesCount": len(cursos),
        }

    def _map_detail(self, row: dict) -> dict:
        base = self._map_row(row)
        perfil = row.get("perfiles") or {}
        cursos = []
        for c in row.get("cursos_asignados") or []:
            asig = c.get("asignaturas") or {}
            sec = c.get("secciones") or {}
            grado = sec.get("grados") or {}
            nivel = grado.get("niveles_educativos") or {}
            cursos.append(
                {
                    "id": c.get("id"),
                    "subject": asig.get("nombre", ""),
                    "section": sec.get("nombre", ""),
                    "grade": normalizar_grado_nombre(grado.get("nombre", "")),
                    "level": nivel.get("nombre", ""),
                }
            )
        return {
            **base,
            "firstName": perfil.get("nombres", ""),
            "lastName": perfil.get("apellidos", ""),
            "phone": perfil.get("telefono", ""),
            "dni": perfil.get("dni", ""),
            "cargo": row.get("cargo", ""),
            "degree": row.get("grado_academico", ""),
            "assignedCourses": cursos,
        }
