import os
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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


PUBLIC_API_PATHS = {
    "/api/auth/login",
    "/api/health",
}
PUBLIC_API_PREFIXES = (
    "/api/noticias",
    "/api/comunicados",
    "/api/niveles-educativos",
)
DOCUMENTATION_PATHS = {
    "/",
    "/docs",
    "/redoc",
    "/openapi.json",
}


def _is_public_api_path(path: str) -> bool:
    return path in PUBLIC_API_PATHS or any(
        path == prefix or path.startswith(f"{prefix}/")
        for prefix in PUBLIC_API_PREFIXES
    )


def _apply_security_headers(request, response) -> None:
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()",
    )

    if request.url.path.startswith("/api/auth"):
        response.headers["Cache-Control"] = "no-store"

    if request.url.path not in DOCUMENTATION_PATHS:
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
        )

    enable_hsts = os.getenv("ENABLE_HSTS", "").strip().lower() in {"1", "true", "yes", "on"}
    if request.url.scheme == "https" or enable_hsts:
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains",
        )


@app.middleware("http")
async def require_private_api_token(request, call_next):
    path = request.url.path
    if request.method == "OPTIONS" or not path.startswith("/api/") or _is_public_api_path(path):
        return await call_next(request)

    authorization = request.headers.get("authorization")
    if not authorization or not authorization.startswith("Bearer "):
        response = JSONResponse({"detail": "Token no enviado"}, status_code=401)
        _apply_security_headers(request, response)
        return response

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        response = JSONResponse({"detail": "Token vacio"}, status_code=401)
        _apply_security_headers(request, response)
        return response

    try:
        from src.repository.auth_repository import AuthRepository

        AuthRepository().context(token)
    except ValueError as exc:
        response = JSONResponse({"detail": str(exc)}, status_code=401)
        _apply_security_headers(request, response)
        return response

    return await call_next(request)


@app.middleware("http")
async def clear_query_cache_after_mutation(request, call_next):
    response = await call_next(request)
    if request.method in {"POST", "PUT", "PATCH", "DELETE"} and 200 <= response.status_code < 400:
        from src.repository.db_functions import clear_function_cache

        clear_function_cache()
    _apply_security_headers(request, response)
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
