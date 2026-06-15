from src.repository.helpers import (
    curso_pertenece_docente,
    obtener_estudiantes_ids_por_docente,
    obtener_ids_cursos_docente,
    nombre_completo,
)
from src.services.database import get_supabase


class AsistenciaRepository:
    def listar(
        self,
        curso_id: str | None = None,
        estudiante_id: str | None = None,
        fecha: str | None = None,
        docente_id: str | None = None,
    ) -> list[dict]:
        client = get_supabase()
        query = client.table("asistencia").select(
            "id,fecha,observacion,curso_asignado_id,"
            "estudiantes(id,codigo_estudiante,perfiles(nombres,apellidos)),"
            "cursos_asignados(asignaturas(nombre),secciones(nombre),docente_id),"
            "estados_asistencia(nombre,codigo)"
        )
        if curso_id:
            query = query.eq("curso_asignado_id", curso_id)
        if estudiante_id:
            query = query.eq("estudiante_id", estudiante_id)
        if fecha:
            query = query.eq("fecha", fecha)
        if docente_id:
            curso_ids = obtener_ids_cursos_docente(docente_id)
            if not curso_ids:
                return []
            query = query.in_("curso_asignado_id", curso_ids)
        response = query.execute()
        rows = []
        for r in response.data or []:
            if docente_id:
                curso = r.get("cursos_asignados") or {}
                if curso.get("docente_id") != docente_id:
                    continue
            rows.append(self._map_row(r))
        return rows

    def registrar(self, data: dict) -> dict:
        client = get_supabase()
        docente_id = data.get("registrado_por_docente_id")
        curso_id = data["curso_asignado_id"]
        if docente_id and not curso_pertenece_docente(docente_id, curso_id):
            raise ValueError("No tiene permiso para registrar asistencia en este curso.")
        estudiante_id = data["estudiante_id"]
        if docente_id:
            permitidos = obtener_estudiantes_ids_por_docente(docente_id, curso_id=curso_id)
            if estudiante_id not in permitidos:
                raise ValueError("El estudiante no pertenece a la sección del curso.")

        existing = (
            client.table("asistencia")
            .select("id")
            .eq("estudiante_id", estudiante_id)
            .eq("curso_asignado_id", curso_id)
            .eq("fecha", data["fecha"])
            .limit(1)
            .execute()
        )
        estado_resp = (
            client.table("estados_asistencia")
            .select("id")
            .eq("codigo", data["estado_codigo"].upper())
            .limit(1)
            .execute()
        )
        if not estado_resp.data:
            raise ValueError("Estado de asistencia no encontrado")

        insert_data = {
            "estudiante_id": estudiante_id,
            "curso_asignado_id": curso_id,
            "estado_id": estado_resp.data[0]["id"],
            "fecha": data["fecha"],
            "observacion": data.get("observacion"),
            "registrado_por_docente_id": docente_id,
        }
        if existing.data:
            client.table("asistencia").update(insert_data).eq("id", existing.data[0]["id"]).execute()
        else:
            resp = client.table("asistencia").insert(insert_data).execute()
            if not resp.data:
                raise ValueError("No se pudo registrar asistencia")
        return self.listar(curso_id=curso_id, fecha=data["fecha"])[0]

    def actualizar(self, asistencia_id: str, data: dict) -> dict:
        client = get_supabase()
        check = (
            client.table("asistencia")
            .select("id,estudiante_id,curso_asignado_id,fecha")
            .eq("id", asistencia_id)
            .limit(1)
            .execute()
        )
        if not check.data:
            raise ValueError("Registro de asistencia no encontrado")
        row = check.data[0]
        docente_id = data.get("registrado_por_docente_id")
        if docente_id and not curso_pertenece_docente(docente_id, row["curso_asignado_id"]):
            raise ValueError("No tiene permiso para editar esta asistencia.")

        update_data: dict = {}
        if data.get("estado_codigo"):
            estado_resp = (
                client.table("estados_asistencia")
                .select("id")
                .eq("codigo", data["estado_codigo"].upper())
                .limit(1)
                .execute()
            )
            if not estado_resp.data:
                raise ValueError("Estado de asistencia no encontrado")
            update_data["estado_id"] = estado_resp.data[0]["id"]
        if "observacion" in data:
            update_data["observacion"] = data.get("observacion")
        if not update_data:
            raise ValueError("No hay datos para actualizar")
        client.table("asistencia").update(update_data).eq("id", asistencia_id).execute()
        items = self.listar(curso_id=row["curso_asignado_id"], fecha=row["fecha"])
        return next((i for i in items if i["id"] == asistencia_id), items[0] if items else {})

    def _map_row(self, row: dict) -> dict:
        est = row.get("estudiantes") or {}
        curso = row.get("cursos_asignados") or {}
        asig = curso.get("asignaturas") or {}
        sec = curso.get("secciones") or {}
        estado = row.get("estados_asistencia") or {}
        return {
            "id": row["id"],
            "studentName": nombre_completo(est.get("perfiles")),
            "studentCode": est.get("codigo_estudiante", ""),
            "studentId": est.get("id", ""),
            "courseId": row.get("curso_asignado_id", ""),
            "course": asig.get("nombre", ""),
            "section": sec.get("nombre", ""),
            "date": str(row.get("fecha", "")),
            "status": estado.get("nombre", ""),
            "statusCode": estado.get("codigo", ""),
            "notes": row.get("observacion", ""),
        }
