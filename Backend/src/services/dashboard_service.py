from src.repository.dashboard_repository import DashboardRepository


class DashboardService:
    def __init__(self, repository: DashboardRepository | None = None):
        self._repository = repository or DashboardRepository()

    def resumen(self) -> dict:
        summary = self._repository.get_summary()
        return {
            "summary": summary,
            "activities": self._repository.get_recent_activities(),
            "events": self._repository.get_upcoming_events(),
        }
