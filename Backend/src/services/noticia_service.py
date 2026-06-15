from src.repository.noticia_repository import NoticiaRepository


class NoticiaService:
    def __init__(self, repository: NoticiaRepository | None = None):
        self._repository = repository or NoticiaRepository()

    def listar(self) -> list[dict]:
        return self._repository.find_all()
