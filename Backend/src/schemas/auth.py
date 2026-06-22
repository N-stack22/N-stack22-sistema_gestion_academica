from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class AuthUserResponse(BaseModel):
    id: str
    fullName: str
    email: str
    role: str
    accessToken: str
