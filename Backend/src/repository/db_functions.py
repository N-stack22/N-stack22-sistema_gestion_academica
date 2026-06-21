"""Invoca funciones PostgreSQL registradas en sql/17_funciones_listados.sql."""

from __future__ import annotations

import json
import os
import time
from typing import Any

from src.services.db_connection import get_connection, has_database_url


class DbFunctionError(Exception):
    pass


_CACHE: dict[str, tuple[float, Any]] = {}


def _cache_ttl_seconds() -> int:
    enabled = (os.getenv("DB_FUNCTION_CACHE_ENABLED") or "").strip().lower()
    if enabled not in {"1", "true", "yes", "on"}:
        return 0
    try:
        return int(os.getenv("DB_FUNCTION_CACHE_TTL_SECONDS", "0"))
    except ValueError:
        return 0


def _cache_key(name: str, params: dict[str, Any]) -> str:
    return f"{name}:{json.dumps(params, sort_keys=True, default=str)}"


def clear_function_cache() -> None:
    _CACHE.clear()


def call_list_function(name: str, params: dict[str, Any]) -> list[dict]:
    result = _call_function(name, params)
    if isinstance(result, list):
        return result
    return []


def call_object_function(name: str, params: dict[str, Any] | None = None) -> dict:
    result = _call_function(name, params or {})
    if isinstance(result, dict):
        return result
    return {}


def _call_function(name: str, params: dict[str, Any]) -> Any:
    if not has_database_url():
        raise DbFunctionError("DATABASE_URL no configurada")

    clean = {k: (None if v in ("", None) else v) for k, v in params.items()}
    ttl = _cache_ttl_seconds()
    key = _cache_key(name, clean)
    if ttl > 0:
        cached = _CACHE.get(key)
        if cached and cached[0] > time.monotonic():
            return cached[1]

    placeholders = ", ".join(f"%({k})s" for k in clean)
    sql = (
        f"SELECT {name}({placeholders}) AS result"
        if placeholders
        else f"SELECT {name}() AS result"
    )

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, clean)
                row = cur.fetchone()
    except Exception as exc:
        msg = str(exc).lower()
        if "does not exist" in msg or "no existe" in msg:
            raise DbFunctionError(
                f"Ejecute los scripts sql/17 y sql/18 en Supabase antes de usar {name}"
            ) from exc
        raise

    if not row:
        return None

    result = row.get("result")
    if result is None:
        return None
    if isinstance(result, str):
        result = json.loads(result)
    if ttl > 0:
        _CACHE[key] = (time.monotonic() + ttl, result)
    return result
