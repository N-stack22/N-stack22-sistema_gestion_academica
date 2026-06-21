"""Conexión directa PostgreSQL (cadena DATABASE_URL) para funciones SQL optimizadas."""

from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=True)

_pool = None


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


def database_url() -> str | None:
    url = (os.getenv("DATABASE_URL") or "").strip()
    return url or None


def has_database_url() -> bool:
    return database_url() is not None


def get_pool():
    global _pool
    if not has_database_url():
        raise RuntimeError(
            "DATABASE_URL no configurada. Use la cadena de conexión de "
            "Supabase -> Settings -> Database en Backend/.env"
        )
    try:
        from psycopg.rows import dict_row
        from psycopg_pool import ConnectionPool
    except ImportError as exc:
        raise RuntimeError(
            "Instale psycopg: python -m pip install 'psycopg[binary,pool]>=3.2.0'"
        ) from exc

    if _pool is None:
        _pool = ConnectionPool(
            database_url(),
            min_size=_int_env("DB_POOL_MIN_SIZE", 1),
            max_size=_int_env("DB_POOL_MAX_SIZE", 10),
            kwargs={"row_factory": dict_row},
            timeout=_int_env("DB_POOL_TIMEOUT_SECONDS", 10),
            max_idle=_int_env("DB_POOL_MAX_IDLE_SECONDS", 60),
            max_lifetime=_int_env("DB_POOL_MAX_LIFETIME_SECONDS", 900),
            open=True,
        )
    return _pool


@contextmanager
def get_connection() -> Iterator:
    with get_pool().connection() as conn:
        yield conn


def ping_postgres() -> bool:
    if not has_database_url():
        return False
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 AS ok")
                row = cur.fetchone()
                return bool(row and row.get("ok") == 1)
    except Exception:
        return False


def close_pool() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None
