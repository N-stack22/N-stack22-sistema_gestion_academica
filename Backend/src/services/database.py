import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=True)

_client: Client | None = None


def get_supabase() -> Client:
    global _client

    url = os.getenv("SUPABASE_URL", "https://yrylzgosmrmvichwdrin.supabase.co")
    key = (os.getenv("SUPABASE_KEY") or "").strip()

    if not key:
        raise ValueError(
            "SUPABASE_KEY no configurada. Usa la service_role key de "
            "Supabase -> Settings -> API en Backend/.env"
        )

    if _client is not None:
        return _client

    _client = create_client(url, key)
    return _client


def reset_supabase_client() -> None:
    """Fuerza recarga del cliente tras cambiar Backend/.env."""
    global _client
    _client = None


def init_database() -> None:
    get_supabase()
