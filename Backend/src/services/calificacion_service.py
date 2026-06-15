from fastapi import HTTPException, status

from src.repository.calificacion_repository import CalificacionRepository


class CalificacionService:
    def __init__(self, repository: CalificacionRepository | None = None):
        self._repository = repository or CalificacionRepository()

    def listar(self, **filtros):
        return self._repository.listar(**filtros)

    def crear(self, data: dict):
        try:
            return self._repository.crear(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar(self, calificacion_id: str, data: dict):
        try:
            return self._repository.actualizar(calificacion_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
