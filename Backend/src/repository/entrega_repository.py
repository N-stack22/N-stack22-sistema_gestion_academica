from src.repository.helpers import (
    curso_pertenece_estudiante,
    nombre_completo,
    obtener_estudiantes_ids_por_docente,
)
from src.services.database import get_supabase


class EntregaRepository:
    def listar_por_tarea(self, tarea_id: str, docente_id: str | None = None) -> list[dict]:
        client = get_supabase()
        tarea_resp = (
            client.table("tareas")
            .select("id,titulo,docente_id,curso_asignado_id")
            .eq("id", tarea_id)
            .limit(1)
            .execute()
        )
        if not tarea_resp.data:
            raise ValueError("Tarea no encontrada")
        tarea = tarea_resp.data[0]
        if docente_id and tarea.get("docente_id") != docente_id:
            raise ValueError("No tiene permiso para ver las entregas de esta tarea.")

        curso_id = tarea.get("curso_asignado_id")
        owner_id = docente_id or tarea.get("docente_id")
        estudiante_ids = (
            obtener_estudiantes_ids_por_docente(owner_id, curso_id=curso_id) if owner_id else set()
        )

        entregas_resp = (
            client.table("entregas_tareas")
            .select(
                "id,tarea_id,estudiante_id,nota,fecha_entrega,archivo_url,descripcion,retroalimentacion,"
                "estados_entrega_tarea(nombre,codigo),"
                "estudiantes(id,codigo_estudiante,perfiles(nombres,apellidos))"
            )
            .eq("tarea_id", tarea_id)
            .execute()
        )
        entregas_map = {e["estudiante_id"]: e for e in entregas_resp.data or []}

        rows: list[dict] = []
        if estudiante_ids:
            est_resp = (
                client.table("estudiantes")
                .select("id,codigo_estudiante,perfiles(nombres,apellidos)")
                .in_("id", list(estudiante_ids))
                .execute()
            )
            for est in est_resp.data or []:
                ent = entregas_map.get(est["id"])
                rows.append(self._map_entrega_row(est, ent))
        else:
            for ent in entregas_resp.data or []:
                est = ent.get("estudiantes") or {}
                rows.append(self._map_entrega_row(est, ent))

        rows.sort(key=lambda r: r.get("studentName", ""))
        return rows

    def calificar(self, entrega_id: str, data: dict) -> dict:
        client = get_supabase()
        check = (
            client.table("entregas_tareas")
            .select("id,tarea_id")
            .eq("id", entrega_id)
            .limit(1)
            .execute()
        )
        if not check.data:
            raise ValueError("Entrega no encontrada")
        entrega = check.data[0]
        docente_id = data.get("docente_id")
        if docente_id:
            tarea = (
                client.table("tareas")
                .select("docente_id")
                .eq("id", entrega["tarea_id"])
                .limit(1)
                .execute()
            )
            if not tarea.data or tarea.data[0].get("docente_id") != docente_id:
                raise ValueError("No tiene permiso para calificar esta entrega.")

        update_data: dict = {}
        if data.get("nota") is not None:
            nota = data["nota"]
            if nota < 0 or nota > 20:
                raise ValueError("La nota debe estar entre 0 y 20.")
            update_data["nota"] = nota
        if "retroalimentacion" in data:
            update_data["retroalimentacion"] = data.get("retroalimentacion")
        if data.get("estado_codigo"):
            estado_resp = (
                client.table("estados_entrega_tarea")
                .select("id")
                .eq("codigo", data["estado_codigo"].upper())
                .limit(1)
                .execute()
            )
            if estado_resp.data:
                update_data["estado_id"] = estado_resp.data[0]["id"]
        if not update_data:
            raise ValueError("No hay datos para actualizar")
        client.table("entregas_tareas").update(update_data).eq("id", entrega_id).execute()
        items = self.listar_por_tarea(entrega["tarea_id"], docente_id=docente_id)
        return next((i for i in items if i.get("id") == entrega_id), items[0] if items else {})

    def registrar_entrega(self, data: dict) -> dict:
        client = get_supabase()
        estudiante_id = data["estudiante_id"]
        tarea_id = data["tarea_id"]
        archivo_url = (data.get("archivo_url") or "").strip()
        descripcion = (data.get("descripcion") or "").strip()
        if not archivo_url:
            raise ValueError("Debes subir un archivo o ingresar una URL de entrega.")

        tarea_resp = (
            client.table("tareas")
            .select("id,curso_asignado_id,fecha_entrega,estados_tarea(codigo)")
            .eq("id", tarea_id)
            .limit(1)
            .execute()
        )
        if not tarea_resp.data:
            raise ValueError("Tarea no encontrada")
        tarea = tarea_resp.data[0]
        if not curso_pertenece_estudiante(estudiante_id, tarea["curso_asignado_id"]):
            raise ValueError("No tienes permiso para entregar esta tarea.")

        estado_tarea = (tarea.get("estados_tarea") or {}).get("codigo", "")
        if estado_tarea == "CERRADA":
            raise ValueError("La tarea está cerrada y no acepta entregas.")

        existing = (
            client.table("entregas_tareas")
            .select("id,estados_entrega_tarea(codigo)")
            .eq("tarea_id", tarea_id)
            .eq("estudiante_id", estudiante_id)
            .limit(1)
            .execute()
        )
        if existing.data:
            codigo_ent = (existing.data[0].get("estados_entrega_tarea") or {}).get("codigo", "")
            if codigo_ent == "CALIFICADA":
                raise ValueError("La entrega ya fue calificada y no puede modificarse.")
            entrega_id = existing.data[0]["id"]
        else:
            entrega_id = None

        estado_ent = (
            client.table("estados_entrega_tarea")
            .select("id")
            .eq("codigo", "ENTREGADA")
            .limit(1)
            .execute()
        )
        if not estado_ent.data:
            raise ValueError("Estado de entrega no encontrado")

        payload = {
            "tarea_id": tarea_id,
            "estudiante_id": estudiante_id,
            "estado_id": estado_ent.data[0]["id"],
            "descripcion": descripcion or None,
            "archivo_url": archivo_url or None,
            "fecha_entrega": __import__("datetime").date.today().isoformat(),
        }
        if entrega_id:
            client.table("entregas_tareas").update(payload).eq("id", entrega_id).execute()
        else:
            resp = client.table("entregas_tareas").insert(payload).execute()
            if not resp.data:
                raise ValueError("No se pudo registrar la entrega")
            entrega_id = resp.data[0]["id"]

        ent_resp = (
            client.table("entregas_tareas")
            .select(
                "id,tarea_id,nota,fecha_entrega,archivo_url,descripcion,retroalimentacion,"
                "estados_entrega_tarea(nombre,codigo)"
            )
            .eq("id", entrega_id)
            .limit(1)
            .execute()
        )
        ent = ent_resp.data[0] if ent_resp.data else {}
        est_resp = (
            client.table("estudiantes")
            .select("id,codigo_estudiante,perfiles(nombres,apellidos)")
            .eq("id", estudiante_id)
            .limit(1)
            .execute()
        )
        est = est_resp.data[0] if est_resp.data else {"id": estudiante_id}
        return self._map_entrega_row(est, ent)

    def _map_entrega_row(self, est: dict, ent: dict | None) -> dict:
        if ent and ent.get("estudiantes"):
            est = ent["estudiantes"]
        perfil = est.get("perfiles") or {}
        estado = (ent or {}).get("estados_entrega_tarea") or {}
        entregada = bool(ent)
        return {
            "id": (ent or {}).get("id", ""),
            "studentId": est.get("id", ""),
            "studentName": nombre_completo(perfil),
            "studentCode": est.get("codigo_estudiante", ""),
            "status": estado.get("nombre", "Pendiente" if not entregada else "Entregada"),
            "statusCode": estado.get("codigo", "PENDIENTE" if not entregada else "ENTREGADA"),
            "submitted": entregada,
            "grade": str((ent or {}).get("nota", "")) if (ent or {}).get("nota") is not None else "",
            "submittedAt": str((ent or {}).get("fecha_entrega", ""))[:10] if entregada else "",
            "fileUrl": (ent or {}).get("archivo_url", "") or "",
            "feedback": (ent or {}).get("retroalimentacion", "") or "",
            "description": (ent or {}).get("descripcion", "") or "",
        }
