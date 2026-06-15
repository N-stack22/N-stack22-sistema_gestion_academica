from fastapi import APIRouter, Query

from src.services.catalogo_service import CatalogoService

router = APIRouter(prefix="/api/catalogos", tags=["catalogos"])
service = CatalogoService()


@router.get("/roles")
def listar_roles():
    return service.roles()


@router.get("/anios-academicos")
def listar_anios():
    return service.anios()


@router.get("/niveles-educativos")
def listar_niveles():
    return service.niveles()


@router.get("/grados")
def listar_grados(nivel_id: str | None = Query(default=None)):
    return service.grados(nivel_id)


@router.get("/secciones")
def listar_secciones(
    anio_id: str | None = Query(default=None),
    grado_id: str | None = Query(default=None),
):
    return service.secciones(anio_id, grado_id)


@router.get("/estados-matricula")
def listar_estados_matricula(contexto: str | None = Query(default=None)):
    return service.estados_matricula(contexto)


@router.get("/asignaturas")
def listar_asignaturas():
    return service.asignaturas()


@router.get("/estados-asistencia")
def listar_estados_asistencia():
    return service.estados_asistencia()


@router.get("/tipos-evaluacion")
def listar_tipos_evaluacion():
    return service.tipos_evaluacion()


@router.get("/periodos-academicos")
def listar_periodos(anio_id: str | None = Query(default=None)):
    return service.periodos(anio_id)


@router.get("/estados-pago")
def listar_estados_pago():
    return service.estados_pago()


@router.get("/metodos-pago")
def listar_metodos_pago():
    return service.metodos_pago()


@router.get("/conceptos-pago")
def listar_conceptos_pago():
    return service.conceptos_pago()


@router.get("/tipos-recurso")
def listar_tipos_recurso():
    return service.tipos_recurso()


@router.get("/estados-seguimiento")
def listar_estados_seguimiento():
    return service.estados_seguimiento()
