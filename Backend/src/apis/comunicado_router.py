from fastapi import APIRouter

from src.schemas.academico import ComunicadoResponse
from src.services.comunicado_service import ComunicadoService

router = APIRouter(prefix="/api/comunicados", tags=["comunicados"])
service = ComunicadoService()


@router.get("", response_model=list[ComunicadoResponse])
def listar_comunicados():
    return service.listar()
