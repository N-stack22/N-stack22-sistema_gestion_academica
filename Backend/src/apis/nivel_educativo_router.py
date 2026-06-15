from fastapi import APIRouter

from src.schemas.academico import NivelEducativoResponse
from src.services.nivel_educativo_service import NivelEducativoService

router = APIRouter(prefix="/api/niveles-educativos", tags=["niveles-educativos"])
service = NivelEducativoService()


@router.get("", response_model=list[NivelEducativoResponse])
def listar_niveles():
    return service.listar()
