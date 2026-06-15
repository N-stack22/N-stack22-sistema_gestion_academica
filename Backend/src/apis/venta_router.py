from fastapi import APIRouter

from src.schemas.requests import PagoAnularRequest, VentaCreateRequest
from src.services.venta_service import VentaService

router = APIRouter(prefix="/api/ventas", tags=["ventas"])
service = VentaService()


@router.get("")
def listar_ventas():
    return service.listar()


@router.get("/productos")
def listar_productos():
    return service.productos()


@router.get("/resumen")
def resumen_ventas():
    return service.resumen()


@router.get("/{venta_id}")
def obtener_venta(venta_id: str):
    return service.obtener(venta_id)


@router.post("", status_code=201)
def crear_venta(body: VentaCreateRequest):
    return service.crear(body.model_dump())


@router.post("/{venta_id}/anular")
def anular_venta(venta_id: str, body: PagoAnularRequest | None = None):
    motivo = body.motivo if body else None
    return service.anular(venta_id, motivo)
