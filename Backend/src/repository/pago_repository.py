from datetime import datetime, timezone

from src.repository.helpers import generar_codigo, nombre_completo
from src.services.database import get_supabase

_ESTADOS_MATRICULA_PENSION = frozenset({"ACTIVA", "PENDIENTE"})
_ESTADO_PAGO_VALIDO = "PAGADO"
_ESTADO_PAGO_ANULADO = "ANULADO"


class PagoRepository:
    def listar(
        self,
        estudiante_id: str | None = None,
        solo_validos: bool = False,
    ) -> list[dict]:
        client = get_supabase()
        query = client.table("pagos").select(
            "id,monto,fecha_pago,codigo_operacion,pension_id,motivo_anulacion,"
            "estudiantes(perfiles(nombres,apellidos)),"
            "apoderados(perfiles(nombres,apellidos)),"
            "metodos_pago(nombre),"
            "estados_pago(codigo,nombre)"
        )
        if estudiante_id:
            query = query.eq("estudiante_id", estudiante_id)
        response = query.order("fecha_pago", desc=True).execute()
        rows = [self._map_row(r) for r in response.data or []]
        if solo_validos:
            rows = [r for r in rows if r.get("statusCode") == _ESTADO_PAGO_VALIDO]
        return rows

    def crear(self, data: dict) -> dict:
        client = get_supabase()
        if not data.get("pension_id"):
            raise ValueError("Debe seleccionar la pensión a pagar")

        pen_resp = (
            client.table("pensiones")
            .select("id,estudiante_id,monto,estados_pago(codigo)")
            .eq("id", data["pension_id"])
            .limit(1)
            .execute()
        )
        if not pen_resp.data:
            raise ValueError("Pensión no encontrada")
        pension = pen_resp.data[0]
        monto_pension = float(pension.get("monto") or 0)
        monto_pago = float(data["monto"])

        if abs(monto_pago - monto_pension) > 0.01:
            raise ValueError(
                f"El monto debe ser exactamente S/ {monto_pension:.2f} (valor de la pensión). "
                "No se permiten pagos parciales ni montos mayores."
            )

        if self._tiene_pago_valido(client, data["pension_id"]):
            raise ValueError(
                "Ya existe un pago válido para esta pensión. "
                "Si hubo un error, anule el pago incorrecto antes de registrar uno nuevo."
            )

        estudiante_id = pension.get("estudiante_id") or data.get("estudiante_id")
        if estudiante_id and not self._tiene_matricula_activa(client, estudiante_id):
            raise ValueError(
                "El estudiante está retirado; no se puede registrar pago de pensión"
            )

        from src.repository.helpers import buscar_metodo_pago_por_codigo

        metodo = buscar_metodo_pago_por_codigo(data["metodo_pago_codigo"])
        estado_pagado = self._estado_id(client, _ESTADO_PAGO_VALIDO)
        if not metodo or not metodo.get("activo", True) or not estado_pagado:
            raise ValueError("Método o estado de pago no encontrado")

        codigo = data.get("codigo_operacion") or generar_codigo("PAG", "pagos", "codigo_operacion")

        insert_data = {
            "pension_id": data["pension_id"],
            "estudiante_id": estudiante_id or data.get("estudiante_id"),
            "apoderado_id": data.get("apoderado_id"),
            "metodo_pago_id": metodo["id"],
            "estado_pago_id": estado_pagado,
            "monto": monto_pago,
            "codigo_operacion": codigo,
            "comprobante_url": data.get("comprobante_url"),
        }
        resp = client.table("pagos").insert(insert_data).execute()
        if not resp.data:
            raise ValueError("No se pudo registrar el pago")

        self._sync_pension_estado(client, data["pension_id"])
        return self.obtener(resp.data[0]["id"])

    def anular(self, pago_id: str, motivo: str | None = None) -> dict:
        client = get_supabase()
        pago = self.obtener(pago_id)
        if not pago:
            raise ValueError("Pago no encontrado")
        if pago.get("statusCode") == _ESTADO_PAGO_ANULADO:
            raise ValueError("El pago ya está anulado")
        if pago.get("statusCode") != _ESTADO_PAGO_VALIDO:
            raise ValueError("Solo se pueden anular pagos válidos (estado Pagado)")

        estado_anulado = self._estado_id(client, _ESTADO_PAGO_ANULADO)
        if not estado_anulado:
            raise ValueError(
                "Estado ANULADO no configurado. Ejecute sql/09_fix_pagos_anulacion.sql"
            )

        update_data: dict = {
            "estado_pago_id": estado_anulado,
            "anulado_en": datetime.now(timezone.utc).isoformat(),
        }
        if motivo:
            update_data["motivo_anulacion"] = motivo.strip()

        client.table("pagos").update(update_data).eq("id", pago_id).execute()

        if pago.get("pensionId"):
            self._sync_pension_estado(client, pago["pensionId"])

        result = self.obtener(pago_id)
        if not result:
            raise ValueError("Pago no encontrado")
        return result

    def obtener(self, pago_id: str) -> dict | None:
        client = get_supabase()
        resp = (
            client.table("pagos")
            .select(
                "id,monto,fecha_pago,codigo_operacion,pension_id,motivo_anulacion,anulado_en,"
                "estudiantes(perfiles(nombres,apellidos)),"
                "apoderados(perfiles(nombres,apellidos)),"
                "metodos_pago(nombre),"
                "estados_pago(codigo,nombre)"
            )
            .eq("id", pago_id)
            .limit(1)
            .execute()
        )
        if not resp.data:
            return None
        return self._map_row(resp.data[0])

    @staticmethod
    def _estado_id(client, codigo: str) -> str | None:
        resp = (
            client.table("estados_pago")
            .select("id")
            .eq("codigo", codigo.upper())
            .limit(1)
            .execute()
        )
        return resp.data[0]["id"] if resp.data else None

    @staticmethod
    def _tiene_pago_valido(client, pension_id: str) -> bool:
        resp = (
            client.table("pagos")
            .select("id, estados_pago(codigo)")
            .eq("pension_id", pension_id)
            .execute()
        )
        return any(
            (r.get("estados_pago") or {}).get("codigo") == _ESTADO_PAGO_VALIDO
            for r in resp.data or []
        )

    def _sync_pension_estado(self, client, pension_id: str) -> None:
        pen_resp = (
            client.table("pensiones")
            .select("monto")
            .eq("id", pension_id)
            .limit(1)
            .execute()
        )
        if not pen_resp.data:
            return
        monto_pension = float(pen_resp.data[0].get("monto") or 0)

        pagos_resp = (
            client.table("pagos")
            .select("monto, estados_pago(codigo)")
            .eq("pension_id", pension_id)
            .execute()
        )
        tiene_valido = False
        for p in pagos_resp.data or []:
            if (p.get("estados_pago") or {}).get("codigo") != _ESTADO_PAGO_VALIDO:
                continue
            if abs(float(p.get("monto") or 0) - monto_pension) <= 0.01:
                tiene_valido = True
                break

        estado_codigo = _ESTADO_PAGO_VALIDO if tiene_valido else "PENDIENTE"
        estado_id = self._estado_id(client, estado_codigo)
        if estado_id:
            client.table("pensiones").update({"estado_pago_id": estado_id}).eq(
                "id", pension_id
            ).execute()

    @staticmethod
    def _tiene_matricula_activa(client, estudiante_id: str) -> bool:
        resp = (
            client.table("matriculas")
            .select("estados_matricula(codigo)")
            .eq("estudiante_id", estudiante_id)
            .execute()
        )
        for row in resp.data or []:
            codigo = (row.get("estados_matricula") or {}).get("codigo", "")
            if codigo in _ESTADOS_MATRICULA_PENSION:
                return True
        return False

    def _map_row(self, row: dict) -> dict:
        est = row.get("estudiantes") or {}
        ap = row.get("apoderados") or {}
        metodo = row.get("metodos_pago") or {}
        estado = row.get("estados_pago") or {}
        status_code = estado.get("codigo", "")
        return {
            "id": row["id"],
            "pensionId": row.get("pension_id"),
            "studentName": nombre_completo(est.get("perfiles")) if est else "—",
            "parentName": nombre_completo(ap.get("perfiles")) if ap else "—",
            "amount": str(row.get("monto", "")),
            "date": str(row.get("fecha_pago", "")),
            "method": metodo.get("nombre", ""),
            "status": estado.get("nombre", ""),
            "statusCode": status_code,
            "operationCode": row.get("codigo_operacion", ""),
            "voidReason": row.get("motivo_anulacion") or "",
            "voidedAt": str(row.get("anulado_en") or ""),
            "canVoid": status_code == _ESTADO_PAGO_VALIDO,
        }
