from fastapi import APIRouter

from src.schemas.academico import NoticiaResponse
from src.services.noticia_service import NoticiaService

router = APIRouter(prefix="/api/noticias", tags=["noticias"])
service = NoticiaService()


@router.get("", response_model=list[NoticiaResponse])
def listar_noticias():
    return service.listar()
