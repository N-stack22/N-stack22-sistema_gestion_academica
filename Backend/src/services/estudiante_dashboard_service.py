from fastapi import HTTPException, status

from src.repository.estudiante_dashboard_repository import EstudianteDashboardRepository


class EstudianteDashboardService:
    def __init__(self, repository: EstudianteDashboardRepository | None = None):
        self._repository = repository or EstudianteDashboardRepository()

    def resumen(self, estudiante_id: str) -> dict:
        try:
            return self._repository.resumen(estudiante_id)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
