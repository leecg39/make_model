# @TASK P4-R2-T1 - Chat Messages Pydantic schemas
# @SPEC specs/domain/resources.yaml#chat_messages
"""Chat message schemas for request/response serialization.

Schemas:
    MessageCreate       - Create request body (send a message)
    MessageResponse     - Single message response
    MessageListResponse - Paginated list of messages
    SenderInfo          - Embedded sender information
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


# ---------------------------------------------------------------------------
# Nested info schemas
# ---------------------------------------------------------------------------


class SenderInfo(BaseModel):
    """Minimal sender info embedded in message responses."""
    id: str
    nickname: str
    profile_image: Optional[str] = None
    role: str

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


class MessageCreate(BaseModel):
    """Request body for sending a chat message."""
    message: str
    attachment_url: Optional[str] = None

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("message must not be empty")
        if len(stripped) > 5000:
            raise ValueError("message must be 5000 characters or fewer")
        return stripped


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class MessageResponse(BaseModel):
    """Single chat message response."""
    id: str
    order_id: str
    sender_id: str
    message: str
    attachment_url: Optional[str] = None
    is_read: bool
    sender: Optional[SenderInfo] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageListResponse(BaseModel):
    """Paginated list response for chat messages."""
    items: list[MessageResponse] = []
    total: int = 0
    page: int = 1
    limit: int = 20
