import os
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=True)

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
    try:
        yield
    finally:
        from src.services.db_connection import close_pool

        close_pool()


app = FastAPI(title="Horizonte API", version="0.2.0", lifespan=lifespan)


def _normalize_origin(value: str) -> str:
    origin = value.strip().rstrip("/")
    if not origin:
        return ""

    parsed = urlparse(origin)
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}"

    return origin


default_cors_origins = {
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "https://n-stack22.github.io",
}
configured_cors_origins = {
    _normalize_origin(origin)
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
}
cors_origins = sorted(default_cors_origins | configured_cors_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def clear_query_cache_after_mutation(request, call_next):
    response = await call_next(request)
    if request.method in {"POST", "PUT", "PATCH", "DELETE"} and 200 <= response.status_code < 400:
        from src.repository.db_functions import clear_function_cache

        clear_function_cache()
    return response

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
    from pathlib import Path

    from dotenv import load_dotenv

    from src.services.database import get_supabase
    from src.services.db_connection import has_database_url, ping_postgres

    load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=True)

    try:
        client = get_supabase()
        perfiles = client.table("perfiles").select("id", count="exact").limit(1).execute()
        anios = client.table("anios_academicos").select("id", count="exact").limit(1).execute()
        payload = {
            "status": "ok",
            "database": "connected",
            "perfiles": perfiles.count,
            "anios_academicos": anios.count,
            "postgres_direct": "not_configured",
        }
        if has_database_url():
            payload["postgres_direct"] = "connected" if ping_postgres() else "error"
        return payload
    except Exception as exc:
        return {"status": "error", "database": str(exc)}


@app.get("/")
def read_root():
    return {"message": "Horizonte API - Gestion Academica con Supabase"}
