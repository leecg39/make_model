# @TASK P3-R2-T1 - Orders Pydantic schemas
# @SPEC docs/planning/02-trd.md#orders-api
"""Order schemas for request/response serialization.

Schemas:
    OrderCreate       - Create request body (brand submits order)
    OrderResponse     - Single order response (detail)
    OrderListItem     - Order item in list response (summary)
    OrderListResponse - Paginated list response
    StatusUpdate      - Status change action
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


# ---------------------------------------------------------------------------
# Allowed values
# ---------------------------------------------------------------------------

VALID_PACKAGE_TYPES = {"standard", "premium", "exclusive"}
VALID_STATUSES = {"pending", "accepted", "rejected", "in_progress", "completed", "cancelled"}
VALID_ACTIONS = {"accept", "reject", "start", "complete", "cancel"}


# ---------------------------------------------------------------------------
# Nested info schemas
# ---------------------------------------------------------------------------


class OrderBrandInfo(BaseModel):
    """Minimal brand info embedded in order responses."""
    id: str
    nickname: str
    company_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrderCreatorInfo(BaseModel):
    """Minimal creator info embedded in order responses."""
    id: str
    nickname: str
    profile_image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrderModelInfo(BaseModel):
    """Minimal AI model info embedded in order responses."""
    id: str
    name: str
    style: str

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Create / Update
# ---------------------------------------------------------------------------


class OrderCreate(BaseModel):
    """Request body for creating an order (brand only)."""
    model_id: str
    creator_id: str
    concept_description: str
    package_type: str
    image_count: int
    is_exclusive: bool = False
    exclusive_months: Optional[int] = None
    total_price: int

    @field_validator("package_type")
    @classmethod
    def validate_package_type(cls, v: str) -> str:
        if v not in VALID_PACKAGE_TYPES:
            raise ValueError(f"package_type must be one of {VALID_PACKAGE_TYPES}")
        return v

    @field_validator("image_count")
    @classmethod
    def validate_image_count(cls, v: int) -> int:
        if v < 1:
            raise ValueError("image_count must be at least 1")
        return v

    @field_validator("total_price")
    @classmethod
    def validate_total_price(cls, v: int) -> int:
        if v < 0:
            raise ValueError("total_price must be non-negative")
        return v


class StatusUpdate(BaseModel):
    """Request body for updating order status."""
    action: str

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: str) -> str:
        if v not in VALID_ACTIONS:
            raise ValueError(f"action must be one of {VALID_ACTIONS}")
        return v


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class OrderResponse(BaseModel):
    """Full order detail response."""
    id: str
    brand_id: str
    creator_id: str
    model_id: str
    order_number: str
    concept_description: str
    package_type: str
    image_count: int
    is_exclusive: bool
    exclusive_months: Optional[int] = None
    total_price: int
    status: str
    brand: Optional[OrderBrandInfo] = None
    creator: Optional[OrderCreatorInfo] = None
    model: Optional[OrderModelInfo] = None
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderListItem(BaseModel):
    """Summary order item for list responses."""
    id: str
    brand_id: str
    creator_id: str
    model_id: str
    order_number: str
    package_type: str
    image_count: int
    total_price: int
    status: str
    brand: Optional[OrderBrandInfo] = None
    creator: Optional[OrderCreatorInfo] = None
    model: Optional[OrderModelInfo] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    """Paginated list response for orders."""
    items: list[OrderListItem] = []
    total: int = 0
    page: int = 1
    limit: int = 20
