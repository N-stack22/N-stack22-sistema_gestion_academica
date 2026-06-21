from fastapi import APIRouter, Depends, Query

from src.services.dashboard_service import DashboardService
from src.services.docente_dashboard_service import DocenteDashboardService
from src.services.estudiante_dashboard_service import EstudianteDashboardService
from src.services.security import (
    get_current_context,
    require_admin_or_director,
    require_student_scope,
    require_teacher_scope,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
service = DashboardService()
docente_service = DocenteDashboardService()
estudiante_service = EstudianteDashboardService()


@router.get("")
def obtener_dashboard(context: dict = Depends(get_current_context)):
    require_admin_or_director(context)
    return service.resumen()


@router.get("/docente")
def obtener_dashboard_docente(
    docente_id: str | None = Query(default=None),
    context: dict = Depends(get_current_context),
):
    scoped_docente_id = require_teacher_scope(context, docente_id)
    return docente_service.resumen(scoped_docente_id)


@router.get("/estudiante")
def obtener_dashboard_estudiante(
    estudiante_id: str | None = Query(default=None),
    context: dict = Depends(get_current_context),
):
    scoped_estudiante_id = require_student_scope(context, estudiante_id)
    return estudiante_service.resumen(scoped_estudiante_id)
