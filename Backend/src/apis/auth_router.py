from fastapi import APIRouter, Header

from src.schemas.auth import AuthUserResponse, LoginRequest
from src.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])
service = AuthService()


@router.post("/login", response_model=AuthUserResponse)
def login(data: LoginRequest):
    return service.login(data)


@router.get("/me", response_model=AuthUserResponse)
def me(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no enviado",
        )

    token = authorization.removeprefix("Bearer ").strip()
    return service.me(token)


@router.get("/context")
def context(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no enviado",
        )

    token = authorization.removeprefix("Bearer ").strip()
    return service.context(token)
