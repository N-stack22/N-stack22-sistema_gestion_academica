from fastapi import APIRouter

from src.schemas.requests import DocenteCreateRequest, DocenteUpdateRequest
from src.services.docente_service import DocenteService

router = APIRouter(prefix="/api/docentes", tags=["docentes"])
service = DocenteService()


@router.get("")
def listar_docentes():
    return service.listar()


@router.get("/{docente_id}")
def obtener_docente(docente_id: str):
    return service.obtener(docente_id)


@router.post("", status_code=201)
def crear_docente(body: DocenteCreateRequest):
    return service.crear(body.model_dump())


@router.put("/{docente_id}")
def actualizar_docente(docente_id: str, body: DocenteUpdateRequest):
    return service.actualizar(docente_id, body.model_dump(exclude_unset=True))
