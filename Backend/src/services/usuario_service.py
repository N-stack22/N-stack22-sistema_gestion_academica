from fastapi import HTTPException, status

from src.repository.usuario_repository import UsuarioRepository


class UsuarioService:
    def __init__(self, repository: UsuarioRepository | None = None):
        self._repository = repository or UsuarioRepository()

    def listar(self, rol_codigo: str | None = None) -> list[dict]:
        return self._repository.find_all(rol_codigo)

    def obtener(self, usuario_id: str) -> dict:
        usuario = self._repository.find_by_id(usuario_id)
        if not usuario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        return usuario

    def crear(self, data: dict) -> dict:
        try:
            return self._repository.crear(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar(self, usuario_id: str, data: dict) -> dict:
        try:
            return self._repository.actualizar(usuario_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
