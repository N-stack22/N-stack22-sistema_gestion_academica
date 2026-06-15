from fastapi import APIRouter, Query

from src.schemas.requests import EntregaCalificarRequest, EntregaEstudianteRequest, TareaCreateRequest
from src.services.entrega_service import EntregaService
from src.services.tarea_service import TareaService

router = APIRouter(prefix="/api/tareas", tags=["tareas"])
service = TareaService()
entrega_service = EntregaService()


@router.get("")
def listar_tareas(
    curso_id: str | None = Query(default=None),
    docente_id: str | None = Query(default=None),
    seccion_id: str | None = Query(default=None),
    estudiante_id: str | None = Query(default=None),
):
    return service.listar(
        curso_id=curso_id,
        docente_id=docente_id,
        seccion_id=seccion_id,
        estudiante_id=estudiante_id,
    )


@router.post("", status_code=201)
def crear_tarea(body: TareaCreateRequest):
    return service.crear(body.model_dump())


@router.get("/{tarea_id}/entregas")
def listar_entregas_tarea(
    tarea_id: str,
    docente_id: str | None = Query(default=None),
):
    return entrega_service.listar_por_tarea(tarea_id, docente_id=docente_id)


@router.put("/entregas/{entrega_id}")
def calificar_entrega(entrega_id: str, body: EntregaCalificarRequest):
    return entrega_service.calificar(entrega_id, body.model_dump(exclude_unset=True))


@router.post("/{tarea_id}/entregas", status_code=201)
def registrar_entrega_estudiante(tarea_id: str, body: EntregaEstudianteRequest):
    return entrega_service.registrar_entrega(tarea_id, body.model_dump())
