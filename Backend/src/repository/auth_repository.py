from src.repository.helpers import normalizar_grado_nombre
from src.services.database import create_supabase_client, get_supabase

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


class AuthRepository:
    def login(self, email: str, password: str) -> dict:
        auth_client = create_supabase_client()
        auth_response = auth_client.auth.sign_in_with_password(
            {"email": email, "password": password}
        )

        client = get_supabase()

        user = auth_response.user
        session = auth_response.session
        if not user or not session:
            raise ValueError("Credenciales invalidas")

        perfil_resp = (
            client.table("perfiles")
            .select("id,nombres,apellidos,correo_institucional,foto_url,estado")
            .eq("id", user.id)
            .limit(1)
            .execute()
        )

        if not perfil_resp.data:
            raise ValueError("Usuario sin perfil institucional asignado. Contacte a administracion.")

        perfil = perfil_resp.data[0]
        if perfil.get("estado") is False:
            raise ValueError("El usuario esta inactivo")

        roles_resp = (
            client.table("usuarios_roles")
            .select("roles(codigo,nombre)")
            .eq("perfil_id", user.id)
            .eq("activo", True)
            .limit(1)
            .execute()
        )

        if not roles_resp.data:
            raise ValueError("Usuario sin rol institucional asignado. Contacte a administracion.")

        rol_data = roles_resp.data[0].get("roles") or {}
        codigo = (rol_data.get("codigo") or "").upper()
        role = ROLE_MAP.get(codigo)
        if not role:
            raise ValueError(f"Rol '{codigo}' no soportado en el frontend")

        return {
            "id": user.id,
            "fullName": f"{perfil.get('nombres', '').strip()} {perfil.get('apellidos', '').strip()}".strip(),
            "email": perfil.get("correo_institucional") or user.email or email,
            "role": role,
            "accessToken": session.access_token,
        }

    def me(self, access_token: str) -> dict:
        client = get_supabase()
        user_response = client.auth.get_user(access_token)
        user = user_response.user
        if not user:
            raise ValueError("Sesion invalida")

        perfil_resp = (
            client.table("perfiles")
            .select("id,nombres,apellidos,correo_institucional,foto_url,estado")
            .eq("id", user.id)
            .limit(1)
            .execute()
        )
        if not perfil_resp.data:
            raise ValueError("Perfil no encontrado")

        perfil = perfil_resp.data[0]
        roles_resp = (
            client.table("usuarios_roles")
            .select("roles(codigo,nombre)")
            .eq("perfil_id", user.id)
            .eq("activo", True)
            .limit(1)
            .execute()
        )
        if not roles_resp.data:
            raise ValueError("Rol no encontrado")

        codigo = ((roles_resp.data[0].get("roles") or {}).get("codigo") or "").upper()
        role = ROLE_MAP.get(codigo)
        if not role:
            raise ValueError(f"Rol '{codigo}' no soportado")

        return {
            "id": user.id,
            "fullName": f"{perfil.get('nombres', '').strip()} {perfil.get('apellidos', '').strip()}".strip(),
            "email": perfil.get("correo_institucional") or user.email,
            "role": role,
            "accessToken": access_token,
        }

    def context(self, access_token: str) -> dict:
        user_data = self.me(access_token)
        client = get_supabase()
        user_id = user_data["id"]
        role = user_data["role"]
        ctx: dict = {"user": user_data}

        if role == "STUDENT":
            est = (
                client.table("estudiantes")
                .select(
                    "id,codigo_estudiante,"
                    "matriculas(secciones(nombre,grados(nombre,niveles_educativos(nombre))))"
                )
                .eq("perfil_id", user_id)
                .limit(1)
                .execute()
            )
            if est.data:
                row = est.data[0]
                mat = (row.get("matriculas") or [{}])[-1]
                sec = mat.get("secciones") or {}
                grado = sec.get("grados") or {}
                nivel = grado.get("niveles_educativos") or {}
                ctx["student"] = {
                    "id": row["id"],
                    "fullName": user_data["fullName"],
                    "code": row.get("codigo_estudiante", ""),
                    "level": nivel.get("nombre", ""),
                    "grade": normalizar_grado_nombre(grado.get("nombre", "")),
                    "section": sec.get("nombre", ""),
                }

        if role == "PARENT":
            ap = (
                client.table("apoderados")
                .select(
                    "id,perfiles(telefono),"
                    "apoderado_estudiante(parentesco,es_principal,"
                    "estudiantes(id,codigo_estudiante,perfiles(nombres,apellidos),"
                    "matriculas(secciones(nombre,grados(nombre,niveles_educativos(nombre)))))))"
                )
                .eq("perfil_id", user_id)
                .limit(1)
                .execute()
            )
            if ap.data:
                row = ap.data[0]
                perfil = row.get("perfiles") or {}
                links = row.get("apoderado_estudiante") or []
                students = []
                for link in links:
                    est = link.get("estudiantes") or {}
                    ep = est.get("perfiles") or {}
                    mat = (est.get("matriculas") or [{}])[-1]
                    sec = mat.get("secciones") or {}
                    grado = sec.get("grados") or {}
                    nivel = grado.get("niveles_educativos") or {}
                    students.append(
                        {
                            "id": est.get("id"),
                            "fullName": f"{ep.get('nombres', '')} {ep.get('apellidos', '')}".strip(),
                            "code": est.get("codigo_estudiante", ""),
                            "level": nivel.get("nombre", ""),
                            "grade": normalizar_grado_nombre(grado.get("nombre", "")),
                            "section": sec.get("nombre", ""),
                            "relationship": link.get("parentesco", ""),
                            "isPrimary": link.get("es_principal", False),
                        }
                    )
                primary = next((s for s in students if s.get("isPrimary")), students[0] if students else None)
                ctx["family"] = {
                    "guardianName": user_data["fullName"],
                    "phone": perfil.get("telefono", ""),
                    "email": user_data["email"],
                    "relationship": primary.get("relationship", "") if primary else "",
                    "student": primary,
                    "students": students,
                }
                if primary:
                    ctx["student"] = primary

        if role == "TEACHER":
            doc = (
                client.table("docentes")
                .select("id,cursos_asignados(id,asignaturas(nombre))")
                .eq("perfil_id", user_id)
                .limit(1)
                .execute()
            )
            if doc.data:
                ctx["teacher"] = {
                    "id": doc.data[0]["id"],
                    "courses": [
                        {
                            "id": c.get("id"),
                            "name": (c.get("asignaturas") or {}).get("nombre", ""),
                        }
                        for c in doc.data[0].get("cursos_asignados") or []
                    ],
                }

        return ctx

    def change_password(
        self,
        user_id: str,
        email: str,
        current_password: str,
        new_password: str,
    ) -> None:
        if current_password == new_password:
            raise ValueError("La nueva contrasena debe ser distinta a la actual")

        verify_client = create_supabase_client()
        try:
            auth_response = verify_client.auth.sign_in_with_password(
                {"email": email, "password": current_password}
            )
            if not auth_response.user:
                raise ValueError("Contrasena actual incorrecta")
        except Exception as exc:
            raise ValueError("Contrasena actual incorrecta") from exc

        client = get_supabase()
        try:
            client.auth.admin.update_user_by_id(user_id, {"password": new_password})
        except Exception as exc:
            raise ValueError("No se pudo actualizar la contrasena") from exc
