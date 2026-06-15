from src.repository.catalogo_repository import CatalogoRepository


class CatalogoService:
    def __init__(self, repository: CatalogoRepository | None = None):
        self._repository = repository or CatalogoRepository()

    def roles(self):
        return self._repository.listar_roles()

    def anios(self):
        return self._repository.listar_anios()

    def niveles(self):
        return self._repository.listar_niveles()

    def grados(self, nivel_id: str | None = None):
        return self._repository.listar_grados(nivel_id)

    def secciones(self, anio_id: str | None = None, grado_id: str | None = None):
        return self._repository.listar_secciones(anio_id, grado_id)

    def estados_matricula(self, contexto: str | None = None):
        return self._repository.listar_estados_matricula(contexto)

    def asignaturas(self):
        return self._repository.listar_asignaturas()

    def estados_asistencia(self):
        return self._repository.listar_estados_asistencia()

    def tipos_evaluacion(self):
        return self._repository.listar_tipos_evaluacion()

    def periodos(self, anio_id: str | None = None):
        return self._repository.listar_periodos(anio_id)

    def estados_pago(self):
        return self._repository.listar_estados_pago()

    def metodos_pago(self):
        return self._repository.listar_metodos_pago()

    def conceptos_pago(self):
        return self._repository.listar_conceptos_pago()

    def tipos_recurso(self):
        return self._repository.listar_tipos_recurso()

    def estados_seguimiento(self):
        return self._repository.listar_estados_seguimiento()
