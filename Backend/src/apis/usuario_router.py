from fastapi import APIRouter, Query

from src.schemas.requests import UsuarioCreateRequest, UsuarioUpdateRequest
from src.services.usuario_service import UsuarioService

router = APIRouter(prefix="/api/usuarios", tags=["usuarios"])
service = UsuarioService()


@router.get("")
def listar_usuarios(rol: str | None = Query(default=None)):
    return service.listar(rol)


@router.get("/{usuario_id}")
def obtener_usuario(usuario_id: str):
    return service.obtener(usuario_id)


@router.post("", status_code=201)
def crear_usuario(body: UsuarioCreateRequest):
    return service.crear(body.model_dump())


@router.put("/{usuario_id}")
def actualizar_usuario(usuario_id: str, body: UsuarioUpdateRequest):
    return service.actualizar(usuario_id, body.model_dump(exclude_unset=True))
