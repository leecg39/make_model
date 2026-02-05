# @TASK P2-R1-T1 - AI Models Pydantic schemas
# @SPEC docs/planning/02-trd.md#ai-models-api
"""AI Model schemas for request/response serialization.

Schemas:
    AIModelCreate      - Create request body
    AIModelUpdate      - Partial update request body
    AIModelResponse    - Single model response (detail)
    AIModelListItem    - Model item in list response (summary)
    AIModelListResponse - Paginated list response
    ModelImageResponse - Image response
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


# ---------------------------------------------------------------------------
# Allowed values
# ---------------------------------------------------------------------------

VALID_STYLES = {"casual", "formal", "sporty", "vintage"}
VALID_GENDERS = {"male", "female", "neutral"}
VALID_AGE_RANGES = {"10s", "20s", "30s", "40s+"}
VALID_STATUSES = {"draft", "active", "inactive"}
VALID_SORT_OPTIONS = {"popular", "recent", "rating"}


# ---------------------------------------------------------------------------
# Creator info (nested in model response)
# ---------------------------------------------------------------------------


class CreatorInfo(BaseModel):
    """Minimal creator info embedded in model responses."""
    id: str
    nickname: str
    profile_image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Image schemas
# ---------------------------------------------------------------------------


class ModelImageResponse(BaseModel):
    """Response schema for a model image."""
    id: str
    image_url: str
    display_order: int
    is_thumbnail: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Create / Update
# ---------------------------------------------------------------------------


class AIModelCreate(BaseModel):
    """Request body for creating an AI model."""
    name: str
    description: Optional[str] = None
    style: str
    gender: str
    age_range: str
    tags: list[str] = []

    @field_validator("style")
    @classmethod
    def validate_style(cls, v: str) -> str:
        if v not in VALID_STYLES:
            raise ValueError(f"style must be one of {VALID_STYLES}")
        return v

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        if v not in VALID_GENDERS:
            raise ValueError(f"gender must be one of {VALID_GENDERS}")
        return v

    @field_validator("age_range")
    @classmethod
    def validate_age_range(cls, v: str) -> str:
        if v not in VALID_AGE_RANGES:
            raise ValueError(f"age_range must be one of {VALID_AGE_RANGES}")
        return v


class AIModelUpdate(BaseModel):
    """Request body for updating an AI model (partial)."""
    name: Optional[str] = None
    description: Optional[str] = None
    style: Optional[str] = None
    gender: Optional[str] = None
    age_range: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[list[str]] = None

    @field_validator("style")
    @classmethod
    def validate_style(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_STYLES:
            raise ValueError(f"style must be one of {VALID_STYLES}")
        return v

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_GENDERS:
            raise ValueError(f"gender must be one of {VALID_GENDERS}")
        return v

    @field_validator("age_range")
    @classmethod
    def validate_age_range(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_AGE_RANGES:
            raise ValueError(f"age_range must be one of {VALID_AGE_RANGES}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class AIModelResponse(BaseModel):
    """Full model detail response (GET /api/models/:id)."""
    id: str
    creator_id: str
    name: str
    description: Optional[str] = None
    style: str
    gender: str
    age_range: str
    view_count: int
    rating: float
    status: str
    thumbnail_url: Optional[str] = None
    tags: list[str] = []
    images: list[ModelImageResponse] = []
    creator: Optional[CreatorInfo] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIModelListItem(BaseModel):
    """Summary model item for list responses (GET /api/models)."""
    id: str
    creator_id: str
    name: str
    style: str
    gender: str
    age_range: str
    view_count: int
    rating: float
    status: str
    thumbnail_url: Optional[str] = None
    tags: list[str] = []
    creator: Optional[CreatorInfo] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIModelListResponse(BaseModel):
    """Paginated list response for models."""
    items: list[AIModelListItem] = []
    total: int = 0
    page: int = 1
    limit: int = 12
