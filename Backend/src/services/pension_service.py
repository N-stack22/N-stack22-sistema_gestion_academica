from fastapi import HTTPException, status

from src.repository.pension_repository import PensionRepository


class PensionService:
    def __init__(self, repository: PensionRepository | None = None):
        self._repository = repository or PensionRepository()

    def listar(self, **filtros):
        return self._repository.listar(**filtros)

    def obtener(self, pension_id: str) -> dict:
        pension = self._repository.obtener(pension_id)
        if not pension:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pensión no encontrada")
        return pension

    def generar(self, data: dict):
        try:
            return self._repository.generar(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
