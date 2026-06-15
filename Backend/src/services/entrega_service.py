from fastapi import HTTPException, status

from src.repository.entrega_repository import EntregaRepository


class EntregaService:
    def __init__(self, repository: EntregaRepository | None = None):
        self._repository = repository or EntregaRepository()

    def listar_por_tarea(self, tarea_id: str, docente_id: str | None = None):
        try:
            return self._repository.listar_por_tarea(tarea_id, docente_id=docente_id)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def calificar(self, entrega_id: str, data: dict):
        try:
            return self._repository.calificar(entrega_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def registrar_entrega(self, tarea_id: str, data: dict):
        try:
            data["tarea_id"] = tarea_id
            return self._repository.registrar_entrega(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
