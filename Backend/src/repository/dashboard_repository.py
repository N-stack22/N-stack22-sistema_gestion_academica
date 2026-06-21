from src.repository.helpers import nombre_completo, obtener_anio_activo
from src.services.database import get_supabase


class DashboardRepository:
    def resumen_completo(self) -> dict:
        from src.repository.db_functions import DbFunctionError, call_object_function
        from src.services.db_connection import has_database_url

        if has_database_url():
            try:
                data = call_object_function("fn_dashboard_admin", {})
                if data and data.get("summary"):
                    activities = data.get("activities") or []
                    if isinstance(activities, list):
                        data["activities"] = activities[:5]
                    return data
            except DbFunctionError:
                pass

        return {
            "summary": self.get_summary(),
            "activities": self.get_recent_activities(),
            "events": self.get_upcoming_events(),
        }

    def get_summary(self) -> dict:
        client = get_supabase()
        estudiantes = client.table("estudiantes").select("id", count="exact").execute()
        docentes = client.table("docentes").select("id", count="exact").execute()
        cursos = client.table("cursos_asignados").select("id", count="exact").execute()
        matriculas = client.table("matriculas").select("id", count="exact").execute()
        comunicados = (
            client.table("comunicados")
            .select("id", count="exact")
            .eq("publicado", True)
            .execute()
        )
        estados_pend = (
            client.table("estados_pago")
            .select("id")
            .in_("codigo", ["PENDIENTE", "VENCIDA"])
            .execute()
        )
        pendientes = 0
        estado_ids = [e["id"] for e in estados_pend.data or []]
        if estado_ids:
            pensiones_pend = (
                client.table("pensiones")
                .select("id", count="exact")
                .in_("estado_pago_id", estado_ids)
                .execute()
            )
            pendientes = pensiones_pend.count or 0

        anio = obtener_anio_activo()
        return {
            "totalStudents": estudiantes.count or len(estudiantes.data or []),
            "totalTeachers": docentes.count or len(docentes.data or []),
            "totalCourses": cursos.count or len(cursos.data or []),
            "totalEnrollments": matriculas.count or len(matriculas.data or []),
            "activeAnnouncements": comunicados.count or len(comunicados.data or []),
            "pendingPensions": pendientes,
            "activeYear": anio.get("anio") if anio else None,
        }

    def get_recent_activities(self) -> list[dict]:
        client = get_supabase()
        activities = []

        noticias = (
            client.table("noticias")
            .select("titulo,publicado_en")
            .eq("publicado", True)
            .order("publicado_en", desc=True)
            .limit(3)
            .execute()
        )
        for n in noticias.data or []:
            activities.append(
                {
                    "title": n.get("titulo", ""),
                    "description": "Noticia publicada en el portal institucional.",
                    "date": str(n.get("publicado_en", ""))[:10],
                    "type": "communication",
                }
            )

        matriculas = (
            client.table("matriculas")
            .select("fecha_matricula,estudiantes(perfiles(nombres,apellidos))")
            .order("creado_en", desc=True)
            .limit(3)
            .execute()
        )
        for m in matriculas.data or []:
            est = m.get("estudiantes") or {}
            activities.append(
                {
                    "title": "Nueva matrícula registrada",
                    "description": f"Estudiante {nombre_completo(est.get('perfiles'))} matriculado.",
                    "date": str(m.get("fecha_matricula", "")),
                    "type": "administrative",
                }
            )
        return activities[:5]

    def get_upcoming_events(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("eventos")
            .select("titulo,descripcion,fecha_inicio,lugar")
            .order("fecha_inicio")
            .limit(5)
            .execute()
        )
        return [
            {
                "title": e.get("titulo", ""),
                "description": e.get("descripcion") or e.get("lugar") or "",
                "date": str(e.get("fecha_inicio", ""))[:10],
                "type": "academic",
            }
            for e in response.data or []
        ]
