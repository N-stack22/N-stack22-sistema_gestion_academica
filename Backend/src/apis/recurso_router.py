from fastapi import APIRouter, Query

from src.schemas.requests import RecursoCreateRequest, RecursoUpdateRequest
from src.services.recurso_service import RecursoService

router = APIRouter(prefix="/api/recursos", tags=["recursos"])
service = RecursoService()


@router.get("")
def listar_recursos(
    curso_id: str | None = Query(default=None),
    docente_id: str | None = Query(default=None),
    estudiante_id: str | None = Query(default=None),
):
    return service.listar(curso_id, docente_id, estudiante_id)


@router.post("", status_code=201)
def crear_recurso(body: RecursoCreateRequest):
    return service.crear(body.model_dump())


@router.put("/{recurso_id}")
def actualizar_recurso(recurso_id: str, body: RecursoUpdateRequest):
    return service.actualizar(recurso_id, body.model_dump(exclude_unset=True))


@router.post("/{recurso_id}/archivar")
def archivar_recurso(recurso_id: str):
    return service.archivar(recurso_id)


@router.post("/{recurso_id}/desarchivar")
def desarchivar_recurso(recurso_id: str):
    return service.desarchivar(recurso_id)
