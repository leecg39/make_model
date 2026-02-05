# @TASK P1-R1-T1 - User schemas (extended with role, company_name)
# @SPEC docs/planning/02-trd.md#user-resource
"""User schemas for request/response serialization."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    nickname: str
    profile_image: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    profile_image: Optional[str] = None
    company_name: Optional[str] = None


class UserResponse(BaseModel):
    """Public user representation returned by the API."""
    id: str
    email: str
    nickname: str
    role: str
    profile_image: Optional[str] = None
    company_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserInDB(UserResponse):
    hashed_password: str
