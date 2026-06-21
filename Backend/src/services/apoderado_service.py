from fastapi import HTTPException, status

from src.repository.apoderado_repository import ApoderadoRepository


class ApoderadoService:
    def __init__(self, repository: ApoderadoRepository | None = None):
        self._repository = repository or ApoderadoRepository()

    def listar(
        self,
        busqueda: str | None = None,
        parentesco: str | None = None,
        estado: str | None = None,
    ) -> list[dict]:
        return self._repository.find_all(busqueda, parentesco, estado)

    def obtener(self, apoderado_id: str) -> dict:
        apoderado = self._repository.find_by_id(apoderado_id)
        if not apoderado:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Apoderado no encontrado")
        return apoderado

    def crear(self, data: dict) -> dict:
        try:
            return self._repository.crear(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar(self, apoderado_id: str, data: dict) -> dict:
        try:
            return self._repository.actualizar(apoderado_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def vincular(self, apoderado_id: str, data: dict) -> dict:
        try:
            return self._repository.vincular_estudiante(apoderado_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
