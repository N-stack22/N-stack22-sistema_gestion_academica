import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.apis.apoderado_router import router as apoderado_router
from src.apis.asistencia_router import router as asistencia_router
from src.apis.auth_router import router as auth_router
from src.apis.calificacion_router import router as calificacion_router
from src.apis.catalogo_router import router as catalogo_router
from src.apis.comunicado_interno_router import router as comunicado_interno_router
from src.apis.comunicado_router import router as comunicado_router
from src.apis.configuracion_router import router as configuracion_router
from src.apis.evento_router import router as evento_router
from src.apis.recurso_router import router as recurso_router
from src.apis.venta_router import router as venta_router
from src.apis.curso_router import router as curso_router
from src.apis.dashboard_router import router as dashboard_router
from src.apis.docente_router import router as docente_router
from src.apis.estudiante_router import router as estudiante_router
from src.apis.horario_router import router as horario_router
from src.apis.matricula_router import router as matricula_router
from src.apis.nivel_educativo_router import router as nivel_educativo_router
from src.apis.noticia_router import router as noticia_router
from src.apis.pago_router import router as pago_router
from src.apis.pension_router import router as pension_router
from src.apis.reporte_router import router as reporte_router
from src.apis.seguimiento_router import router as seguimiento_router
from src.apis.tarea_router import router as tarea_router
from src.apis.usuario_router import router as usuario_router
from src.services.database import init_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_database()
    yield


app = FastAPI(title="Horizonte API", version="0.2.0", lifespan=lifespan)

default_cors = "http://localhost:4200"
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", default_cors).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(catalogo_router)
app.include_router(usuario_router)
app.include_router(estudiante_router)
app.include_router(docente_router)
app.include_router(apoderado_router)
app.include_router(matricula_router)
app.include_router(curso_router)
app.include_router(calificacion_router)
app.include_router(horario_router)
app.include_router(tarea_router)
app.include_router(asistencia_router)
app.include_router(pension_router)
app.include_router(pago_router)
app.include_router(seguimiento_router)
app.include_router(reporte_router)
app.include_router(comunicado_interno_router)
app.include_router(recurso_router)
app.include_router(evento_router)
app.include_router(venta_router)
app.include_router(configuracion_router)
app.include_router(noticia_router)
app.include_router(comunicado_router)
app.include_router(nivel_educativo_router)


@app.get("/api/health")
def health_check():
    from src.services.database import get_supabase

    try:
        client = get_supabase()
        perfiles = client.table("perfiles").select("id", count="exact").limit(1).execute()
        anios = client.table("anios_academicos").select("id", count="exact").limit(1).execute()
        return {
            "status": "ok",
            "database": "connected",
            "perfiles": perfiles.count,
            "anios_academicos": anios.count,
        }
    except Exception as exc:
        return {"status": "error", "database": str(exc)}


@app.get("/")
def read_root():
    return {"message": "Horizonte API - Gestion Academica con Supabase"}
