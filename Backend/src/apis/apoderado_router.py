from fastapi import APIRouter

from src.schemas.requests import (
    ApoderadoCreateRequest,
    ApoderadoUpdateRequest,
    ApoderadoVinculoRequest,
)
from src.services.apoderado_service import ApoderadoService

router = APIRouter(prefix="/api/apoderados", tags=["apoderados"])
service = ApoderadoService()


@router.get("")
def listar_apoderados():
    return service.listar()


@router.get("/{apoderado_id}")
def obtener_apoderado(apoderado_id: str):
    return service.obtener(apoderado_id)


@router.post("", status_code=201)
def crear_apoderado(body: ApoderadoCreateRequest):
    return service.crear(body.model_dump())


@router.put("/{apoderado_id}")
def actualizar_apoderado(apoderado_id: str, body: ApoderadoUpdateRequest):
    return service.actualizar(apoderado_id, body.model_dump(exclude_unset=True))


@router.post("/{apoderado_id}/vinculos", status_code=201)
def vincular_estudiante(apoderado_id: str, body: ApoderadoVinculoRequest):
    return service.vincular(apoderado_id, body.model_dump())
