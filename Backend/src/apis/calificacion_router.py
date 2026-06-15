from fastapi import APIRouter, Query

from src.schemas.requests import CalificacionCreateRequest, CalificacionUpdateRequest
from src.services.calificacion_service import CalificacionService

router = APIRouter(prefix="/api/calificaciones", tags=["calificaciones"])
service = CalificacionService()


@router.get("")
def listar_calificaciones(
    curso_id: str | None = Query(default=None),
    estudiante_id: str | None = Query(default=None),
    docente_id: str | None = Query(default=None),
):
    return service.listar(curso_id=curso_id, estudiante_id=estudiante_id, docente_id=docente_id)


@router.post("", status_code=201)
def crear_calificacion(body: CalificacionCreateRequest):
    return service.crear(body.model_dump())


@router.put("/{calificacion_id}")
def actualizar_calificacion(calificacion_id: str, body: CalificacionUpdateRequest):
    return service.actualizar(calificacion_id, body.model_dump(exclude_unset=True))
