from src.repository.nivel_educativo_repository import NivelEducativoRepository


class NivelEducativoService:
    def __init__(self, repository: NivelEducativoRepository | None = None):
        self._repository = repository or NivelEducativoRepository()

    def listar(self) -> list[dict]:
        return self._repository.find_all()
