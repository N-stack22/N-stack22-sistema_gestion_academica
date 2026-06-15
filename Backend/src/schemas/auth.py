from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthUserResponse(BaseModel):
    id: str
    fullName: str
    email: str
    role: str
    accessToken: str
