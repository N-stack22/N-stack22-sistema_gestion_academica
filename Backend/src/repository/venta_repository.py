from src.repository.helpers import generar_codigo, nombre_completo
from src.services.database import get_supabase

_ESTADO_VENTA_VALIDO = "PAGADO"
_ESTADO_VENTA_ANULADO = "ANULADO"

_SELECT_VENTA = (
    "id,codigo_venta,total,fecha_venta,"
    "estudiantes(perfiles(nombres,apellidos)),"
    "apoderados(perfiles(nombres,apellidos)),"
    "metodos_pago(nombre),"
    "estados_pago(codigo,nombre),"
    "detalle_ventas(cantidad,precio_unitario,productos_venta(nombre))"
)


class VentaRepository:
    def listar(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("ventas")
            .select(_SELECT_VENTA)
            .order("fecha_venta", desc=True)
            .execute()
        )
        return [self._map_row(r) for r in response.data or []]

    def obtener(self, venta_id: str) -> dict | None:
        client = get_supabase()
        response = (
            client.table("ventas")
            .select(_SELECT_VENTA)
            .eq("id", venta_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return self._map_row(response.data[0])

    def listar_productos(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("productos_venta")
            .select("id,nombre,codigo,precio,activo")
            .eq("activo", True)
            .execute()
        )
        return response.data or []

    def crear(self, data: dict) -> dict:
        client = get_supabase()
        from src.repository.helpers import buscar_metodo_pago_por_codigo

        metodo = buscar_metodo_pago_por_codigo(data["metodo_pago_codigo"])
        if not metodo or not metodo.get("activo", True):
            raise ValueError("Método de pago no encontrado")

        estado_pago_resp = (
            client.table("estados_pago")
            .select("id")
            .eq("codigo", _ESTADO_VENTA_VALIDO)
            .limit(1)
            .execute()
        )
        if not estado_pago_resp.data:
            raise ValueError("Estado de pago PAGADO no configurado")

        productos = {p["id"]: p for p in self.listar_productos()}
        total = 0.0
        detalles = []
        for item in data.get("items") or []:
            prod = productos.get(item["producto_venta_id"])
            if not prod:
                raise ValueError("Producto no encontrado")
            precio = item.get("precio_unitario") or float(prod["precio"])
            cantidad = item.get("cantidad", 1)
            total += precio * cantidad
            detalles.append(
                {
                    "producto_venta_id": item["producto_venta_id"],
                    "cantidad": cantidad,
                    "precio_unitario": precio,
                }
            )

        if not detalles:
            raise ValueError("Debe agregar al menos un producto")

        codigo = generar_codigo("VTA", "ventas", "codigo_venta")
        venta_resp = (
            client.table("ventas")
            .insert(
                {
                    "codigo_venta": codigo,
                    "estudiante_id": data.get("estudiante_id"),
                    "apoderado_id": data.get("apoderado_id"),
                    "metodo_pago_id": metodo["id"],
                    "estado_pago_id": estado_pago_resp.data[0]["id"],
                    "total": total,
                }
            )
            .execute()
        )
        if not venta_resp.data:
            raise ValueError("No se pudo registrar la venta")

        venta_id = venta_resp.data[0]["id"]
        for det in detalles:
            det["venta_id"] = venta_id
        client.table("detalle_ventas").insert(detalles).execute()
        result = self.obtener(venta_id)
        if not result:
            raise ValueError("No se pudo registrar la venta")
        return result

    def anular(self, venta_id: str, motivo: str | None = None) -> dict:
        client = get_supabase()
        venta = self.obtener(venta_id)
        if not venta:
            raise ValueError("Venta no encontrada")
        if venta.get("statusCode") == _ESTADO_VENTA_ANULADO:
            raise ValueError("La venta ya está anulada")
        if venta.get("statusCode") != _ESTADO_VENTA_VALIDO:
            raise ValueError("Solo se pueden anular ventas válidas (estado Pagado)")

        estado_anulado = self._estado_id(client, _ESTADO_VENTA_ANULADO)
        if not estado_anulado:
            raise ValueError("Estado ANULADO no configurado en el catálogo de pagos")

        update_data: dict = {"estado_pago_id": estado_anulado}
        if motivo:
            update_data["motivo_anulacion"] = motivo.strip()

        client.table("ventas").update(update_data).eq("id", venta_id).execute()
        result = self.obtener(venta_id)
        if not result:
            raise ValueError("Venta no encontrada")
        return result

    def resumen(self) -> list[dict]:
        productos = self.listar_productos()
        ventas = self.listar()
        counts: dict[str, int] = {}
        for venta in ventas:
            if venta.get("statusCode") == _ESTADO_VENTA_ANULADO:
                continue
            for det in venta.get("items") or []:
                nombre = det.get("productName", "Otros")
                counts[nombre] = counts.get(nombre, 0) + det.get("quantity", 1)
        return [
            {
                "product": p["nombre"],
                "sales": counts.get(p["nombre"], 0),
                "price": p["precio"],
            }
            for p in productos[:4]
        ]

    @staticmethod
    def _estado_id(client, codigo: str) -> str | None:
        resp = (
            client.table("estados_pago")
            .select("id")
            .eq("codigo", codigo)
            .limit(1)
            .execute()
        )
        return resp.data[0]["id"] if resp.data else None

    def _map_row(self, row: dict) -> dict:
        est = row.get("estudiantes") or {}
        ap = row.get("apoderados") or {}
        metodo = row.get("metodos_pago") or {}
        estado = row.get("estados_pago") or {}
        status_code = estado.get("codigo", _ESTADO_VENTA_VALIDO)
        cliente = nombre_completo(est.get("perfiles")) if est else nombre_completo(ap.get("perfiles"))
        items = []
        for det in row.get("detalle_ventas") or []:
            prod = det.get("productos_venta") or {}
            items.append(
                {
                    "productName": prod.get("nombre", ""),
                    "quantity": det.get("cantidad", 1),
                    "unitPrice": det.get("precio_unitario", 0),
                }
            )
        concepto = ", ".join(i["productName"] for i in items) or "Venta"
        status_name = estado.get("nombre") or (
            "Anulada" if status_code == _ESTADO_VENTA_ANULADO else "Completada"
        )
        return {
            "id": row["id"],
            "code": row.get("codigo_venta", ""),
            "concept": concepto,
            "clientName": cliente or "—",
            "amount": f"{row.get('total', 0):.2f}",
            "status": status_name,
            "statusCode": status_code,
            "canVoid": status_code == _ESTADO_VENTA_VALIDO,
            "date": str(row.get("fecha_venta", ""))[:10],
            "method": metodo.get("nombre", ""),
            "items": items,
        }
