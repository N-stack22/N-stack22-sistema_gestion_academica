from src.repository.helpers import normalizar_grado_nombre, obtener_contexto_academico_estudiante
from src.services.database import get_supabase

DIAS = {1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo"}


def _minutos(hora: str) -> int:
    """Convierte HH:MM o HH:MM:SS a minutos desde medianoche."""
    partes = str(hora or "00:00").split(":")
    h = int(partes[0]) if partes else 0
    m = int(partes[1]) if len(partes) > 1 else 0
    return h * 60 + m


def _horas_se_solapan(inicio_a: str, fin_a: str, inicio_b: str, fin_b: str) -> bool:
    a0, a1 = _minutos(inicio_a), _minutos(fin_a)
    b0, b1 = _minutos(inicio_b), _minutos(fin_b)
    return not (a1 <= b0 or a0 >= b1)


class HorarioRepository:
    def listar(
        self,
        anio_id: str | None = None,
        seccion_id: str | None = None,
        curso_id: str | None = None,
        docente_id: str | None = None,
        estudiante_id: str | None = None,
        busqueda: str | None = None,
        dia_semana: int | None = None,
    ) -> list[dict]:
        if estudiante_id and not seccion_id:
            ctx = obtener_contexto_academico_estudiante(estudiante_id)
            if ctx:
                seccion_id = ctx.get("seccion_id")
                if not anio_id:
                    anio_id = ctx.get("anio_academico_id")

        from src.repository.db_functions import DbFunctionError, call_list_function
        from src.services.db_connection import has_database_url

        if has_database_url():
            try:
                return call_list_function(
                    "fn_listar_horarios",
                    {
                        "p_anio_id": anio_id,
                        "p_seccion_id": seccion_id,
                        "p_curso_id": curso_id,
                        "p_docente_id": docente_id,
                        "p_busqueda": busqueda,
                        "p_dia_semana": dia_semana,
                    },
                )
            except DbFunctionError:
                pass

        client = get_supabase()
        query = client.table("horarios").select(
            "id,dia_semana,hora_inicio,hora_fin,aula,curso_asignado_id,"
            "cursos_asignados(id,docente_id,seccion_id,asignaturas(nombre),"
            "docentes(perfiles(nombres,apellidos)),"
            "secciones(id,nombre,anio_academico_id,grados(id,nombre,niveles_educativos(id,nombre))))"
        )
        if curso_id:
            query = query.eq("curso_asignado_id", curso_id)
        if dia_semana:
            query = query.eq("dia_semana", dia_semana)
        response = query.execute()
        rows = []
        for r in response.data or []:
            curso = r.get("cursos_asignados") or {}
            sec = curso.get("secciones") or {}
            if anio_id and sec.get("anio_academico_id") != anio_id:
                continue
            if seccion_id and curso.get("seccion_id") != seccion_id:
                continue
            if docente_id and curso.get("docente_id") != docente_id:
                continue
            mapped = self._map_row(r)
            if busqueda:
                q = busqueda.lower()
                texto = " ".join(
                    [
                        mapped.get("course", ""),
                        mapped.get("teacher", ""),
                        mapped.get("section", ""),
                        mapped.get("classroom", ""),
                    ]
                ).lower()
                if q not in texto:
                    continue
            rows.append(mapped)
        return sorted(rows, key=lambda x: (x.get("dayOrder", 0), x.get("startTime", "")))

    def obtener(self, horario_id: str) -> dict | None:
        client = get_supabase()
        resp = (
            client.table("horarios")
            .select(
                "id,dia_semana,hora_inicio,hora_fin,aula,curso_asignado_id,"
                "cursos_asignados(id,docente_id,seccion_id,asignaturas(nombre),"
                "docentes(perfiles(nombres,apellidos)),"
                "secciones(id,nombre,anio_academico_id,grados(id,nombre,niveles_educativos(id,nombre))))"
            )
            .eq("id", horario_id)
            .limit(1)
            .execute()
        )
        if not resp.data:
            return None
        return self._map_row(resp.data[0])

    def crear(self, data: dict) -> dict:
        self._validar_horario(data)
        client = get_supabase()
        resp = client.table("horarios").insert(data).execute()
        if not resp.data:
            raise ValueError("No se pudo guardar el horario")
        return self.obtener(resp.data[0]["id"])

    def actualizar(self, horario_id: str, data: dict) -> dict:
        actual = self.obtener(horario_id)
        if not actual:
            raise ValueError("Horario no encontrado")
        merged = {
            "curso_asignado_id": data.get("curso_asignado_id", actual["courseId"]),
            "dia_semana": data.get("dia_semana", actual["dayOrder"]),
            "hora_inicio": data.get("hora_inicio", actual["startTime"]),
            "hora_fin": data.get("hora_fin", actual["endTime"]),
            "aula": data.get("aula", actual.get("classroom")),
        }
        self._validar_horario(merged, excluir_horario_id=horario_id)
        update_data = {k: v for k, v in data.items() if v is not None}
        if update_data:
            client = get_supabase()
            client.table("horarios").update(update_data).eq("id", horario_id).execute()
        result = self.obtener(horario_id)
        if not result:
            raise ValueError("Horario no encontrado")
        return result

    def eliminar(self, horario_id: str) -> None:
        client = get_supabase()
        client.table("horarios").delete().eq("id", horario_id).execute()

    def _validar_horario(self, data: dict, excluir_horario_id: str | None = None) -> None:
        inicio = data["hora_inicio"]
        fin = data["hora_fin"]
        if _minutos(inicio) >= _minutos(fin):
            raise ValueError("La hora de inicio debe ser anterior a la hora de fin")

        client = get_supabase()
        curso_resp = (
            client.table("cursos_asignados")
            .select("id,docente_id,seccion_id,asignaturas(nombre)")
            .eq("id", data["curso_asignado_id"])
            .limit(1)
            .execute()
        )
        if not curso_resp.data:
            raise ValueError("Curso no encontrado")
        curso = curso_resp.data[0]
        asignatura = (curso.get("asignaturas") or {}).get("nombre", "Curso")

        existentes = (
            client.table("horarios")
            .select(
                "id,dia_semana,hora_inicio,hora_fin,aula,curso_asignado_id,"
                "cursos_asignados(docente_id,seccion_id,asignaturas(nombre))"
            )
            .eq("dia_semana", data["dia_semana"])
            .execute()
        )
        for h in existentes.data or []:
            if h.get("id") == excluir_horario_id:
                continue
            if not _horas_se_solapan(inicio, fin, h.get("hora_inicio", ""), h.get("hora_fin", "")):
                continue
            c = h.get("cursos_asignados") or {}
            otra_asig = (c.get("asignaturas") or {}).get("nombre", "otro curso")
            if c.get("docente_id") == curso["docente_id"]:
                aula_conflicto = h.get("aula") or "—"
                raise ValueError(
                    f"El docente ya tiene clase de {otra_asig} "
                    f"el {DIAS.get(data['dia_semana'], '')} "
                    f"({str(h.get('hora_inicio', ''))[:5]}–{str(h.get('hora_fin', ''))[:5]}) "
                    f"en aula {aula_conflicto}"
                )
            if c.get("seccion_id") == curso["seccion_id"]:
                raise ValueError(
                    f"La sección ya tiene {otra_asig} en ese horario "
                    f"({str(h.get('hora_inicio', ''))[:5]}–{str(h.get('hora_fin', ''))[:5]})"
                )
            if h.get("curso_asignado_id") == data["curso_asignado_id"]:
                raise ValueError(
                    f"{asignatura} ya tiene un bloque el {DIAS.get(data['dia_semana'], '')} "
                    f"en ese horario"
                )

    def _map_row(self, row: dict) -> dict:
        curso = row.get("cursos_asignados") or {}
        asig = curso.get("asignaturas") or {}
        doc = curso.get("docentes") or {}
        doc_perfil = doc.get("perfiles") or {}
        sec = curso.get("secciones") or {}
        grado = sec.get("grados") or {}
        nivel = grado.get("niveles_educativos") or {}
        dia = row.get("dia_semana", 0)
        return {
            "id": row["id"],
            "courseId": row.get("curso_asignado_id") or curso.get("id"),
            "course": asig.get("nombre", ""),
            "teacher": f"{doc_perfil.get('nombres', '')} {doc_perfil.get('apellidos', '')}".strip(),
            "section": f"{normalizar_grado_nombre(grado.get('nombre', ''))} {sec.get('nombre', '')}".strip(),
            "sectionId": curso.get("seccion_id") or sec.get("id"),
            "gradeId": grado.get("id"),
            "levelId": nivel.get("id"),
            "level": nivel.get("nombre", ""),
            "academicYearId": sec.get("anio_academico_id"),
            "day": DIAS.get(dia, ""),
            "dayOrder": dia,
            "startTime": str(row.get("hora_inicio", ""))[:5],
            "endTime": str(row.get("hora_fin", ""))[:5],
            "classroom": row.get("aula", ""),
        }
