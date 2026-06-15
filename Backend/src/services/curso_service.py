from fastapi import HTTPException, status

from src.repository.curso_repository import CursoRepository


class CursoService:
    def __init__(self, repository: CursoRepository | None = None):
        self._repository = repository or CursoRepository()

    def listar_asignaturas(self):
        return self._repository.listar_asignaturas()

    def crear_asignatura(self, data: dict):
        return self._repository.crear_asignatura(data)

    def listar_cursos(self, **filtros):
        return self._repository.listar_cursos(**filtros)

    def obtener_curso(self, curso_id: str):
        curso = self._repository.obtener_curso(curso_id)
        if not curso:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curso no encontrado")
        return curso

    def crear_curso(self, data: dict):
        try:
            return self._repository.crear_curso(data)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def eliminar_curso(self, curso_id: str):
        try:
            self._repository.eliminar_curso(curso_id)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
