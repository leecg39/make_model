# @TASK P1-R1-T1 - Authentication schemas (extended)
# @SPEC docs/planning/02-trd.md#auth-api
"""Authentication schemas with role, refresh token, and validation."""
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator, model_validator

from app.schemas.user import UserResponse


class Token(BaseModel):
    """Access + refresh token pair returned on login."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenResponse(Token):
    """Token response that also includes user profile."""
    user: UserResponse


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None  # "access" or "refresh"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    nickname: str
    role: str = "creator"  # "brand" or "creator"
    company_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        allowed = {"brand", "creator"}
        if v not in allowed:
            raise ValueError(f"role must be one of {allowed}")
        return v

    @model_validator(mode="after")
    def brand_requires_company_name(self) -> "RegisterRequest":
        if self.role == "brand" and not self.company_name:
            raise ValueError("company_name is required for brand role")
        return self


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def new_password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters")
        return v


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class SocialLoginRequest(BaseModel):
    access_token: str
