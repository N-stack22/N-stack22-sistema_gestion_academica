from src.repository.dashboard_repository import DashboardRepository


class DashboardService:
    def __init__(self, repository: DashboardRepository | None = None):
        self._repository = repository or DashboardRepository()

    def resumen(self) -> dict:
        return self._repository.resumen_completo()
