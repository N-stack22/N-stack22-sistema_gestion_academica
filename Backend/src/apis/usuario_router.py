from fastapi import APIRouter, Depends, Query

from src.schemas.requests import (
    UsuarioCreateRequest,
    UsuarioPasswordResetRequest,
    UsuarioUpdateRequest,
)
from src.services.security import get_current_context, require_admin_or_director
from src.services.usuario_service import UsuarioService

router = APIRouter(prefix="/api/usuarios", tags=["usuarios"])
service = UsuarioService()


def require_user_management(context: dict = Depends(get_current_context)) -> dict:
    return require_admin_or_director(context)


@router.get("")
def listar_usuarios(
    rol: str | None = Query(default=None),
    _: dict = Depends(require_user_management),
):
    return service.listar(rol)


@router.get("/{usuario_id}")
def obtener_usuario(
    usuario_id: str,
    _: dict = Depends(require_user_management),
):
    return service.obtener(usuario_id)


@router.post("", status_code=201)
def crear_usuario(
    body: UsuarioCreateRequest,
    _: dict = Depends(require_user_management),
):
    return service.crear(body.model_dump())


@router.put("/{usuario_id}")
def actualizar_usuario(
    usuario_id: str,
    body: UsuarioUpdateRequest,
    _: dict = Depends(require_user_management),
):
    return service.actualizar(usuario_id, body.model_dump(exclude_unset=True))


@router.patch("/{usuario_id}/password")
def restablecer_password_usuario(
    usuario_id: str,
    body: UsuarioPasswordResetRequest,
    context: dict = Depends(require_user_management),
):
    return service.restablecer_password(usuario_id, body.new_password, context)
