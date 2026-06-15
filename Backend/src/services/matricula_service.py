from fastapi import HTTPException, status

from src.repository.matricula_repository import MatriculaRepository


class MatriculaService:
    def __init__(self, repository: MatriculaRepository | None = None):
        self._repository = repository or MatriculaRepository()

    def listar(self, **filtros) -> list[dict]:
        return self._repository.find_all(**filtros)

    def obtener(self, matricula_id: str) -> dict:
        matricula = self._repository.find_by_id(matricula_id)
        if not matricula:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Matrícula no encontrada")
        return matricula

    def crear(self, data: dict) -> dict:
        try:
            return self._repository.crear(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar(self, matricula_id: str, data: dict) -> dict:
        try:
            return self._repository.actualizar(matricula_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
