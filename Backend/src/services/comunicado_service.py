from fastapi import HTTPException, status

from src.repository.comunicado_repository import ComunicadoRepository


class ComunicadoService:
    def __init__(self, repository: ComunicadoRepository | None = None):
        self._repository = repository or ComunicadoRepository()

    def listar(self) -> list[dict]:
        return self._repository.find_all()

    def listar_todos(
        self,
        docente_id: str | None = None,
        estudiante_id: str | None = None,
    ) -> list[dict]:
        if estudiante_id:
            return self._repository.find_for_estudiante(estudiante_id)
        if docente_id:
            return self._repository.find_for_docente(docente_id)
        return self._repository.find_all_admin()

    def crear(self, data: dict) -> dict:
        try:
            return self._repository.crear(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def obtener(self, comunicado_id: str) -> dict:
        comunicado = self._repository.obtener(comunicado_id)
        if not comunicado:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comunicado no encontrado")
        return comunicado

    def actualizar(self, comunicado_id: str, data: dict) -> dict:
        try:
            return self._repository.actualizar(comunicado_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def eliminar(self, comunicado_id: str) -> None:
        try:
            self._repository.eliminar(comunicado_id)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
