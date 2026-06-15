from fastapi import HTTPException, status

from src.repository.docente_dashboard_repository import DocenteDashboardRepository


class DocenteDashboardService:
    def __init__(self):
        self._repo = DocenteDashboardRepository()

    def resumen(self, docente_id: str) -> dict:
        try:
            return self._repo.resumen(docente_id)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
