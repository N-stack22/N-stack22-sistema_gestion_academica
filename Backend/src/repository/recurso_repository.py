from src.repository.helpers import (
    curso_pertenece_docente,
    normalizar_grado_nombre,
    nombre_completo,
    obtener_ids_cursos_docente,
    obtener_ids_cursos_estudiante,
)
from src.services.database import get_supabase
from src.services.storage_service import is_storage_reference, resolve_storage_url


class RecursoRepository:
    def listar(
        self,
        curso_id: str | None = None,
        docente_id: str | None = None,
        estudiante_id: str | None = None,
    ) -> list[dict]:
        client = get_supabase()
        query = client.table("recursos_academicos").select(
            "id,titulo,descripcion,estado,creado_en,"
            "archivos_recursos(archivo_url,nombre_archivo),"
            "tipos_recurso(codigo,nombre),"
            "cursos_asignados("
            "id,docente_id,asignaturas(nombre),"
            "docentes(codigo_docente,perfiles(nombres,apellidos)),"
            "secciones(nombre,grados(nombre))"
            ")"
        )
        if curso_id:
            query = query.eq("curso_asignado_id", curso_id)
        if estudiante_id:
            curso_ids = obtener_ids_cursos_estudiante(estudiante_id)
            if not curso_ids:
                return []
            query = query.in_("curso_asignado_id", curso_ids).eq("estado", True)
        elif docente_id:
            curso_ids = obtener_ids_cursos_docente(docente_id)
            if not curso_ids:
                return []
            query = query.in_("curso_asignado_id", curso_ids)
        response = query.order("creado_en", desc=True).execute()
        rows = []
        for r in response.data or []:
            if docente_id:
                curso = r.get("cursos_asignados") or {}
                if curso.get("docente_id") != docente_id:
                    continue
            if estudiante_id and not r.get("estado", True):
                continue
            rows.append(self._map_row(r))
        return rows

    def crear(self, data: dict) -> dict:
        client = get_supabase()
        docente_id = data.get("docente_id")
        curso_id = data["curso_asignado_id"]
        if docente_id and not curso_pertenece_docente(docente_id, curso_id):
            raise ValueError("No tiene permiso para publicar recursos en este curso.")
        archivo_url = (data.get("archivo_url") or "").strip()
        if not archivo_url:
            raise ValueError("Debe proporcionar una URL o un archivo para el recurso.")
        tipo_resp = (
            client.table("tipos_recurso")
            .select("id")
            .eq("codigo", data["tipo_recurso_codigo"].upper())
            .limit(1)
            .execute()
        )
        if not tipo_resp.data:
            raise ValueError("Tipo de recurso no encontrado")

        resp = (
            client.table("recursos_academicos")
            .insert(
                {
                    "titulo": data["titulo"],
                    "descripcion": data.get("descripcion"),
                    "curso_asignado_id": data["curso_asignado_id"],
                    "tipo_recurso_id": tipo_resp.data[0]["id"],
                    "estado": data.get("estado", True),
                }
            )
            .execute()
        )
        if not resp.data:
            raise ValueError("No se pudo crear el recurso")

        recurso_id = resp.data[0]["id"]
        client.table("archivos_recursos").insert(
            {
                "recurso_id": recurso_id,
                "archivo_url": archivo_url,
                "nombre_archivo": (data.get("nombre_archivo") or data.get("titulo") or "").strip() or None,
            }
        ).execute()

        items = self.listar(curso_id=data["curso_asignado_id"])
        return next((i for i in items if i["id"] == recurso_id), items[0])

    def archivar(self, recurso_id: str) -> dict:
        client = get_supabase()
        check = (
            client.table("recursos_academicos")
            .select("id,estado")
            .eq("id", recurso_id)
            .limit(1)
            .execute()
        )
        if not check.data:
            raise ValueError("Recurso no encontrado")
        if not check.data[0].get("estado"):
            raise ValueError("El recurso ya está archivado")

        client.table("recursos_academicos").update({"estado": False}).eq("id", recurso_id).execute()
        items = self.listar()
        return next((i for i in items if i["id"] == recurso_id), {})

    def desarchivar(self, recurso_id: str) -> dict:
        client = get_supabase()
        check = (
            client.table("recursos_academicos")
            .select("id,estado")
            .eq("id", recurso_id)
            .limit(1)
            .execute()
        )
        if not check.data:
            raise ValueError("Recurso no encontrado")
        if check.data[0].get("estado"):
            raise ValueError("El recurso ya está disponible")

        client.table("recursos_academicos").update({"estado": True}).eq("id", recurso_id).execute()
        items = self.listar()
        return next((i for i in items if i["id"] == recurso_id), {})

    def actualizar(self, recurso_id: str, data: dict) -> dict:
        client = get_supabase()
        check = (
            client.table("recursos_academicos")
            .select("id")
            .eq("id", recurso_id)
            .limit(1)
            .execute()
        )
        if not check.data:
            raise ValueError("Recurso no encontrado")

        update_data: dict = {}
        if data.get("titulo") is not None:
            update_data["titulo"] = data["titulo"].strip()
        if "descripcion" in data:
            update_data["descripcion"] = data.get("descripcion")
        if data.get("curso_asignado_id"):
            update_data["curso_asignado_id"] = data["curso_asignado_id"]
        if data.get("tipo_recurso_codigo"):
            tipo_resp = (
                client.table("tipos_recurso")
                .select("id")
                .eq("codigo", data["tipo_recurso_codigo"].upper())
                .limit(1)
                .execute()
            )
            if not tipo_resp.data:
                raise ValueError("Tipo de recurso no encontrado")
            update_data["tipo_recurso_id"] = tipo_resp.data[0]["id"]

        if not update_data and data.get("archivo_url") is None:
            raise ValueError("No hay datos para actualizar")

        if update_data:
            client.table("recursos_academicos").update(update_data).eq("id", recurso_id).execute()

        archivo_url = (data.get("archivo_url") or "").strip() if data.get("archivo_url") is not None else None
        if archivo_url:
            nombre_archivo = (data.get("nombre_archivo") or "").strip() or None
            existing = (
                client.table("archivos_recursos")
                .select("id")
                .eq("recurso_id", recurso_id)
                .limit(1)
                .execute()
            )
            payload = {"archivo_url": archivo_url}
            if nombre_archivo:
                payload["nombre_archivo"] = nombre_archivo
            if existing.data:
                client.table("archivos_recursos").update(payload).eq("id", existing.data[0]["id"]).execute()
            else:
                client.table("archivos_recursos").insert(
                    {"recurso_id": recurso_id, **payload}
                ).execute()

        items = self.listar()
        return next((i for i in items if i["id"] == recurso_id), {})

    def _map_row(self, row: dict) -> dict:
        tipo = row.get("tipos_recurso") or {}
        curso = row.get("cursos_asignados") or {}
        asig = curso.get("asignaturas") or {}
        doc = curso.get("docentes") or {}
        doc_perfil = doc.get("perfiles") or {}
        doc_nombre = nombre_completo(doc_perfil)
        doc_codigo = doc.get("codigo_docente", "")
        sec = curso.get("secciones") or {}
        grado = sec.get("grados") or {}
        asig_nombre = asig.get("nombre", "")
        grado_nombre = normalizar_grado_nombre(grado.get("nombre", ""))
        sec_nombre = sec.get("nombre", "")
        docente_txt = f"{doc_nombre} ({doc_codigo})" if doc_codigo else doc_nombre or "Sin docente"
        course_label = f"{asig_nombre} — Doc. {docente_txt} — {grado_nombre} {sec_nombre}".strip()
        fecha = str(row.get("creado_en", ""))[:10]
        activo = bool(row.get("estado"))
        archivos = row.get("archivos_recursos") or []
        archivo = archivos[0] if archivos else {}
        archivo_url = (archivo.get("archivo_url") or "").strip()
        nombre_archivo = (archivo.get("nombre_archivo") or "").strip()
        storage_ref = archivo_url if is_storage_reference(archivo_url) else ""
        public_file_url = resolve_storage_url(archivo_url) if archivo_url else ""
        return {
            "id": row["id"],
            "title": row.get("titulo", ""),
            "description": row.get("descripcion", ""),
            "courseId": curso.get("id", ""),
            "course": asig_nombre,
            "courseLabel": course_label,
            "type": tipo.get("nombre", ""),
            "typeCode": tipo.get("codigo", ""),
            "date": fecha,
            "active": activo,
            "statusCode": "DISPONIBLE" if activo else "ARCHIVADO",
            "status": "Disponible" if activo else "Archivado",
            "fileUrl": public_file_url,
            "fileStorageRef": storage_ref,
            "fileName": nombre_archivo or archivo_url,
        }
