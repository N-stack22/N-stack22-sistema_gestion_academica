import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=True)

_client: Client | None = None


def _first_env(*names: str) -> str:
    for name in names:
        value = (os.getenv(name) or "").strip()
        if value:
            return value
    return ""


def _supabase_credentials() -> tuple[str, str]:
    url = _first_env("SUPABASE_URL")
    key = _first_env("SUPABASE_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY")

    if not url:
        raise ValueError(
            "SUPABASE_URL no configurada. En Railway agregue la URL del proyecto Supabase."
        )
    if not key:
        raise ValueError(
            "SUPABASE_KEY no configurada. En Railway agregue SUPABASE_KEY "
            "con la service_role key de Supabase -> Settings -> API. "
            "Tambien se acepta SUPABASE_SERVICE_ROLE_KEY."
        )
    return url, key


def create_supabase_client() -> Client:
    url, key = _supabase_credentials()
    return create_client(url, key)


def get_supabase() -> Client:
    global _client

    if _client is not None:
        return _client

    _client = create_supabase_client()
    return _client


def reset_supabase_client() -> None:
    """Fuerza recarga del cliente tras cambiar Backend/.env."""
    global _client
    _client = None


def init_database() -> None:
    get_supabase()
    from src.services.db_connection import has_database_url, ping_postgres

    if has_database_url() and not ping_postgres():
        raise ValueError(
            "DATABASE_URL configurada pero la conexión PostgreSQL falló. "
            "Verifique la cadena en Backend/.env y que psycopg esté instalado."
        )
