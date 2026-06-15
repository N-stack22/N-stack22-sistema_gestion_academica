from fastapi import HTTPException, status

from src.repository.configuracion_repository import ConfiguracionRepository


class ConfiguracionService:
    def __init__(self):
        self.repo = ConfiguracionRepository()

    def institucional(self) -> dict:
        return self.repo.institucional()

    def crear_anio(self, data: dict) -> dict:
        try:
            return self.repo.crear_anio(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar_anio(self, anio_id: str, data: dict) -> dict:
        try:
            return self.repo.actualizar_anio(anio_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def crear_periodo(self, data: dict) -> dict:
        try:
            return self.repo.crear_periodo(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def crear_metodo_pago(self, data: dict) -> dict:
        try:
            return self.repo.crear_metodo_pago(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar_metodo_pago(self, metodo_id: str, data: dict) -> dict:
        try:
            return self.repo.actualizar_metodo_pago(metodo_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def crear_seccion(self, data: dict) -> dict:
        try:
            return self.repo.crear_seccion(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar_seccion(self, seccion_id: str, data: dict) -> dict:
        try:
            return self.repo.actualizar_seccion(seccion_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def personal(self, perfil_id: str) -> dict:
        return self.repo.personal(perfil_id)

    def guardar_personal(self, perfil_id: str, data: dict) -> dict:
        return self.repo.guardar_personal(perfil_id, data)
