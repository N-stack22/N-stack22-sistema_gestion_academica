from fastapi import APIRouter

from src.schemas.requests import (
    AnioAcademicoCreateRequest,
    AnioAcademicoUpdateRequest,
    ConfiguracionPersonalRequest,
    MetodoPagoCreateRequest,
    MetodoPagoUpdateRequest,
    PeriodoAcademicoCreateRequest,
    SeccionCreateRequest,
    SeccionUpdateRequest,
)
from src.services.configuracion_service import ConfiguracionService

router = APIRouter(prefix="/api/configuracion", tags=["configuracion"])
service = ConfiguracionService()


@router.get("/institucional")
def obtener_config_institucional():
    return service.institucional()


@router.post("/anios", status_code=201)
def crear_anio(body: AnioAcademicoCreateRequest):
    return service.crear_anio(body.model_dump())


@router.put("/anios/{anio_id}")
def actualizar_anio(anio_id: str, body: AnioAcademicoUpdateRequest):
    return service.actualizar_anio(anio_id, body.model_dump(exclude_unset=True))


@router.post("/periodos", status_code=201)
def crear_periodo(body: PeriodoAcademicoCreateRequest):
    return service.crear_periodo(body.model_dump())


@router.post("/metodos-pago", status_code=201)
def crear_metodo_pago(body: MetodoPagoCreateRequest):
    return service.crear_metodo_pago(body.model_dump())


@router.put("/metodos-pago/{metodo_id}")
def actualizar_metodo_pago(metodo_id: str, body: MetodoPagoUpdateRequest):
    return service.actualizar_metodo_pago(metodo_id, body.model_dump(exclude_unset=True))


@router.post("/secciones")
def crear_seccion(body: SeccionCreateRequest):
    return service.crear_seccion(body.model_dump())


@router.put("/secciones/{seccion_id}")
def actualizar_seccion(seccion_id: str, body: SeccionUpdateRequest):
    return service.actualizar_seccion(seccion_id, body.model_dump(exclude_unset=True))


@router.get("/personal/{perfil_id}")
def obtener_config_personal(perfil_id: str):
    return service.personal(perfil_id)


@router.put("/personal/{perfil_id}")
def guardar_config_personal(perfil_id: str, body: ConfiguracionPersonalRequest):
    return service.guardar_personal(perfil_id, body.model_dump(exclude_unset=True))
