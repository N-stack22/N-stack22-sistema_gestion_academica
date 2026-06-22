from fastapi import HTTPException, status

from src.repository.asistencia_repository import AsistenciaRepository


class AsistenciaService:
    def __init__(self, repository: AsistenciaRepository | None = None):
        self._repository = repository or AsistenciaRepository()

    def listar(self, **filtros):
        return self._repository.listar(**filtros)

    def registrar(self, data: dict):
        try:
            return self._repository.registrar(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def registrar_lote(self, registros: list[dict]):
        try:
            return [self._repository.registrar(data) for data in registros]
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar(self, asistencia_id: str, data: dict):
        try:
            return self._repository.actualizar(asistencia_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
