from fastapi import APIRouter, Response, status

from src.schemas.requests import EventoCreateRequest, EventoUpdateRequest
from src.services.evento_service import EventoService

router = APIRouter(prefix="/api/eventos", tags=["eventos"])
service = EventoService()


@router.get("")
def listar_eventos():
    return service.listar()


@router.post("", status_code=201)
def crear_evento(body: EventoCreateRequest):
    return service.crear(body.model_dump())


@router.get("/{evento_id}")
def obtener_evento(evento_id: str):
    return service.obtener(evento_id)


@router.put("/{evento_id}")
def actualizar_evento(evento_id: str, body: EventoUpdateRequest):
    return service.actualizar(evento_id, body.model_dump(exclude_unset=True))


@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_evento(evento_id: str):
    service.eliminar(evento_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
