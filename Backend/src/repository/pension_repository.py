from src.repository.helpers import generar_codigo, nombre_completo, normalizar_grado_nombre
from src.services.database import get_supabase

_ESTADOS_MATRICULA_PENSION = frozenset({"ACTIVA", "PENDIENTE"})


class PensionRepository:
    def listar(
        self,
        anio: int | None = None,
        mes: int | None = None,
        seccion_id: str | None = None,
        nivel_id: str | None = None,
        grado_id: str | None = None,
        estado_codigo: str | None = None,
        estudiante_id: str | None = None,
    ) -> list[dict]:
        client = get_supabase()
        query = client.table("pensiones").select(
            "id,anio,mes,monto,fecha_vencimiento,"
            "estudiantes(id,codigo_estudiante,perfiles(nombres,apellidos),"
            "matriculas(estados_matricula(codigo),"
            "secciones(id,nombre,grados(id,nombre,niveles_educativos(id,nombre))))),"
            "conceptos_pago(nombre),"
            "estados_pago(codigo,nombre)"
        )
        if anio:
            query = query.eq("anio", anio)
        if mes:
            query = query.eq("mes", mes)
        if estado_codigo:
            estado_resp = (
                client.table("estados_pago")
                .select("id")
                .eq("codigo", estado_codigo.upper())
                .limit(1)
                .execute()
            )
            if not estado_resp.data:
                return []
            query = query.eq("estado_pago_id", estado_resp.data[0]["id"])
        if estudiante_id:
            query = query.eq("estudiante_id", estudiante_id)
        response = query.order("estudiante_id").execute()
        rows = []
        for r in response.data or []:
            est = r.get("estudiantes") or {}
            if not est.get("id"):
                continue
            mat = self._matricula_vigente(est.get("matriculas") or [])
            sec = mat.get("secciones") or {}
            grado = sec.get("grados") or {}
            nivel = grado.get("niveles_educativos") or {}
            if seccion_id and sec.get("id") != seccion_id:
                continue
            if nivel_id and nivel.get("id") != nivel_id:
                continue
            if grado_id and grado.get("id") != grado_id:
                continue
            rows.append(self._map_row(r, mat))
        return rows

    def obtener(self, pension_id: str) -> dict | None:
        client = get_supabase()
        response = (
            client.table("pensiones")
            .select(
                "id,anio,mes,monto,fecha_vencimiento,"
                "estudiantes(id,codigo_estudiante,perfiles(nombres,apellidos),"
                "matriculas(estados_matricula(codigo),"
                "secciones(id,nombre,grados(id,nombre,niveles_educativos(id,nombre))))),"
                "conceptos_pago(nombre),"
                "estados_pago(codigo,nombre)"
            )
            .eq("id", pension_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return self._map_row(response.data[0], self._matricula_vigente((response.data[0].get("estudiantes") or {}).get("matriculas") or []))

    def generar(self, data: dict) -> list[dict]:
        client = get_supabase()
        concepto_resp = (
            client.table("conceptos_pago")
            .select("id")
            .eq("codigo", data.get("concepto_codigo", "PENSION").upper())
            .limit(1)
            .execute()
        )
        estado_resp = (
            client.table("estados_pago")
            .select("id")
            .eq("codigo", "PENDIENTE")
            .limit(1)
            .execute()
        )
        if not concepto_resp.data or not estado_resp.data:
            raise ValueError("Catálogos de pago no configurados")

        mat_query = client.table("matriculas").select(
            "estudiante_id,seccion_id,estados_matricula(codigo)"
        )
        if data.get("seccion_id"):
            mat_query = mat_query.eq("seccion_id", data["seccion_id"])
        matriculas = mat_query.execute()

        existentes = (
            client.table("pensiones")
            .select("estudiante_id")
            .eq("anio", data["anio"])
            .eq("mes", data["mes"])
            .execute()
        )
        ya_tiene = {p["estudiante_id"] for p in existentes.data or []}

        creadas = []
        for m in matriculas.data or []:
            estado = (m.get("estados_matricula") or {}).get("codigo", "")
            if estado not in _ESTADOS_MATRICULA_PENSION:
                continue
            if m["estudiante_id"] in ya_tiene:
                continue
            resp = (
                client.table("pensiones")
                .insert(
                    {
                        "estudiante_id": m["estudiante_id"],
                        "concepto_pago_id": concepto_resp.data[0]["id"],
                        "estado_pago_id": estado_resp.data[0]["id"],
                        "anio": data["anio"],
                        "mes": data["mes"],
                        "monto": data["monto"],
                        "fecha_vencimiento": f"{data['anio']}-{data['mes']:02d}-10",
                    }
                )
                .execute()
            )
            if resp.data:
                creadas.append(resp.data[0]["id"])
        return self.listar(anio=data["anio"], mes=data["mes"])

    def _map_row(self, row: dict, mat: dict | None = None) -> dict:
        est = row.get("estudiantes") or {}
        concepto = row.get("conceptos_pago") or {}
        estado = row.get("estados_pago") or {}
        if mat is None:
            mat = self._matricula_vigente(est.get("matriculas") or [])
        sec = mat.get("secciones") or {}
        grado = sec.get("grados") or {}
        nivel = grado.get("niveles_educativos") or {}
        return {
            "id": row["id"],
            "studentId": est.get("id", ""),
            "studentName": nombre_completo(est.get("perfiles")),
            "studentCode": est.get("codigo_estudiante", ""),
            "level": nivel.get("nombre", ""),
            "grade": normalizar_grado_nombre(grado.get("nombre", "")),
            "section": sec.get("nombre", ""),
            "concept": concepto.get("nombre", "Pensión"),
            "year": str(row.get("anio", "")),
            "month": str(row.get("mes", "")),
            "amount": str(row.get("monto", "")),
            "dueDate": str(row.get("fecha_vencimiento", "")),
            "status": estado.get("nombre", ""),
            "statusCode": estado.get("codigo", ""),
        }

    @staticmethod
    def _matricula_vigente(matriculas: list[dict]) -> dict:
        for mat in matriculas:
            estado = (mat.get("estados_matricula") or {}).get("codigo", "")
            if estado in _ESTADOS_MATRICULA_PENSION:
                return mat
        return matriculas[-1] if matriculas else {}
