from fastapi import HTTPException, status

from src.repository.evento_repository import EventoRepository


class EventoService:
    def __init__(self):
        self.repo = EventoRepository()

    def listar(self) -> list[dict]:
        try:
            return self.repo.listar()
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def obtener(self, evento_id: str) -> dict:
        evento = self.repo.obtener(evento_id)
        if not evento:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado")
        return evento

    def crear(self, data: dict) -> dict:
        try:
            return self.repo.crear(data)
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar(self, evento_id: str, data: dict) -> dict:
        try:
            return self.repo.actualizar(evento_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def eliminar(self, evento_id: str) -> None:
        try:
            self.repo.eliminar(evento_id)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
