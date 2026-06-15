from fastapi import HTTPException, status

from src.repository.horario_repository import HorarioRepository


class HorarioService:
    def __init__(self, repository: HorarioRepository | None = None):
        self._repository = repository or HorarioRepository()

    def listar(self, **filtros):
        return self._repository.listar(**filtros)

    def obtener(self, horario_id: str):
        horario = self._repository.obtener(horario_id)
        if not horario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Horario no encontrado")
        return horario

    def crear(self, data: dict):
        try:
            return self._repository.crear(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar(self, horario_id: str, data: dict):
        try:
            return self._repository.actualizar(horario_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def eliminar(self, horario_id: str):
        self._repository.eliminar(horario_id)
