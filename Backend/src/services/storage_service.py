import mimetypes
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from src.services.database import get_supabase

_DEFAULT_BUCKETS = ("recursos-academicos", "recursos", "resources")
_ALLOWED_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".png",
    ".jpg",
    ".jpeg",
}


def _first_env(*names: str) -> str:
    for name in names:
        value = (os.getenv(name) or "").strip()
        if value:
            return value
    return ""


def _bucket_candidates() -> list[str]:
    configured = _first_env("SUPABASE_RESOURCE_BUCKET", "SUPABASE_STORAGE_BUCKET", "RESOURCE_BUCKET")
    candidates = [configured, *_DEFAULT_BUCKETS]
    result: list[str] = []
    for bucket in candidates:
        if bucket and bucket not in result:
            result.append(bucket)
    return result


def _max_file_size_bytes() -> int:
    try:
        mb = int(os.getenv("RESOURCE_UPLOAD_MAX_MB", "15"))
    except ValueError:
        mb = 15
    return max(mb, 1) * 1024 * 1024


def _signed_url_seconds() -> int:
    try:
        return int(os.getenv("SUPABASE_RESOURCE_SIGNED_URL_SECONDS", "3600"))
    except ValueError:
        return 3600


def _safe_filename(filename: str) -> str:
    name = Path(filename or "recurso.pdf").name
    stem = Path(name).stem or "recurso"
    ext = Path(name).suffix.lower() or ".pdf"
    safe_stem = re.sub(r"[^A-Za-z0-9._-]+", "-", stem).strip("-._") or "recurso"
    return f"{safe_stem[:80]}{ext}"


def is_storage_reference(value: str) -> bool:
    return value.startswith("supabase://")


def _parse_storage_reference(value: str) -> tuple[str, str] | None:
    if not is_storage_reference(value):
        return None
    rest = value.removeprefix("supabase://")
    bucket, _, path = rest.partition("/")
    if not bucket or not path:
        return None
    return bucket, path


def _extract_signed_url(response) -> str:
    if isinstance(response, dict):
        return (
            response.get("signedURL")
            or response.get("signedUrl")
            or response.get("signed_url")
            or ""
        )
    return (
        getattr(response, "signed_url", "")
        or getattr(response, "signedURL", "")
        or getattr(response, "signedUrl", "")
        or ""
    )


def resolve_storage_url(reference: str) -> str:
    parsed = _parse_storage_reference(reference)
    if not parsed:
        return reference

    bucket, path = parsed
    storage = get_supabase().storage.from_(bucket)
    try:
        signed = storage.create_signed_url(path, _signed_url_seconds())
        signed_url = _extract_signed_url(signed)
        if signed_url:
            return signed_url
    except Exception:
        pass

    return storage.get_public_url(path)


def upload_resource_file(filename: str, content: bytes, content_type: str | None = None) -> dict:
    if not content:
        raise ValueError("El archivo esta vacio.")
    if len(content) > _max_file_size_bytes():
        raise ValueError("El archivo supera el tamano maximo permitido.")

    safe_name = _safe_filename(filename)
    ext = Path(safe_name).suffix.lower()
    if ext not in _ALLOWED_EXTENSIONS:
        raise ValueError("Tipo de archivo no permitido para recursos academicos.")

    guessed_type = content_type or mimetypes.guess_type(safe_name)[0] or "application/octet-stream"
    today = datetime.now(timezone.utc).strftime("%Y/%m/%d")
    path = f"recursos/{today}/{uuid4().hex}-{safe_name}"
    options = {
        "content-type": guessed_type,
        "cache-control": "3600",
        "x-upsert": "false",
    }

    last_error: Exception | None = None
    client = get_supabase()
    for bucket in _bucket_candidates():
        try:
            client.storage.from_(bucket).upload(path, content, options)
            storage_ref = f"supabase://{bucket}/{path}"
            return {
                "archivo_url": storage_ref,
                "nombre_archivo": safe_name,
                "fileUrl": resolve_storage_url(storage_ref),
                "bucket": bucket,
                "path": path,
            }
        except Exception as exc:
            last_error = exc

    detail = f" Detalle: {last_error}" if last_error else ""
    raise ValueError(
        "No se pudo subir el archivo al bucket de Supabase Storage. "
        "Verifique SUPABASE_RESOURCE_BUCKET en Railway/Backend/.env y permisos del bucket."
        f"{detail}"
    )
