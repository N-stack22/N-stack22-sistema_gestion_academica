from fastapi import APIRouter, Query, Response, status

from src.schemas.requests import ComunicadoCreateRequest, ComunicadoUpdateRequest
from src.services.comunicado_service import ComunicadoService

router = APIRouter(prefix="/api/comunicados-internos", tags=["comunicados-internos"])
service = ComunicadoService()


@router.get("")
def listar_comunicados_internos(
    docente_id: str | None = Query(default=None),
    estudiante_id: str | None = Query(default=None),
    familia: bool = Query(default=False),
):
    return service.listar_todos(docente_id=docente_id, estudiante_id=estudiante_id, familia=familia)


@router.post("", status_code=201)
def crear_comunicado(body: ComunicadoCreateRequest):
    return service.crear(body.model_dump())


@router.get("/{comunicado_id}")
def obtener_comunicado(comunicado_id: str):
    return service.obtener(comunicado_id)


@router.put("/{comunicado_id}")
def actualizar_comunicado(comunicado_id: str, body: ComunicadoUpdateRequest):
    return service.actualizar(comunicado_id, body.model_dump(exclude_unset=True))


@router.delete("/{comunicado_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_comunicado(comunicado_id: str):
    service.eliminar(comunicado_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
