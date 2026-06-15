from fastapi import HTTPException, status

from src.repository.pago_repository import PagoRepository


class PagoService:
    def __init__(self, repository: PagoRepository | None = None):
        self._repository = repository or PagoRepository()

    def listar(self, estudiante_id: str | None = None, solo_validos: bool = False):
        return self._repository.listar(estudiante_id, solo_validos=solo_validos)

    def obtener(self, pago_id: str):
        pago = self._repository.obtener(pago_id)
        if not pago:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado")
        return pago

    def crear(self, data: dict):
        try:
            return self._repository.crear(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def anular(self, pago_id: str, motivo: str | None = None):
        try:
            return self._repository.anular(pago_id, motivo)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
