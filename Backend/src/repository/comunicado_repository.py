from datetime import datetime

from src.repository.helpers import (
    normalizar_grado_nombre,
    obtener_contexto_academico_estudiante,
    obtener_cursos_docente,
    obtener_rol_id,
)
from src.services.database import get_supabase


class ComunicadoRepository:
    def find_all(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("comunicados")
            .select("id,titulo,contenido,publicado_en,creado_en,roles(codigo,nombre)")
            .eq("publicado", True)
            .order("publicado_en", desc=True)
            .execute()
        )
        return [self._map_row(row) for row in response.data or []]

    def find_all_admin(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("comunicados")
            .select(
                "id,titulo,contenido,publicado,publicado_en,archivo_url,"
                "roles(codigo,nombre),niveles_educativos(nombre),grados(nombre),secciones(nombre)"
            )
            .order("creado_en", desc=True)
            .execute()
        )
        return [self._map_admin_row(row) for row in response.data or []]

    def find_for_docente(self, docente_id: str) -> list[dict]:
        client = get_supabase()
        cursos = obtener_cursos_docente(docente_id)
        seccion_ids: set[str] = set()
        grado_ids: set[str] = set()
        nivel_ids: set[str] = set()
        for curso in cursos:
            if curso.get("seccion_id"):
                seccion_ids.add(curso["seccion_id"])
            sec_resp = (
                client.table("secciones")
                .select("id,grado_id,grados(nivel_id)")
                .eq("id", curso["seccion_id"])
                .limit(1)
                .execute()
            )
            if sec_resp.data:
                sec = sec_resp.data[0]
                if sec.get("grado_id"):
                    grado_ids.add(sec["grado_id"])
                grado = sec.get("grados") or {}
                if grado.get("nivel_id"):
                    nivel_ids.add(grado["nivel_id"])

        docente_rol_id = obtener_rol_id("DOCENTE")
        response = (
            client.table("comunicados")
            .select(
                "id,titulo,contenido,publicado,publicado_en,archivo_url,"
                "rol_destinatario_id,nivel_id,grado_id,seccion_id,"
                "roles(codigo,nombre),niveles_educativos(nombre),grados(nombre),secciones(nombre)"
            )
            .eq("publicado", True)
            .order("publicado_en", desc=True)
            .execute()
        )
        rows = []
        for row in response.data or []:
            rol_id = row.get("rol_destinatario_id")
            nivel_id = row.get("nivel_id")
            grado_id = row.get("grado_id")
            seccion_id = row.get("seccion_id")
            es_global = not rol_id and not nivel_id and not grado_id and not seccion_id
            es_para_docente = docente_rol_id and rol_id == docente_rol_id
            es_para_seccion = seccion_id and seccion_id in seccion_ids
            es_para_grado = grado_id and grado_id in grado_ids
            es_para_nivel = nivel_id and nivel_id in nivel_ids
            if es_global or es_para_docente or es_para_seccion or es_para_grado or es_para_nivel:
                rows.append(self._map_admin_row(row))
        return rows

    def find_for_estudiante(self, estudiante_id: str) -> list[dict]:
        client = get_supabase()
        ctx = obtener_contexto_academico_estudiante(estudiante_id)
        if not ctx:
            return []

        seccion_id = ctx.get("seccion_id")
        grado_id = ctx.get("grado_id")
        nivel_id = ctx.get("nivel_id")
        estudiante_rol_id = obtener_rol_id("ESTUDIANTE")

        response = (
            client.table("comunicados")
            .select(
                "id,titulo,contenido,publicado,publicado_en,archivo_url,"
                "rol_destinatario_id,nivel_id,grado_id,seccion_id,"
                "roles(codigo,nombre),niveles_educativos(nombre),grados(nombre),secciones(nombre)"
            )
            .eq("publicado", True)
            .order("publicado_en", desc=True)
            .execute()
        )
        rows = []
        for row in response.data or []:
            rol_id = row.get("rol_destinatario_id")
            row_nivel = row.get("nivel_id")
            row_grado = row.get("grado_id")
            row_seccion = row.get("seccion_id")
            es_global = not rol_id and not row_nivel and not row_grado and not row_seccion
            es_para_estudiante = estudiante_rol_id and rol_id == estudiante_rol_id
            es_para_seccion = row_seccion and row_seccion == seccion_id
            es_para_grado = row_grado and row_grado == grado_id
            es_para_nivel = row_nivel and row_nivel == nivel_id
            if es_global or es_para_estudiante or es_para_seccion or es_para_grado or es_para_nivel:
                rows.append(self._map_admin_row(row))
        return rows

    def find_for_apoderado(self, estudiante_id: str) -> list[dict]:
        """Comunicados visibles para padre: rol APODERADO, alcance del hijo y generales."""
        client = get_supabase()
        ctx = obtener_contexto_academico_estudiante(estudiante_id)
        if not ctx:
            return []

        seccion_id = ctx.get("seccion_id")
        grado_id = ctx.get("grado_id")
        nivel_id = ctx.get("nivel_id")
        apoderado_rol_id = obtener_rol_id("APODERADO")
        estudiante_rol_id = obtener_rol_id("ESTUDIANTE")

        response = (
            client.table("comunicados")
            .select(
                "id,titulo,contenido,publicado,publicado_en,archivo_url,"
                "rol_destinatario_id,nivel_id,grado_id,seccion_id,"
                "roles(codigo,nombre),niveles_educativos(nombre),grados(nombre),secciones(nombre)"
            )
            .eq("publicado", True)
            .order("publicado_en", desc=True)
            .execute()
        )
        rows = []
        for row in response.data or []:
            rol_id = row.get("rol_destinatario_id")
            row_nivel = row.get("nivel_id")
            row_grado = row.get("grado_id")
            row_seccion = row.get("seccion_id")
            es_global = not rol_id and not row_nivel and not row_grado and not row_seccion
            es_para_apoderado = apoderado_rol_id and rol_id == apoderado_rol_id
            es_para_estudiante = estudiante_rol_id and rol_id == estudiante_rol_id
            es_para_seccion = row_seccion and row_seccion == seccion_id
            es_para_grado = row_grado and row_grado == grado_id
            es_para_nivel = row_nivel and row_nivel == nivel_id
            if (
                es_global
                or es_para_apoderado
                or es_para_estudiante
                or es_para_seccion
                or es_para_grado
                or es_para_nivel
            ):
                rows.append(self._map_admin_row(row))
        return rows

    def obtener(self, comunicado_id: str) -> dict | None:
        client = get_supabase()
        response = (
            client.table("comunicados")
            .select(
                "id,titulo,contenido,publicado,publicado_en,archivo_url,"
                "roles(codigo,nombre),niveles_educativos(nombre),grados(nombre),secciones(nombre)"
            )
            .eq("id", comunicado_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return self._map_admin_row(response.data[0])

    def actualizar(self, comunicado_id: str, data: dict) -> dict:
        client = get_supabase()
        if not self.obtener(comunicado_id):
            raise ValueError("Comunicado no encontrado")

        update_data: dict = {}
        if data.get("titulo") is not None:
            update_data["titulo"] = data["titulo"]
        if data.get("contenido") is not None:
            update_data["contenido"] = data["contenido"]
        if data.get("archivo_url") is not None:
            update_data["archivo_url"] = data["archivo_url"]
        if data.get("publicado") is not None:
            update_data["publicado"] = data["publicado"]
        if "rol_destinatario_codigo" in data:
            codigo = data["rol_destinatario_codigo"]
            if codigo:
                rol = (
                    client.table("roles")
                    .select("id")
                    .eq("codigo", codigo.upper())
                    .limit(1)
                    .execute()
                )
                if not rol.data:
                    raise ValueError("Rol destinatario no encontrado")
                update_data["rol_destinatario_id"] = rol.data[0]["id"]
            else:
                update_data["rol_destinatario_id"] = None
        if "nivel_id" in data:
            update_data["nivel_id"] = data["nivel_id"] or None
        if "grado_id" in data:
            update_data["grado_id"] = data["grado_id"] or None
        if "seccion_id" in data:
            update_data["seccion_id"] = data["seccion_id"] or None

        if update_data:
            client.table("comunicados").update(update_data).eq("id", comunicado_id).execute()

        result = self.obtener(comunicado_id)
        if not result:
            raise ValueError("Comunicado no encontrado")
        return result

    def eliminar(self, comunicado_id: str) -> None:
        client = get_supabase()
        if not self.obtener(comunicado_id):
            raise ValueError("Comunicado no encontrado")
        client.table("comunicados").delete().eq("id", comunicado_id).execute()

    def crear(self, data: dict) -> dict:
        client = get_supabase()
        insert_data = {
            "autor_id": data["autor_id"],
            "titulo": data["titulo"],
            "contenido": data["contenido"],
            "archivo_url": data.get("archivo_url"),
            "publicado": data.get("publicado", True),
        }
        if data.get("rol_destinatario_codigo"):
            rol = (
                client.table("roles")
                .select("id")
                .eq("codigo", data["rol_destinatario_codigo"].upper())
                .limit(1)
                .execute()
            )
            if rol.data:
                insert_data["rol_destinatario_id"] = rol.data[0]["id"]
        if data.get("nivel_id"):
            insert_data["nivel_id"] = data["nivel_id"]
        if data.get("grado_id"):
            insert_data["grado_id"] = data["grado_id"]
        if data.get("seccion_id"):
            insert_data["seccion_id"] = data["seccion_id"]

        resp = client.table("comunicados").insert(insert_data).execute()
        if not resp.data:
            raise ValueError("No se pudo crear el comunicado")
        result = self.obtener(resp.data[0]["id"])
        if not result:
            raise ValueError("No se pudo crear el comunicado")
        return result

    def _map_row(self, row: dict) -> dict:
        fecha = row.get("publicado_en") or row.get("creado_en")
        date_text = ""
        if fecha:
            try:
                date_text = datetime.fromisoformat(fecha.replace("Z", "+00:00")).strftime("%d %b %Y")
            except ValueError:
                date_text = str(fecha)[:10]

        rol = row.get("roles") or {}
        audience = rol.get("nombre") or "Comunidad educativa"
        contenido = row.get("contenido") or ""

        return {
            "id": row["id"],
            "title": row.get("titulo", ""),
            "date": date_text,
            "audience": audience,
            "summary": contenido[:160] + ("..." if len(contenido) > 160 else ""),
        }

    def _map_admin_row(self, row: dict) -> dict:
        rol = row.get("roles") or {}
        nivel = row.get("niveles_educativos") or {}
        grado = row.get("grados") or {}
        seccion = row.get("secciones") or {}
        destino = (
            rol.get("nombre")
            or nivel.get("nombre")
            or normalizar_grado_nombre(grado.get("nombre", ""))
            or seccion.get("nombre")
            or "Todos"
        )
        return {
            "id": row["id"],
            "title": row.get("titulo", ""),
            "content": row.get("contenido", ""),
            "audience": destino,
            "audienceRoleCode": rol.get("codigo", "") or "",
            "status": "Publicado" if row.get("publicado") else "Borrador",
            "date": str(row.get("publicado_en") or "")[:10],
            "fileUrl": row.get("archivo_url", ""),
        }
