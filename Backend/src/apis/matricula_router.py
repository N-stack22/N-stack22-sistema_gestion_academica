from fastapi import APIRouter, Query

from src.schemas.requests import MatriculaCreateRequest, MatriculaUpdateRequest
from src.services.matricula_service import MatriculaService

router = APIRouter(prefix="/api/matriculas", tags=["matriculas"])
service = MatriculaService()


@router.get("")
def listar_matriculas(
    anio_id: str | None = Query(default=None),
    nivel_id: str | None = Query(default=None),
    grado_id: str | None = Query(default=None),
    seccion_id: str | None = Query(default=None),
    estado: str | None = Query(default=None),
    estudiante_id: str | None = Query(default=None),
):
    return service.listar(
        anio_id=anio_id,
        nivel_id=nivel_id,
        grado_id=grado_id,
        seccion_id=seccion_id,
        estado_codigo=estado,
        estudiante_id=estudiante_id,
    )


@router.get("/{matricula_id}")
def obtener_matricula(matricula_id: str):
    return service.obtener(matricula_id)


@router.post("", status_code=201)
def crear_matricula(body: MatriculaCreateRequest):
    return service.crear(body.model_dump())


@router.put("/{matricula_id}")
def actualizar_matricula(matricula_id: str, body: MatriculaUpdateRequest):
    return service.actualizar(matricula_id, body.model_dump(exclude_unset=True))
