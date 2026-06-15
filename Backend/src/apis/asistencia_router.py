from fastapi import APIRouter, Query

from src.schemas.requests import AsistenciaRegistroRequest
from src.services.asistencia_service import AsistenciaService

router = APIRouter(prefix="/api/asistencia", tags=["asistencia"])
service = AsistenciaService()


@router.get("")
def listar_asistencia(
    curso_id: str | None = Query(default=None),
    estudiante_id: str | None = Query(default=None),
    fecha: str | None = Query(default=None),
    docente_id: str | None = Query(default=None),
):
    return service.listar(
        curso_id=curso_id,
        estudiante_id=estudiante_id,
        fecha=fecha,
        docente_id=docente_id,
    )


@router.post("", status_code=201)
def registrar_asistencia(body: AsistenciaRegistroRequest):
    return service.registrar(body.model_dump())


@router.put("/{asistencia_id}")
def actualizar_asistencia(asistencia_id: str, body: AsistenciaRegistroRequest):
    return service.actualizar(asistencia_id, body.model_dump())
