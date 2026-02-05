# @TASK P4-R1-T1 - Delivery Files Pydantic schemas
# @SPEC docs/planning/02-trd.md#delivery-files-api
"""Delivery file schemas for request/response serialization.

Schemas:
    DeliveryFileCreate   - Upload request body (creator submits file info)
    DeliveryFileResponse - Single delivery file response
    DeliveryFileListResponse - List of delivery files
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB in bytes


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


class DeliveryFileCreate(BaseModel):
    """Request body for uploading a delivery file (creator only)."""
    file_url: str
    file_name: str
    file_size: int

    @field_validator("file_url")
    @classmethod
    def validate_file_url(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("file_url must not be empty")
        if not v.startswith(("http://", "https://")):
            raise ValueError("file_url must be a valid URL starting with http:// or https://")
        return v

    @field_validator("file_name")
    @classmethod
    def validate_file_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("file_name must not be empty")
        if len(v) > 255:
            raise ValueError("file_name must be 255 characters or less")
        return v

    @field_validator("file_size")
    @classmethod
    def validate_file_size(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("file_size must be a positive integer")
        if v > MAX_FILE_SIZE:
            raise ValueError(
                f"file_size must not exceed {MAX_FILE_SIZE} bytes (10 MB)"
            )
        return v


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------


class DeliveryFileResponse(BaseModel):
    """Single delivery file response."""
    id: str
    order_id: str
    file_url: str
    file_name: str
    file_size: int
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeliveryFileListResponse(BaseModel):
    """List response for delivery files."""
    items: list[DeliveryFileResponse] = []
    total: int = 0
