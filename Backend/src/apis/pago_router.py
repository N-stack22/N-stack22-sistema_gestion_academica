from fastapi import APIRouter, Query

from src.schemas.requests import PagoAnularRequest, PagoCreateRequest
from src.services.pago_service import PagoService

router = APIRouter(prefix="/api/pagos", tags=["pagos"])
service = PagoService()


@router.get("")
def listar_pagos(
    estudiante_id: str | None = Query(default=None),
    solo_validos: bool = Query(default=False),
    estado: str | None = Query(default=None),
    busqueda: str | None = Query(default=None),
    fecha_desde: str | None = Query(default=None),
    fecha_hasta: str | None = Query(default=None),
    metodo: str | None = Query(default=None),
):
    return service.listar(
        estudiante_id,
        solo_validos=solo_validos,
        estado=estado,
        busqueda=busqueda,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        metodo=metodo,
    )


@router.get("/{pago_id}")
def obtener_pago(pago_id: str):
    return service.obtener(pago_id)


@router.post("", status_code=201)
def registrar_pago(body: PagoCreateRequest):
    return service.crear(body.model_dump())


@router.post("/{pago_id}/anular")
def anular_pago(pago_id: str, body: PagoAnularRequest | None = None):
    motivo = body.motivo if body else None
    return service.anular(pago_id, motivo)
