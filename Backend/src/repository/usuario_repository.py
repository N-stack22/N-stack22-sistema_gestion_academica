from src.repository.helpers import estado_texto, nombre_completo, obtener_rol_id
from src.services.database import get_supabase

ROLE_MAP = {
    "ADMIN": "ADMIN",
    "ADMINISTRADOR": "ADMIN",
    "DIRECTOR": "DIRECTOR",
    "DOCENTE": "TEACHER",
    "TEACHER": "TEACHER",
    "ESTUDIANTE": "STUDENT",
    "STUDENT": "STUDENT",
    "APODERADO": "PARENT",
    "PARENT": "PARENT",
}


class UsuarioRepository:
    def find_all(self, rol_codigo: str | None = None) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("perfiles")
            .select(
                "id,nombres,apellidos,correo_institucional,telefono,dni,estado,"
                "usuarios_roles(activo,roles(codigo,nombre))"
            )
            .execute()
        )
        rows = []
        for row in response.data or []:
            mapped = self._map_row(row)
            if rol_codigo and mapped["roleCode"] != rol_codigo.upper():
                continue
            rows.append(mapped)
        return rows

    def find_by_id(self, perfil_id: str) -> dict | None:
        client = get_supabase()
        response = (
            client.table("perfiles")
            .select(
                "id,nombres,apellidos,correo_institucional,telefono,dni,estado,"
                "usuarios_roles(activo,roles(codigo,nombre))"
            )
            .eq("id", perfil_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        mapped = self._map_row(response.data[0])
        client = get_supabase()
        perfil_id = response.data[0]["id"]
        extras: dict = {"profileId": perfil_id}
        doc = client.table("docentes").select("id,codigo_docente").eq("perfil_id", perfil_id).limit(1).execute()
        if doc.data:
            extras["entityType"] = "Docente"
            extras["entityCode"] = doc.data[0].get("codigo_docente", "")
            extras["entityId"] = doc.data[0].get("id", "")
        else:
            est = client.table("estudiantes").select("id,codigo_estudiante").eq("perfil_id", perfil_id).limit(1).execute()
            if est.data:
                extras["entityType"] = "Estudiante"
                extras["entityCode"] = est.data[0].get("codigo_estudiante", "")
                extras["entityId"] = est.data[0].get("id", "")
            else:
                ap = client.table("apoderados").select("id").eq("perfil_id", perfil_id).limit(1).execute()
                if ap.data:
                    extras["entityType"] = "Apoderado"
                    extras["entityId"] = ap.data[0].get("id", "")
        roles = response.data[0].get("usuarios_roles") or []
        extras["allRoles"] = [
            {
                "code": ((r.get("roles") or {}).get("codigo") or "").upper(),
                "name": (r.get("roles") or {}).get("nombre", ""),
                "active": r.get("activo", False),
            }
            for r in roles
        ]
        return {**mapped, **extras}

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

        perfil = {
            "id": user_id,
            "nombres": data["nombres"],
            "apellidos": data["apellidos"],
            "correo_institucional": data["correo_institucional"],
            "dni": data.get("dni"),
            "telefono": data.get("telefono"),
            "estado": True,
        }
        client.table("perfiles").insert(perfil).execute()

        rol_id = obtener_rol_id(data["rol_codigo"])
        if not rol_id:
            raise ValueError(f"Rol '{data['rol_codigo']}' no encontrado")

        client.table("usuarios_roles").insert(
            {"perfil_id": user_id, "rol_id": rol_id, "activo": True}
        ).execute()

        return self.find_by_id(user_id)

    def actualizar(self, perfil_id: str, data: dict) -> dict:
        client = get_supabase()
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

        if data.get("rol_codigo"):
            rol_id = obtener_rol_id(data["rol_codigo"])
            if not rol_id:
                raise ValueError(f"Rol '{data['rol_codigo']}' no encontrado")
            client.table("usuarios_roles").update({"activo": False}).eq(
                "perfil_id", perfil_id
            ).execute()
            client.table("usuarios_roles").insert(
                {
                    "perfil_id": perfil_id,
                    "rol_id": rol_id,
                    "activo": True,
                }
            ).execute()

        result = self.find_by_id(perfil_id)
        if not result:
            raise ValueError("Usuario no encontrado")
        return result

    def restablecer_password(self, perfil_id: str, new_password: str) -> None:
        if not self.find_by_id(perfil_id):
            raise ValueError("Usuario no encontrado")

        client = get_supabase()
        try:
            client.auth.admin.update_user_by_id(perfil_id, {"password": new_password})
        except Exception as exc:
            raise ValueError("No se pudo actualizar la contrasena") from exc

    def _map_row(self, row: dict) -> dict:
        roles = row.get("usuarios_roles") or []
        active_role = next((r for r in roles if r.get("activo")), roles[0] if roles else None)
        rol_data = (active_role or {}).get("roles") or {}
        codigo = (rol_data.get("codigo") or "").upper()
        role_key = {
            "ADMINISTRADOR": "ADMIN",
            "APODERADO": "PARENT",
        }.get(codigo, codigo)
        return {
            "id": row["id"],
            "fullName": nombre_completo(row),
            "email": row.get("correo_institucional", ""),
            "phone": row.get("telefono") or "",
            "dni": row.get("dni") or "",
            "role": ROLE_MAP.get(role_key, ROLE_MAP.get(codigo, codigo)),
            "roleCode": codigo,
            "roleName": rol_data.get("nombre", ""),
            "status": estado_texto(row.get("estado", True)),
            "active": row.get("estado", True),
        }
