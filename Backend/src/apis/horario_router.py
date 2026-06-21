from fastapi import APIRouter, Query, Response

from src.schemas.requests import HorarioCreateRequest, HorarioUpdateRequest
from src.services.horario_service import HorarioService

router = APIRouter(prefix="/api/horarios", tags=["horarios"])
service = HorarioService()


@router.get("")
def listar_horarios(
    anio_id: str | None = Query(default=None),
    seccion_id: str | None = Query(default=None),
    curso_id: str | None = Query(default=None),
    docente_id: str | None = Query(default=None),
    estudiante_id: str | None = Query(default=None),
    busqueda: str | None = Query(default=None),
    dia_semana: int | None = Query(default=None),
):
    return service.listar(
        anio_id=anio_id,
        seccion_id=seccion_id,
        curso_id=curso_id,
        docente_id=docente_id,
        estudiante_id=estudiante_id,
        busqueda=busqueda,
        dia_semana=dia_semana,
    )


@router.get("/{horario_id}")
def obtener_horario(horario_id: str):
    return service.obtener(horario_id)


@router.post("", status_code=201)
def crear_horario(body: HorarioCreateRequest):
    return service.crear(body.model_dump())


@router.put("/{horario_id}")
def actualizar_horario(horario_id: str, body: HorarioUpdateRequest):
    return service.actualizar(horario_id, body.model_dump(exclude_unset=True))


@router.delete("/{horario_id}", status_code=204)
def eliminar_horario(horario_id: str):
    service.eliminar(horario_id)
    return Response(status_code=204)
