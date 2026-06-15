from fastapi import APIRouter, Query

from src.schemas.requests import AsignaturaCreateRequest, CursoAsignadoCreateRequest
from src.services.curso_service import CursoService

router = APIRouter(prefix="/api/cursos", tags=["cursos"])
service = CursoService()


@router.get("/asignaturas")
def listar_asignaturas():
    return service.listar_asignaturas()


@router.post("/asignaturas", status_code=201)
def crear_asignatura(body: AsignaturaCreateRequest):
    return service.crear_asignatura(body.model_dump())


@router.get("")
def listar_cursos(
    anio_id: str | None = Query(default=None),
    docente_id: str | None = Query(default=None),
    seccion_id: str | None = Query(default=None),
):
    return service.listar_cursos(anio_id=anio_id, docente_id=docente_id, seccion_id=seccion_id)


@router.get("/{curso_id}")
def obtener_curso(curso_id: str):
    return service.obtener_curso(curso_id)


@router.post("", status_code=201)
def crear_curso(body: CursoAsignadoCreateRequest):
    return service.crear_curso(body.model_dump())


@router.delete("/{curso_id}", status_code=204)
def eliminar_curso(curso_id: str):
    service.eliminar_curso(curso_id)
    return None
