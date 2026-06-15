from pydantic import BaseModel


class EstudianteResponse(BaseModel):
    id: str
    code: str
    fullName: str
    level: str
    grade: str
    section: str
    status: str


class DocenteResponse(BaseModel):
    id: str
    code: str
    fullName: str
    specialty: str
    email: str
    status: str


class ApoderadoResponse(BaseModel):
    id: str
    fullName: str
    studentName: str
    relationship: str
    phone: str
    email: str


class NoticiaResponse(BaseModel):
    id: str
    title: str
    date: str
    category: str
    summary: str


class ComunicadoResponse(BaseModel):
    id: str
    title: str
    date: str
    audience: str
    summary: str


class NivelEducativoResponse(BaseModel):
    id: str
    codigo: str
    nombre: str
    descripcion: str | None = None
