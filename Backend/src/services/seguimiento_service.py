from fastapi import HTTPException, status

from src.repository.seguimiento_repository import SeguimientoRepository


class SeguimientoService:
    def __init__(self, repository: SeguimientoRepository | None = None):
        self._repository = repository or SeguimientoRepository()

    def listar(self, **filtros):
        return self._repository.listar(**filtros)

    def crear(self, data: dict):
        try:
            return self._repository.crear(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
