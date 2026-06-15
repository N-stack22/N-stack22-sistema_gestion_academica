from fastapi import APIRouter, Query

from src.schemas.requests import (
    EstudianteCreateRequest,
    EstudianteUpdateRequest,
)
from src.services.estudiante_service import EstudianteService

router = APIRouter(prefix="/api/estudiantes", tags=["estudiantes"])
service = EstudianteService()


@router.get("")
def listar_estudiantes(
    docente_id: str | None = Query(default=None),
    curso_id: str | None = Query(default=None),
    seccion_id: str | None = Query(default=None),
):
    return service.listar(docente_id=docente_id, curso_id=curso_id, seccion_id=seccion_id)


@router.get("/{estudiante_id}")
def obtener_estudiante(estudiante_id: str):
    return service.obtener(estudiante_id)


@router.post("", status_code=201)
def crear_estudiante(body: EstudianteCreateRequest):
    return service.crear(body.model_dump())


@router.put("/{estudiante_id}")
def actualizar_estudiante(estudiante_id: str, body: EstudianteUpdateRequest):
    return service.actualizar(estudiante_id, body.model_dump(exclude_unset=True))
