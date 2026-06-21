from __future__ import annotations

from collections.abc import Iterable

from fastapi import Header, HTTPException, status

from src.repository.auth_repository import AuthRepository


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no enviado",
        )
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token vacio",
        )
    return token


def get_current_context(authorization: str | None = Header(default=None)) -> dict:
    token = _extract_bearer_token(authorization)
    try:
        return AuthRepository().context(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    return get_current_context(authorization).get("user") or {}


def require_roles(context: dict, roles: Iterable[str]) -> dict:
    user = context.get("user") or {}
    role = user.get("role")
    allowed = set(roles)
    if role not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para acceder a este recurso",
        )
    return context


def require_admin_or_director(context: dict) -> dict:
    return require_roles(context, {"ADMIN", "DIRECTOR"})


def require_teacher_scope(context: dict, docente_id: str | None = None) -> str:
    role = (context.get("user") or {}).get("role")
    if role in {"ADMIN", "DIRECTOR"}:
        if not docente_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="docente_id requerido para consulta institucional",
            )
        return docente_id
    if role != "TEACHER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo docentes o administracion pueden acceder a este resumen",
        )
    current_docente_id = (context.get("teacher") or {}).get("id")
    if not current_docente_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Docente sin entidad academica asociada",
        )
    if docente_id and docente_id != current_docente_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede consultar informacion de otro docente",
        )
    return current_docente_id


def require_student_scope(context: dict, estudiante_id: str | None = None) -> str:
    role = (context.get("user") or {}).get("role")
    if role in {"ADMIN", "DIRECTOR", "TEACHER"}:
        if not estudiante_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="estudiante_id requerido",
            )
        return estudiante_id
    if role == "STUDENT":
        current_student_id = (context.get("student") or {}).get("id")
        if not current_student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Estudiante sin entidad academica asociada",
            )
        if estudiante_id and estudiante_id != current_student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puede consultar informacion de otro estudiante",
            )
        return current_student_id
    if role == "PARENT":
        students = ((context.get("family") or {}).get("students")) or []
        allowed_ids = {student.get("id") for student in students if student.get("id")}
        selected_id = estudiante_id or ((context.get("student") or {}).get("id"))
        if not selected_id or selected_id not in allowed_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El estudiante no esta asociado al apoderado",
            )
        return selected_id
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="No tiene permisos para acceder a este resumen",
    )
