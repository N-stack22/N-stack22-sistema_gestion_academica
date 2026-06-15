from fastapi import APIRouter, Query

from src.schemas.requests import PensionGenerarRequest
from src.services.pension_service import PensionService

router = APIRouter(prefix="/api/pensiones", tags=["pensiones"])
service = PensionService()


@router.get("")
def listar_pensiones(
    anio: int | None = Query(default=None),
    mes: int | None = Query(default=None),
    seccion_id: str | None = Query(default=None),
    nivel_id: str | None = Query(default=None),
    grado_id: str | None = Query(default=None),
    estado: str | None = Query(default=None),
    estudiante_id: str | None = Query(default=None),
):
    return service.listar(
        anio=anio,
        mes=mes,
        seccion_id=seccion_id,
        nivel_id=nivel_id,
        grado_id=grado_id,
        estado_codigo=estado,
        estudiante_id=estudiante_id,
    )


@router.post("/generar", status_code=201)
def generar_pensiones(body: PensionGenerarRequest):
    return service.generar(body.model_dump())


@router.get("/{pension_id}")
def obtener_pension(pension_id: str):
    return service.obtener(pension_id)
