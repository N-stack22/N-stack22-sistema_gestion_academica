from fastapi import APIRouter, Query

from src.services.reporte_service import ReporteService

router = APIRouter(prefix="/api/reportes", tags=["reportes"])
service = ReporteService()


@router.get("/{tipo}")
def generar_reporte(
    tipo: str,
    anio_id: str | None = Query(default=None),
    grado_id: str | None = Query(default=None),
    seccion_id: str | None = Query(default=None),
):
    return service.generar(
        tipo,
        {
            "anio_id": anio_id,
            "grado_id": grado_id,
            "seccion_id": seccion_id,
        },
    )
