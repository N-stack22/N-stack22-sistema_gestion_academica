from fastapi import APIRouter, Query

from src.services.dashboard_service import DashboardService
from src.services.docente_dashboard_service import DocenteDashboardService
from src.services.estudiante_dashboard_service import EstudianteDashboardService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
service = DashboardService()
docente_service = DocenteDashboardService()
estudiante_service = EstudianteDashboardService()


@router.get("")
def obtener_dashboard():
    return service.resumen()


@router.get("/docente")
def obtener_dashboard_docente(docente_id: str = Query(...)):
    return docente_service.resumen(docente_id)


@router.get("/estudiante")
def obtener_dashboard_estudiante(estudiante_id: str = Query(...)):
    return estudiante_service.resumen(estudiante_id)
