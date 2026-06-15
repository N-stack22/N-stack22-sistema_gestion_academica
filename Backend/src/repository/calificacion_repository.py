from src.repository.helpers import (
    curso_pertenece_docente,
    obtener_estudiantes_ids_por_docente,
    obtener_ids_cursos_docente,
    nombre_completo,
    normalizar_grado_nombre,
)
from src.services.database import get_supabase


class CalificacionRepository:
    def listar(
        self,
        anio_id: str | None = None,
        curso_id: str | None = None,
        estudiante_id: str | None = None,
        docente_id: str | None = None,
    ) -> list[dict]:
        client = get_supabase()
        query = client.table("calificaciones").select(
            "id,nombre_evaluacion,nota,peso,observacion,curso_asignado_id,"
            "estudiantes(id,codigo_estudiante,perfiles(nombres,apellidos)),"
            "cursos_asignados(id,docente_id,asignaturas(nombre),secciones(nombre,grados(nombre))),"
            "periodos_academicos(nombre),"
            "tipos_evaluacion(nombre),"
            "docentes:registrado_por_docente_id(perfiles(nombres,apellidos))"
        )
        if curso_id:
            query = query.eq("curso_asignado_id", curso_id)
        if estudiante_id:
            query = query.eq("estudiante_id", estudiante_id)
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

    def crear(self, data: dict) -> dict:
        client = get_supabase()
        docente_id = data.get("registrado_por_docente_id")
        curso_id = data.get("curso_asignado_id")
        if docente_id and curso_id and not curso_pertenece_docente(docente_id, curso_id):
            raise ValueError("No tiene permiso para registrar notas en este curso.")
        estudiante_id = data.get("estudiante_id")
        if docente_id and estudiante_id:
            permitidos = obtener_estudiantes_ids_por_docente(docente_id, curso_id=curso_id)
            if estudiante_id not in permitidos:
                raise ValueError("El estudiante no pertenece a la sección del curso.")
        nota = data.get("nota")
        if nota is not None and (nota < 0 or nota > 20):
            raise ValueError("La nota debe estar entre 0 y 20.")
        peso = data.get("peso", 1)
        if peso is not None and peso <= 0:
            raise ValueError("El peso debe ser mayor que 0.")
        resp = client.table("calificaciones").insert(data).execute()
        if not resp.data:
            raise ValueError("No se pudo registrar la calificación")
        return self.listar(estudiante_id=data["estudiante_id"])[0]

    def actualizar(self, calificacion_id: str, data: dict) -> dict:
        client = get_supabase()
        check = (
            client.table("calificaciones")
            .select("id,curso_asignado_id,estudiante_id")
            .eq("id", calificacion_id)
            .limit(1)
            .execute()
        )
        if not check.data:
            raise ValueError("Calificación no encontrada")
        row = check.data[0]
        docente_id = data.get("docente_id")
        curso_id = row["curso_asignado_id"]
        if docente_id and not curso_pertenece_docente(docente_id, curso_id):
            raise ValueError("No tiene permiso para editar esta calificación.")

        update_data: dict = {}
        if data.get("nombre_evaluacion") is not None:
            update_data["nombre_evaluacion"] = data["nombre_evaluacion"]
        if data.get("nota") is not None:
            nota = data["nota"]
            if nota < 0 or nota > 20:
                raise ValueError("La nota debe estar entre 0 y 20.")
            update_data["nota"] = nota
        if data.get("peso") is not None:
            if data["peso"] <= 0:
                raise ValueError("El peso debe ser mayor que 0.")
            update_data["peso"] = data["peso"]
        if "observacion" in data:
            update_data["observacion"] = data.get("observacion")
        if not update_data:
            raise ValueError("No hay datos para actualizar")
        client.table("calificaciones").update(update_data).eq("id", calificacion_id).execute()
        items = self.listar(estudiante_id=row["estudiante_id"])
        return next((i for i in items if i["id"] == calificacion_id), items[0] if items else {})

    def _map_row(self, row: dict) -> dict:
        est = row.get("estudiantes") or {}
        curso = row.get("cursos_asignados") or {}
        asig = curso.get("asignaturas") or {}
        sec = curso.get("secciones") or {}
        grado = sec.get("grados") or {}
        periodo = row.get("periodos_academicos") or {}
        tipo = row.get("tipos_evaluacion") or {}
        return {
            "id": row["id"],
            "studentName": nombre_completo(est.get("perfiles")),
            "studentCode": est.get("codigo_estudiante", ""),
            "course": asig.get("nombre", ""),
            "courseId": row.get("curso_asignado_id", curso.get("id", "")),
            "section": f"{normalizar_grado_nombre(grado.get('nombre', ''))} {sec.get('nombre', '')}".strip(),
            "evaluation": row.get("nombre_evaluacion", ""),
            "type": tipo.get("nombre", ""),
            "period": periodo.get("nombre", ""),
            "periodId": row.get("periodo_academico_id", ""),
            "grade": str(row.get("nota", "")),
            "weight": str(row.get("peso", 1)),
            "observation": row.get("observacion", "") or "",
            "status": "Registrada",
        }
