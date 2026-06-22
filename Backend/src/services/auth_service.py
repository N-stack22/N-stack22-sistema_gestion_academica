from fastapi import HTTPException, status

from src.repository.auth_repository import AuthRepository
from src.schemas.auth import LoginRequest, PasswordChangeRequest


class AuthService:
    def __init__(self, repository: AuthRepository | None = None):
        self._repository = repository or AuthRepository()

    def login(self, data: LoginRequest) -> dict:
        try:
            return self._repository.login(data.email, data.password)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(exc),
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            ) from exc

    def me(self, access_token: str) -> dict:
        try:
            return self._repository.me(access_token)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(exc),
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Sesion invalida",
            ) from exc

    def context(self, access_token: str) -> dict:
        try:
            return self._repository.context(access_token)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(exc),
            ) from exc

    def cambiar_password(self, data: PasswordChangeRequest, context: dict) -> dict:
        user = context.get("user") or {}
        user_id = user.get("id")
        email = user.get("email")
        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Sesion invalida",
            )

        try:
            self._repository.change_password(
                user_id,
                email,
                data.current_password,
                data.new_password,
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            ) from exc

        return {"message": "Contrasena actualizada correctamente"}
