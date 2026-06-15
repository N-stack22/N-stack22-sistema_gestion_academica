from fastapi import HTTPException, status

from src.repository.recurso_repository import RecursoRepository


class RecursoService:
    def __init__(self):
        self.repo = RecursoRepository()

    def listar(
        self,
        curso_id: str | None = None,
        docente_id: str | None = None,
        estudiante_id: str | None = None,
    ) -> list[dict]:
        try:
            return self.repo.listar(curso_id, docente_id, estudiante_id)
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def crear(self, data: dict) -> dict:
        try:
            return self.repo.crear(data)
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def archivar(self, recurso_id: str) -> dict:
        try:
            return self.repo.archivar(recurso_id)
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def desarchivar(self, recurso_id: str) -> dict:
        try:
            return self.repo.desarchivar(recurso_id)
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar(self, recurso_id: str, data: dict) -> dict:
        try:
            return self.repo.actualizar(recurso_id, data)
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
