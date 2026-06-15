from fastapi import HTTPException, status

from src.repository.venta_repository import VentaRepository


class VentaService:
    def __init__(self):
        self.repo = VentaRepository()

    def listar(self) -> list[dict]:
        return self.repo.listar()

    def obtener(self, venta_id: str) -> dict:
        venta = self.repo.obtener(venta_id)
        if not venta:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venta no encontrada")
        return venta

    def productos(self) -> list[dict]:
        return self.repo.listar_productos()

    def resumen(self) -> list[dict]:
        return self.repo.resumen()

    def crear(self, data: dict) -> dict:
        try:
            return self.repo.crear(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def anular(self, venta_id: str, motivo: str | None = None) -> dict:
        try:
            return self.repo.anular(venta_id, motivo)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
