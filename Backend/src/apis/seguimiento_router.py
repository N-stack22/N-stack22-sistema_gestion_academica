from fastapi import APIRouter, Query

from src.schemas.requests import SeguimientoCreateRequest
from src.services.seguimiento_service import SeguimientoService

router = APIRouter(prefix="/api/seguimiento", tags=["seguimiento"])
service = SeguimientoService()


@router.get("")
def listar_seguimiento(
    nivel_id: str | None = Query(default=None),
    grado_id: str | None = Query(default=None),
    seccion_id: str | None = Query(default=None),
    estado: str | None = Query(default=None),
    busqueda: str | None = Query(default=None),
    comunicacion: str | None = Query(default=None),
    estudiante_id: str | None = Query(default=None),
    docente_id: str | None = Query(default=None),
):
    return service.listar(
        nivel_id=nivel_id,
        grado_id=grado_id,
        seccion_id=seccion_id,
        estado_codigo=estado,
        busqueda=busqueda,
        comunicacion=comunicacion,
        estudiante_id=estudiante_id,
        docente_id=docente_id,
    )


@router.post("", status_code=201)
def crear_seguimiento(body: SeguimientoCreateRequest):
    return service.crear(body.model_dump())
