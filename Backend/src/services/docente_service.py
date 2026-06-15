from fastapi import HTTPException, status

from src.repository.docente_repository import DocenteRepository


class DocenteService:
    def __init__(self, repository: DocenteRepository | None = None):
        self._repository = repository or DocenteRepository()

    def listar(self) -> list[dict]:
        return self._repository.find_all()

    def obtener(self, docente_id: str) -> dict:
        docente = self._repository.find_by_id(docente_id)
        if not docente:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Docente no encontrado")
        return docente

    def crear(self, data: dict) -> dict:
        try:
            return self._repository.crear(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar(self, docente_id: str, data: dict) -> dict:
        try:
            return self._repository.actualizar(docente_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
