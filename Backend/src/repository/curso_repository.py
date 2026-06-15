from src.repository.helpers import nombre_completo, normalizar_grado_nombre
from src.services.database import get_supabase


class CursoRepository:
    def listar_asignaturas(self) -> list[dict]:
        client = get_supabase()
        response = client.table("asignaturas").select("id,nombre,codigo,area,activo").execute()
        return [
            {
                "id": r["id"],
                "name": r.get("nombre", ""),
                "code": r.get("codigo", ""),
                "area": r.get("area", ""),
                "active": r.get("activo", True),
            }
            for r in response.data or []
        ]

    def crear_asignatura(self, data: dict) -> dict:
        client = get_supabase()
        resp = (
            client.table("asignaturas")
            .insert(
                {
                    "nombre": data["nombre"],
                    "codigo": data.get("codigo"),
                    "area": data.get("area"),
                    "activo": True,
                }
            )
            .execute()
        )
        row = resp.data[0]
        return {
            "id": row["id"],
            "name": row.get("nombre", ""),
            "code": row.get("codigo", ""),
            "area": row.get("area", ""),
            "active": True,
        }

    def listar_cursos(
        self,
        anio_id: str | None = None,
        docente_id: str | None = None,
        seccion_id: str | None = None,
    ) -> list[dict]:
        client = get_supabase()
        query = client.table("cursos_asignados").select(
            "id,anio_academico_id,seccion_id,asignatura_id,docente_id,"
            "asignaturas(nombre,codigo),"
            "docentes(id,codigo_docente,perfiles(nombres,apellidos)),"
            "secciones(nombre,aula,grados(nombre,niveles_educativos(nombre))),"
            "anios_academicos(anio)"
        )
        if anio_id:
            query = query.eq("anio_academico_id", anio_id)
        if docente_id:
            query = query.eq("docente_id", docente_id)
        if seccion_id:
            query = query.eq("seccion_id", seccion_id)
        response = query.execute()

        horario_counts: dict[str, int] = {}
        hor_resp = client.table("horarios").select("curso_asignado_id").execute()
        for h in hor_resp.data or []:
            cid = h.get("curso_asignado_id")
            if cid:
                horario_counts[cid] = horario_counts.get(cid, 0) + 1

        mejores: dict[str, dict] = {}
        for row in response.data or []:
            clave = (
                f"{row.get('anio_academico_id')}::"
                f"{row.get('seccion_id')}::"
                f"{row.get('asignatura_id')}"
            )
            mapped = self._map_curso(row)
            mapped["scheduleCount"] = horario_counts.get(row["id"], 0)
            actual = mejores.get(clave)
            if not actual or self._curso_preferido(mapped, actual):
                mejores[clave] = mapped

        filas = sorted(
            mejores.values(),
            key=lambda x: (x.get("name", ""), x.get("teacherName", "")),
        )
        return filas

    @staticmethod
    def _curso_preferido(nuevo: dict, actual: dict) -> bool:
        """Elige el registro canónico: más horarios, luego con docente, luego id menor."""
        n_hor = nuevo.get("scheduleCount", 0)
        a_hor = actual.get("scheduleCount", 0)
        if n_hor != a_hor:
            return n_hor > a_hor
        n_doc = bool(nuevo.get("teacherId"))
        a_doc = bool(actual.get("teacherId"))
        if n_doc != a_doc:
            return n_doc
        return nuevo.get("id", "") < actual.get("id", "")

    def crear_curso(self, data: dict) -> dict:
        client = get_supabase()
        dup = (
            client.table("cursos_asignados")
            .select("id")
            .eq("anio_academico_id", data["anio_academico_id"])
            .eq("seccion_id", data["seccion_id"])
            .eq("asignatura_id", data["asignatura_id"])
            .limit(1)
            .execute()
        )
        if dup.data:
            raise ValueError(
                "Ya existe esa asignatura asignada a la misma sección y año académico."
            )
        resp = client.table("cursos_asignados").insert(data).execute()
        if not resp.data:
            raise ValueError("No se pudo crear el curso")
        return self.obtener_curso(resp.data[0]["id"])

    def eliminar_curso(self, curso_id: str) -> None:
        client = get_supabase()
        client.table("cursos_asignados").delete().eq("id", curso_id).execute()

    def obtener_curso(self, curso_id: str) -> dict | None:
        client = get_supabase()
        response = (
            client.table("cursos_asignados")
            .select(
                "id,anio_academico_id,seccion_id,asignatura_id,docente_id,"
                "asignaturas(nombre,codigo),"
                "docentes(id,codigo_docente,perfiles(nombres,apellidos)),"
                "secciones(nombre,grados(nombre,niveles_educativos(nombre))),"
                "anios_academicos(anio)"
            )
            .eq("id", curso_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return self._map_curso(response.data[0])

    def _map_curso(self, row: dict) -> dict:
        asig = row.get("asignaturas") or {}
        doc = row.get("docentes") or {}
        doc_perfil = doc.get("perfiles") or {}
        doc_nombre = nombre_completo(doc_perfil)
        doc_codigo = doc.get("codigo_docente", "")
        sec = row.get("secciones") or {}
        grado = sec.get("grados") or {}
        nivel = grado.get("niveles_educativos") or {}
        anio = row.get("anios_academicos") or {}
        asig_nombre = asig.get("nombre", "")
        grado_nombre = normalizar_grado_nombre(grado.get("nombre", ""))
        sec_nombre = sec.get("nombre", "")
        aula = sec.get("aula") or ""
        docente_txt = f"{doc_nombre} ({doc_codigo})" if doc_codigo else doc_nombre or "Sin docente"
        return {
            "id": row["id"],
            "name": asig_nombre,
            "subjectCode": asig.get("codigo", ""),
            "teacherId": doc.get("id", ""),
            "teacherName": doc_nombre,
            "teacherCode": doc_codigo,
            "section": sec_nombre,
            "sectionRoom": aula,
            "grade": grado_nombre,
            "level": nivel.get("nombre", ""),
            "academicYear": str(anio.get("anio", "")),
            "label": f"{asig_nombre} — Doc. {docente_txt} — {grado_nombre} {sec_nombre}",
        }
