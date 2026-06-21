from datetime import date

from src.repository.helpers import (
    nombre_completo,
    normalizar_grado_nombre,
    obtener_cursos_docente,
    obtener_estudiantes_ids_por_docente,
)
from src.services.database import get_supabase


class DocenteDashboardRepository:
    def resumen(self, docente_id: str) -> dict:
        from src.repository.db_functions import DbFunctionError, call_object_function
        from src.services.db_connection import has_database_url

        if has_database_url():
            try:
                data = call_object_function(
                    "fn_dashboard_docente",
                    {"p_docente_id": docente_id},
                )
                if data and data.get("teacher"):
                    return data
                if data is not None and not data.get("teacher"):
                    raise ValueError("Docente no encontrado")
            except DbFunctionError:
                pass

        return self._resumen_supabase(docente_id)

    def _resumen_supabase(self, docente_id: str) -> dict:
        client = get_supabase()
        doc_resp = (
            client.table("docentes")
            .select(
                "id,codigo_docente,especialidad,cargo,grado_academico,"
                "perfiles(nombres,apellidos,correo_institucional,telefono)"
            )
            .eq("id", docente_id)
            .limit(1)
            .execute()
        )
        if not doc_resp.data:
            raise ValueError("Docente no encontrado")

        doc = doc_resp.data[0]
        perfil = doc.get("perfiles") or {}
        cursos = obtener_cursos_docente(docente_id)
        curso_ids = [c["id"] for c in cursos]
        estudiante_ids = obtener_estudiantes_ids_por_docente(docente_id)

        tareas_publicadas = 0
        entregas_pendientes = 0
        asistencia_hoy = 0
        notas_recientes = 0

        if curso_ids:
            estado_pub = (
                client.table("estados_tarea").select("id").eq("codigo", "PUBLICADA").limit(1).execute()
            )
            if estado_pub.data:
                tareas_resp = (
                    client.table("tareas")
                    .select("id", count="exact")
                    .eq("docente_id", docente_id)
                    .eq("estado_id", estado_pub.data[0]["id"])
                    .execute()
                )
                tareas_publicadas = tareas_resp.count or 0

            tarea_ids_resp = (
                client.table("tareas").select("id").eq("docente_id", docente_id).execute()
            )
            tarea_ids = [t["id"] for t in tarea_ids_resp.data or []]
            if tarea_ids:
                estado_pend = (
                    client.table("estados_entrega_tarea")
                    .select("id")
                    .eq("codigo", "PENDIENTE")
                    .limit(1)
                    .execute()
                )
                if estado_pend.data:
                    ent_resp = (
                        client.table("entregas_tareas")
                        .select("id", count="exact")
                        .in_("tarea_id", tarea_ids)
                        .eq("estado_id", estado_pend.data[0]["id"])
                        .execute()
                    )
                    entregas_pendientes = ent_resp.count or 0

            hoy = date.today().isoformat()
            asist_resp = (
                client.table("asistencia")
                .select("id", count="exact")
                .in_("curso_asignado_id", curso_ids)
                .eq("fecha", hoy)
                .execute()
            )
            asistencia_hoy = asist_resp.count or 0

            notas_resp = (
                client.table("calificaciones")
                .select("id", count="exact")
                .in_("curso_asignado_id", curso_ids)
                .execute()
            )
            notas_recientes = notas_resp.count or 0

        cursos_detalle = []
        if cursos:
            curso_ids = [c["id"] for c in cursos]
            curso_full_resp = (
                client.table("cursos_asignados")
                .select(
                    "id,"
                    "asignaturas(nombre,codigo),"
                    "secciones(nombre,aula,grados(nombre,niveles_educativos(nombre))),"
                    "anios_academicos(anio)"
                )
                .in_("id", curso_ids)
                .execute()
            )
            count_cache: dict[str, int] = {}
            for c in cursos:
                count_cache[c["id"]] = len(
                    obtener_estudiantes_ids_por_docente(docente_id, curso_id=c["id"])
                )
            for row in curso_full_resp.data or []:
                asig = row.get("asignaturas") or {}
                sec = row.get("secciones") or {}
                grado = sec.get("grados") or {}
                nivel = grado.get("niveles_educativos") or {}
                anio = row.get("anios_academicos") or {}
                cursos_detalle.append(
                    {
                        "id": row["id"],
                        "name": asig.get("nombre", ""),
                        "code": asig.get("codigo", ""),
                        "level": nivel.get("nombre", ""),
                        "grade": normalizar_grado_nombre(grado.get("nombre", "")),
                        "section": sec.get("nombre", ""),
                        "year": anio.get("anio", ""),
                        "classroom": sec.get("aula", ""),
                        "studentCount": count_cache.get(row["id"], 0),
                    }
                )

        return {
            "teacher": {
                "id": doc["id"],
                "code": doc.get("codigo_docente", ""),
                "fullName": nombre_completo(perfil),
                "email": perfil.get("correo_institucional", ""),
                "phone": perfil.get("telefono", ""),
                "specialty": doc.get("especialidad", ""),
                "position": doc.get("cargo", ""),
                "degree": doc.get("grado_academico", ""),
            },
            "summary": {
                "totalCourses": len(cursos),
                "totalStudents": len(estudiante_ids),
                "activeTasks": tareas_publicadas,
                "pendingSubmissions": entregas_pendientes,
                "attendanceToday": asistencia_hoy,
                "gradesRegistered": notas_recientes,
            },
            "courses": cursos_detalle,
        }
