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
        for c in cursos:
            curso_full = (
                client.table("cursos_asignados")
                .select(
                    "id,"
                    "asignaturas(nombre,codigo),"
                    "secciones(nombre,aula,grados(nombre,niveles_educativos(nombre))),"
                    "anios_academicos(anio)"
                )
                .eq("id", c["id"])
                .limit(1)
                .execute()
            )
            if not curso_full.data:
                continue
            row = curso_full.data[0]
            asig = row.get("asignaturas") or {}
            sec = row.get("secciones") or {}
            grado = sec.get("grados") or {}
            nivel = grado.get("niveles_educativos") or {}
            anio = row.get("anios_academicos") or {}
            est_count = len(obtener_estudiantes_ids_por_docente(docente_id, curso_id=c["id"]))
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
                    "studentCount": est_count,
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
