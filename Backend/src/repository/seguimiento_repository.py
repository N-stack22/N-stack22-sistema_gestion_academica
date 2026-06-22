from src.repository.helpers import nombre_completo, normalizar_grado_nombre, obtener_estudiantes_ids_por_docente
from src.services.database import get_supabase


class SeguimientoRepository:
    def listar(
        self,
        nivel_id: str | None = None,
        grado_id: str | None = None,
        seccion_id: str | None = None,
        estado_codigo: str | None = None,
        busqueda: str | None = None,
        comunicacion: str | None = None,
        estudiante_id: str | None = None,
        docente_id: str | None = None,
    ) -> list[dict]:
        client = get_supabase()
        allowed_student_ids: set[str] | None = None
        if docente_id:
            allowed_student_ids = obtener_estudiantes_ids_por_docente(docente_id)
            if estudiante_id:
                allowed_student_ids = {sid for sid in allowed_student_ids if sid == estudiante_id}
            if not allowed_student_ids:
                return []

        query = (
            client.table("seguimiento_academico")
            .select(
                "id,observacion,ultima_comunicacion,estudiante_id,"
                "estudiantes(id,codigo_estudiante,perfiles(nombres,apellidos),"
                "matriculas(secciones(id,nombre,grados(id,nombre,niveles_educativos(id,nombre)))),"
                "apoderado_estudiante(parentesco,es_principal,apoderados(id,perfiles(nombres,apellidos)))),"
                "apoderados(id,perfiles(nombres,apellidos)),"
                "registrado_por:registrado_por_perfil_id(nombres,apellidos),"
                "estados_seguimiento(codigo,nombre)"
            )
        )
        if estudiante_id:
            query = query.eq("estudiante_id", estudiante_id)
        elif allowed_student_ids is not None:
            query = query.in_("estudiante_id", list(allowed_student_ids))
        response = query.execute()
        rows = []
        for r in response.data or []:
            mapped = self._map_row(r)
            est = r.get("estudiantes") or {}
            matriculas = est.get("matriculas") or []
            mat = matriculas[-1] if matriculas else {}
            sec = mat.get("secciones") or {}
            grado = sec.get("grados") or {}
            nivel = grado.get("niveles_educativos") or {}
            estado = r.get("estados_seguimiento") or {}

            if nivel_id and nivel.get("id") != nivel_id:
                continue
            if grado_id and grado.get("id") != grado_id:
                continue
            if seccion_id and sec.get("id") != seccion_id:
                continue
            if estado_codigo and estado.get("codigo") != estado_codigo.upper():
                continue
            if busqueda:
                term = busqueda.lower()
                if term not in mapped["studentName"].lower() and term not in mapped["parentName"].lower():
                    continue
            if comunicacion == "al_dia" and mapped["communicationStatus"] != "Al día":
                continue
            if comunicacion == "pendiente" and mapped["communicationStatus"] != "Pendiente":
                continue
            rows.append(mapped)
        return rows

    def crear(self, data: dict) -> dict:
        client = get_supabase()
        apoderado_id = data.get("apoderado_id") or self._buscar_apoderado_principal(data["estudiante_id"])
        estado_resp = (
            client.table("estados_seguimiento")
            .select("id")
            .eq("codigo", data["estado_codigo"].upper())
            .limit(1)
            .execute()
        )
        if not estado_resp.data:
            raise ValueError("Estado de seguimiento no encontrado")
        resp = (
            client.table("seguimiento_academico")
            .insert(
                {
                    "estudiante_id": data["estudiante_id"],
                    "apoderado_id": apoderado_id,
                    "estado_id": estado_resp.data[0]["id"],
                    "observacion": data.get("observacion"),
                    "ultima_comunicacion": data.get("ultima_comunicacion"),
                    "registrado_por_perfil_id": data.get("registrado_por_perfil_id"),
                }
            )
            .execute()
        )
        if not resp.data:
            raise ValueError("No se pudo registrar seguimiento")
        created_id = resp.data[0]["id"]
        created_rows = self.listar(estudiante_id=data["estudiante_id"])
        return next((row for row in created_rows if row["id"] == created_id), created_rows[0])

    def _buscar_apoderado_principal(self, estudiante_id: str) -> str | None:
        client = get_supabase()
        response = (
            client.table("apoderado_estudiante")
            .select("apoderado_id")
            .eq("estudiante_id", estudiante_id)
            .order("es_principal", desc=True)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return response.data[0].get("apoderado_id")

    def _map_row(self, row: dict) -> dict:
        est = row.get("estudiantes") or {}
        ap = row.get("apoderados") or self._apoderado_desde_estudiante(est)
        registrado_por = row.get("registrado_por") or {}
        estado = row.get("estados_seguimiento") or {}
        matriculas = est.get("matriculas") or []
        mat = matriculas[-1] if matriculas else {}
        sec = mat.get("secciones") or {}
        grado = sec.get("grados") or {}
        nivel = grado.get("niveles_educativos") or {}
        return {
            "id": row["id"],
            "studentId": est.get("id", ""),
            "studentName": nombre_completo(est.get("perfiles")),
            "parentId": ap.get("id", ""),
            "parentName": nombre_completo(ap.get("perfiles")) if ap else "—",
            "level": nivel.get("nombre", ""),
            "grade": normalizar_grado_nombre(grado.get("nombre", "")),
            "section": sec.get("nombre", ""),
            "academicStatus": estado.get("nombre", ""),
            "statusCode": estado.get("codigo", ""),
            "communicationStatus": "Al día" if row.get("ultima_comunicacion") else "Pendiente",
            "lastContact": str(row.get("ultima_comunicacion", "")),
            "registeredBy": nombre_completo(registrado_por) if registrado_por else "",
            "notes": row.get("observacion", ""),
        }

    @staticmethod
    def _apoderado_desde_estudiante(estudiante: dict) -> dict:
        links = estudiante.get("apoderado_estudiante") or []
        if not links:
            return {}
        principal = next((link for link in links if link.get("es_principal")), links[0])
        return principal.get("apoderados") or {}
