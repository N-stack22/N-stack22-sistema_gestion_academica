from datetime import date, datetime

from src.repository.helpers import (
    nombre_completo,
    normalizar_grado_nombre,
    obtener_contexto_academico_estudiante,
    obtener_ids_cursos_estudiante,
    obtener_matricula_activa,
)
from src.services.database import get_supabase

DIAS = {1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo"}


class EstudianteDashboardRepository:
    def resumen(self, estudiante_id: str) -> dict:
        client = get_supabase()
        est_resp = (
            client.table("estudiantes")
            .select("id,codigo_estudiante,perfiles(nombres,apellidos,correo_institucional,telefono,dni)")
            .eq("id", estudiante_id)
            .limit(1)
            .execute()
        )
        if not est_resp.data:
            raise ValueError("Estudiante no encontrado")

        est = est_resp.data[0]
        perfil = est.get("perfiles") or {}
        ctx = obtener_contexto_academico_estudiante(estudiante_id)
        curso_ids = obtener_ids_cursos_estudiante(estudiante_id)

        promedio = 0.0
        notas_count = 0
        asistencia_pct = 0
        presentes = 0
        total_asist = 0
        tareas_pendientes = 0
        pensiones_pendientes = 0
        ultima_observacion = ""
        proxima_clase = None

        if curso_ids:
            notas_resp = (
                client.table("calificaciones")
                .select("nota,peso")
                .eq("estudiante_id", estudiante_id)
                .in_("curso_asignado_id", curso_ids)
                .execute()
            )
            suma_peso = 0.0
            suma_nota = 0.0
            for n in notas_resp.data or []:
                peso = float(n.get("peso") or 1)
                nota = float(n.get("nota") or 0)
                suma_nota += nota * peso
                suma_peso += peso
            notas_count = len(notas_resp.data or [])
            if suma_peso > 0:
                promedio = round(suma_nota / suma_peso, 2)

            asist_resp = (
                client.table("asistencia")
                .select("id,estados_asistencia(codigo)")
                .eq("estudiante_id", estudiante_id)
                .in_("curso_asignado_id", curso_ids)
                .execute()
            )
            for a in asist_resp.data or []:
                total_asist += 1
                codigo = (a.get("estados_asistencia") or {}).get("codigo", "")
                if codigo in ("PRESENTE", "TARDE", "JUSTIFICADO"):
                    presentes += 1
            if total_asist:
                asistencia_pct = round((presentes / total_asist) * 100)

            tarea_ids_resp = (
                client.table("tareas")
                .select("id")
                .in_("curso_asignado_id", curso_ids)
                .execute()
            )
            tarea_ids = [t["id"] for t in tarea_ids_resp.data or []]
            if tarea_ids:
                entregas_resp = (
                    client.table("entregas_tareas")
                    .select("tarea_id")
                    .eq("estudiante_id", estudiante_id)
                    .in_("tarea_id", tarea_ids)
                    .execute()
                )
                entregadas = {e["tarea_id"] for e in entregas_resp.data or []}
                tareas_pendientes = len([t for t in tarea_ids if t not in entregadas])

            horarios_resp = (
                client.table("horarios")
                .select("dia_semana,hora_inicio,hora_fin,aula,cursos_asignados(asignaturas(nombre))")
                .in_("curso_asignado_id", curso_ids)
                .execute()
            )
            hoy = date.today()
            dia_hoy = hoy.isoweekday()
            ahora = datetime.now().strftime("%H:%M")
            candidatos = []
            for h in horarios_resp.data or []:
                dia = h.get("dia_semana", 0)
                inicio = str(h.get("hora_inicio", ""))[:5]
                if dia == dia_hoy and inicio >= ahora:
                    asig = (h.get("cursos_asignados") or {}).get("asignaturas") or {}
                    candidatos.append((inicio, asig.get("nombre", ""), h.get("aula", "")))
            if candidatos:
                candidatos.sort()
                proxima_clase = {
                    "time": candidatos[0][0],
                    "course": candidatos[0][1],
                    "classroom": candidatos[0][2] or "",
                }

        pen_resp = (
            client.table("pensiones")
            .select("id,estados_pago(codigo)")
            .eq("estudiante_id", estudiante_id)
            .execute()
        )
        for p in pen_resp.data or []:
            if (p.get("estados_pago") or {}).get("codigo", "").upper() == "PENDIENTE":
                pensiones_pendientes += 1

        seg_resp = (
            client.table("seguimiento_academico")
            .select("observacion,ultima_comunicacion")
            .eq("estudiante_id", estudiante_id)
            .order("ultima_comunicacion", desc=True)
            .limit(1)
            .execute()
        )
        if seg_resp.data:
            ultima_observacion = (seg_resp.data[0].get("observacion") or "").strip()

        cursos_detalle = []
        if ctx and curso_ids:
            for cid in curso_ids:
                curso_full = (
                    client.table("cursos_asignados")
                    .select(
                        "id,asignaturas(nombre),"
                        "docentes(codigo_docente,perfiles(nombres,apellidos))"
                    )
                    .eq("id", cid)
                    .limit(1)
                    .execute()
                )
                if not curso_full.data:
                    continue
                row = curso_full.data[0]
                asig = row.get("asignaturas") or {}
                doc = row.get("docentes") or {}
                cursos_detalle.append(
                    {
                        "id": row["id"],
                        "name": asig.get("nombre", ""),
                        "teacher": nombre_completo(doc.get("perfiles")),
                    }
                )

        return {
            "student": {
                "id": est["id"],
                "code": est.get("codigo_estudiante", ""),
                "fullName": nombre_completo(perfil),
                "email": perfil.get("correo_institucional", ""),
                "phone": perfil.get("telefono", ""),
                "dni": perfil.get("dni", ""),
            },
            "enrollment": ctx,
            "summary": {
                "totalCourses": len(curso_ids),
                "generalAverage": promedio,
                "gradesCount": notas_count,
                "pendingTasks": tareas_pendientes,
                "pendingPensions": pensiones_pendientes,
                "attendancePercent": asistencia_pct,
                "attendancePresent": presentes,
                "attendanceTotal": total_asist,
            },
            "courses": cursos_detalle,
            "nextClass": proxima_clase,
            "lastFollowUpNote": ultima_observacion,
            "hasActiveEnrollment": ctx is not None,
        }
