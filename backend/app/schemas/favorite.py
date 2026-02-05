# @TASK P2-R2-T1 - Favorites schemas (Create, Response, ListResponse)
# @SPEC docs/planning/02-trd.md#favorites-api
"""Pydantic schemas for favorites (bookmarks) resource."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Nested model info (included in favorite responses)
# ---------------------------------------------------------------------------


class AIModelBrief(BaseModel):
    """Brief AI model info included in favorite list responses."""
    id: str
    name: str
    description: Optional[str] = None
    style: str
    gender: str
    age_range: str
    rating: float
    status: str
    thumbnail: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class FavoriteCreate(BaseModel):
    """Request body for adding a favorite."""
    model_id: str


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class FavoriteResponse(BaseModel):
    """Single favorite response (returned on POST)."""
    id: str
    user_id: str
    model_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FavoriteWithModel(BaseModel):
    """Favorite response with nested AI model info (used in list)."""
    id: str
    user_id: str
    model_id: str
    created_at: datetime
    model: Optional[AIModelBrief] = None

    model_config = ConfigDict(from_attributes=True)


class FavoriteListResponse(BaseModel):
    """Paginated list of favorites."""
    items: list[FavoriteWithModel]
    total: int
    page: int
    limit: int
