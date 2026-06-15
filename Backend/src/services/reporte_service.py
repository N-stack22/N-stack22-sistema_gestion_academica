from fastapi import HTTPException, status

from src.repository.reporte_repository import ReporteRepository

_TIPOS_REPORTE = frozenset({"estudiantes", "docentes", "comunicados", "eventos"})


class ReporteService:
    def __init__(self, repository: ReporteRepository | None = None):
        self._repository = repository or ReporteRepository()

    def generar(self, tipo: str, filtros: dict | None = None):
        tipo_normalizado = (tipo or "").strip().lower()
        if tipo_normalizado not in _TIPOS_REPORTE:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tipo de reporte no válido: {tipo}",
            )
        try:
            return self._repository.generar(tipo_normalizado, filtros)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"No se pudo generar el reporte de {tipo_normalizado}",
            ) from exc
