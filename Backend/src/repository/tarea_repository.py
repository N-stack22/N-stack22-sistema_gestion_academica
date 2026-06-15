from src.repository.helpers import (
    curso_pertenece_estudiante,
    nombre_completo,
    normalizar_grado_nombre,
    obtener_contexto_academico_estudiante,
    obtener_ids_cursos_estudiante,
)
from src.services.database import get_supabase


class TareaRepository:
    def listar(
        self,
        curso_id: str | None = None,
        docente_id: str | None = None,
        seccion_id: str | None = None,
        estudiante_id: str | None = None,
    ) -> list[dict]:
        client = get_supabase()
        curso_ids_filtro: list[str] | None = None
        if estudiante_id:
            curso_ids_filtro = obtener_ids_cursos_estudiante(estudiante_id)
            if not curso_ids_filtro:
                return []
            ctx = obtener_contexto_academico_estudiante(estudiante_id)
            if ctx and not seccion_id:
                seccion_id = ctx.get("seccion_id")

        query = client.table("tareas").select(
            "id,titulo,descripcion,fecha_entrega,archivo_url,creado_en,curso_asignado_id,"
            "estados_tarea(nombre,codigo),"
            "cursos_asignados(id,seccion_id,asignaturas(nombre),secciones(nombre,grados(nombre))),"
            "docentes(perfiles(nombres,apellidos))"
        )
        if curso_id:
            query = query.eq("curso_asignado_id", curso_id)
        if docente_id:
            query = query.eq("docente_id", docente_id)
        if curso_ids_filtro:
            query = query.in_("curso_asignado_id", curso_ids_filtro)
        response = query.execute()

        entregas_map: dict[str, dict] = {}
        if estudiante_id and response.data:
            tids = [r["id"] for r in response.data]
            ent_resp = (
                client.table("entregas_tareas")
                .select("id,tarea_id,nota,fecha_entrega,descripcion,retroalimentacion,archivo_url,estados_entrega_tarea(nombre,codigo)")
                .eq("estudiante_id", estudiante_id)
                .in_("tarea_id", tids)
                .execute()
            )
            entregas_map = {e["tarea_id"]: e for e in ent_resp.data or []}

        rows = []
        for r in response.data or []:
            curso = r.get("cursos_asignados") or {}
            if seccion_id and curso.get("seccion_id") != seccion_id:
                continue
            ent = entregas_map.get(r["id"])
            rows.append(self._map_row(r, entrega=ent))
        return rows

    def crear(self, data: dict) -> dict:
        client = get_supabase()
        estado_resp = (
            client.table("estados_tarea")
            .select("id")
            .eq("codigo", "PUBLICADA")
            .limit(1)
            .execute()
        )
        if not estado_resp.data:
            estado_resp = client.table("estados_tarea").select("id").limit(1).execute()
        data["estado_id"] = estado_resp.data[0]["id"]
        resp = client.table("tareas").insert(data).execute()
        if not resp.data:
            raise ValueError("No se pudo crear la tarea")
        return self.listar(curso_id=data["curso_asignado_id"])[0]

    def _map_row(self, row: dict, entrega: dict | None = None) -> dict:
        curso = row.get("cursos_asignados") or {}
        asig = curso.get("asignaturas") or {}
        sec = curso.get("secciones") or {}
        grado = sec.get("grados") or {}
        doc = row.get("docentes") or {}
        estado = row.get("estados_tarea") or {}
        ent_estado = (entrega or {}).get("estados_entrega_tarea") or {}
        hoy = str(__import__("datetime").date.today())
        due = str(row.get("fecha_entrega", ""))[:10]
        entregada = bool(entrega)
        vencida = not entregada and due and due < hoy
        delivery_status = ent_estado.get("nombre", "Pendiente" if not entregada else "Entregada")
        delivery_code = ent_estado.get("codigo", "PENDIENTE" if not entregada else "ENTREGADA")
        return {
            "id": row["id"],
            "title": row.get("titulo", ""),
            "course": asig.get("nombre", ""),
            "courseId": curso.get("id", row.get("curso_asignado_id", "")),
            "section": f"{normalizar_grado_nombre(grado.get('nombre', ''))} {sec.get('nombre', '')}".strip(),
            "teacher": nombre_completo(doc.get("perfiles")),
            "dueDate": due,
            "publishedAt": str(row.get("creado_en", ""))[:10],
            "status": estado.get("nombre", "Publicada"),
            "statusCode": estado.get("codigo", "PUBLICADA"),
            "description": row.get("descripcion", ""),
            "attachmentUrl": row.get("archivo_url", "") or "",
            "submitted": entregada,
            "deliveryStatus": delivery_status,
            "deliveryStatusCode": delivery_code,
            "deliveryId": (entrega or {}).get("id", ""),
            "deliveryGrade": str((entrega or {}).get("nota", "")) if (entrega or {}).get("nota") is not None else "",
            "deliveryFeedback": (entrega or {}).get("retroalimentacion", "") or "",
            "deliveryFileUrl": (entrega or {}).get("archivo_url", "") or "",
            "deliverySubmittedAt": str((entrega or {}).get("fecha_entrega", ""))[:10] if entregada else "",
            "overdue": vencida,
        }
