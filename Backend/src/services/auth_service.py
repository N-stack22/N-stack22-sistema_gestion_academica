from fastapi import HTTPException, status

from src.repository.auth_repository import AuthRepository
from src.schemas.auth import LoginRequest


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
