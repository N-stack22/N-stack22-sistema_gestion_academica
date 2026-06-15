from fastapi import HTTPException, status

from src.repository.estudiante_repository import EstudianteRepository


class EstudianteService:
    def __init__(self, repository: EstudianteRepository | None = None):
        self._repository = repository or EstudianteRepository()

    def listar(
        self,
        docente_id: str | None = None,
        curso_id: str | None = None,
        seccion_id: str | None = None,
    ) -> list[dict]:
        if docente_id:
            return self._repository.find_by_docente(docente_id, curso_id=curso_id, seccion_id=seccion_id)
        return self._repository.find_all()

    def obtener(self, estudiante_id: str) -> dict:
        estudiante = self._repository.find_by_id(estudiante_id)
        if not estudiante:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Estudiante '{estudiante_id}' no encontrado",
            )
        return estudiante

    def crear(self, data: dict) -> dict:
        try:
            return self._repository.crear(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def actualizar(self, estudiante_id: str, data: dict) -> dict:
        try:
            return self._repository.actualizar(estudiante_id, data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

