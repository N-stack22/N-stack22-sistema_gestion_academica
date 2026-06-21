from fastapi import APIRouter, File, HTTPException, UploadFile, Query, status

from src.schemas.requests import RecursoCreateRequest, RecursoUpdateRequest
from src.services.recurso_service import RecursoService
from src.services.storage_service import upload_resource_file

router = APIRouter(prefix="/api/recursos", tags=["recursos"])
service = RecursoService()


@router.get("")
def listar_recursos(
    curso_id: str | None = Query(default=None),
    docente_id: str | None = Query(default=None),
    estudiante_id: str | None = Query(default=None),
):
    return service.listar(curso_id, docente_id, estudiante_id)


@router.post("", status_code=201)
def crear_recurso(body: RecursoCreateRequest):
    return service.crear(body.model_dump())


@router.post("/upload")
async def subir_archivo_recurso(file: UploadFile = File(...)):
    content = await file.read()
    try:
        return upload_resource_file(file.filename or "recurso.pdf", content, file.content_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/{recurso_id}")
def actualizar_recurso(recurso_id: str, body: RecursoUpdateRequest):
    return service.actualizar(recurso_id, body.model_dump(exclude_unset=True))


@router.post("/{recurso_id}/archivar")
def archivar_recurso(recurso_id: str):
    return service.archivar(recurso_id)


@router.post("/{recurso_id}/desarchivar")
def desarchivar_recurso(recurso_id: str):
    return service.desarchivar(recurso_id)
