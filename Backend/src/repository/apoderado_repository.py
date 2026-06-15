from src.repository.helpers import nombre_completo, estado_texto, obtener_rol_id
from src.services.database import get_supabase


class ApoderadoRepository:
    def find_all(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("apoderados")
            .select(
                "id,ocupacion,direccion,"
                "perfiles(nombres,apellidos,telefono,correo_institucional,estado),"
                "apoderado_estudiante(parentesco,es_principal,estudiantes(id,codigo_estudiante,perfiles(nombres,apellidos)))"
            )
            .execute()
        )
        rows = []
        for row in response.data or []:
            links = row.get("apoderado_estudiante") or []
            if not links:
                rows.append(self._map_row(row, None, None))
                continue
            for link in links:
                rows.append(self._map_row(row, link, link.get("estudiantes")))
        return rows

    def find_by_id(self, apoderado_id: str) -> dict | None:
        client = get_supabase()
        response = (
            client.table("apoderados")
            .select(
                "id,ocupacion,direccion,"
                "perfiles(nombres,apellidos,telefono,correo_institucional,dni,estado),"
                "apoderado_estudiante(id,parentesco,es_principal,estudiantes(id,codigo_estudiante,perfiles(nombres,apellidos)))"
            )
            .eq("id", apoderado_id)
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
            if "already" in msg or "registered" in msg or "exists" in msg:
                raise ValueError("El correo ya está registrado en el sistema.") from exc
            if "not allowed" in msg:
                raise ValueError(
                    "No se puede crear usuario Auth: verifique SUPABASE_KEY (service_role) en Backend/.env."
                ) from exc
            raise ValueError(f"No se pudo crear el usuario en Auth: {exc}") from exc
        user_id = auth_user.user.id

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

        ap_resp = (
            client.table("apoderados")
            .insert(
                {
                    "perfil_id": user_id,
                    "ocupacion": data.get("ocupacion"),
                    "direccion": data.get("direccion"),
                }
            )
            .execute()
        )
        apoderado_id = ap_resp.data[0]["id"]

        rol_id = obtener_rol_id("APODERADO")
        if rol_id:
            client.table("usuarios_roles").insert(
                {"perfil_id": user_id, "rol_id": rol_id, "activo": True}
            ).execute()

        if data.get("estudiante_id") and data.get("parentesco"):
            client.table("apoderado_estudiante").insert(
                {
                    "apoderado_id": apoderado_id,
                    "estudiante_id": data["estudiante_id"],
                    "parentesco": data["parentesco"],
                    "es_principal": data.get("es_principal", False),
                }
            ).execute()

        return self.find_by_id(apoderado_id)

    def actualizar(self, apoderado_id: str, data: dict) -> dict:
        client = get_supabase()
        ap_resp = (
            client.table("apoderados")
            .select("perfil_id")
            .eq("id", apoderado_id)
            .limit(1)
            .execute()
        )
        if not ap_resp.data:
            raise ValueError("Apoderado no encontrado")

        perfil_id = ap_resp.data[0]["perfil_id"]
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

        ap_update = {
            k: v
            for k, v in {
                "ocupacion": data.get("ocupacion"),
                "direccion": data.get("direccion"),
            }.items()
            if v is not None
        }
        if ap_update:
            client.table("apoderados").update(ap_update).eq("id", apoderado_id).execute()

        result = self.find_by_id(apoderado_id)
        if not result:
            raise ValueError("Apoderado no encontrado")
        return result

    def vincular_estudiante(self, apoderado_id: str, data: dict) -> dict:
        client = get_supabase()
        client.table("apoderado_estudiante").insert(
            {
                "apoderado_id": apoderado_id,
                "estudiante_id": data["estudiante_id"],
                "parentesco": data["parentesco"],
                "es_principal": data.get("es_principal", False),
            }
        ).execute()
        result = self.find_by_id(apoderado_id)
        if not result:
            raise ValueError("Apoderado no encontrado")
        return result

    def _map_row(self, row: dict, link: dict | None, estudiante: dict | None) -> dict:
        perfil = row.get("perfiles") or {}
        est_perfil = (estudiante or {}).get("perfiles") or {}
        return {
            "id": row["id"],
            "fullName": nombre_completo(perfil),
            "studentName": nombre_completo(est_perfil) if estudiante else "—",
            "studentId": (estudiante or {}).get("id", ""),
            "relationship": (link or {}).get("parentesco", "—"),
            "isPrimary": "Sí" if (link or {}).get("es_principal") else "No",
            "phone": perfil.get("telefono", ""),
            "email": perfil.get("correo_institucional", ""),
            "status": estado_texto(perfil.get("estado", True)),
        }

    def _map_detail(self, row: dict) -> dict:
        perfil = row.get("perfiles") or {}
        students = []
        for link in row.get("apoderado_estudiante") or []:
            est = link.get("estudiantes") or {}
            est_perfil = est.get("perfiles") or {}
            students.append(
                {
                    "linkId": link.get("id"),
                    "studentId": est.get("id"),
                    "studentCode": est.get("codigo_estudiante", ""),
                    "studentName": nombre_completo(est_perfil),
                    "relationship": link.get("parentesco", ""),
                    "isPrimary": link.get("es_principal", False),
                }
            )
        return {
            "id": row["id"],
            "fullName": nombre_completo(perfil),
            "firstName": perfil.get("nombres", ""),
            "lastName": perfil.get("apellidos", ""),
            "email": perfil.get("correo_institucional", ""),
            "phone": perfil.get("telefono", ""),
            "dni": perfil.get("dni", ""),
            "occupation": row.get("ocupacion", ""),
            "address": row.get("direccion", ""),
            "status": estado_texto(perfil.get("estado", True)),
            "students": students,
        }
