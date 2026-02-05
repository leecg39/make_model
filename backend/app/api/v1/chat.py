# @TASK P4-R2-T1 - Chat Messages API endpoints
# @SPEC specs/domain/resources.yaml#chat_messages
"""Chat Messages API endpoints.

Routes:
    GET   /api/orders/{order_id}/messages      - List messages (JWT, paginated)
    POST  /api/orders/{order_id}/messages      - Send message (JWT, 201)
    PATCH /api/orders/{order_id}/messages/read  - Mark as read (JWT)
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.schemas.chat import (
    MessageCreate,
    MessageListResponse,
    MessageResponse,
)
from app.services.chat import (
    list_messages,
    mark_as_read,
    send_message,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["chat"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _build_message_response(msg) -> dict:
    """Build a message response dict from an ORM ChatMessage."""
    data = {
        "id": msg.id,
        "order_id": msg.order_id,
        "sender_id": msg.sender_id,
        "message": msg.message,
        "attachment_url": msg.attachment_url,
        "is_read": msg.is_read,
        "sender": None,
        "created_at": msg.created_at,
    }

    if msg.sender:
        data["sender"] = {
            "id": msg.sender.id,
            "nickname": msg.sender.nickname,
            "profile_image": msg.sender.profile_image,
            "role": msg.sender.role,
        }

    return data


# ---------------------------------------------------------------------------
# GET /orders/{order_id}/messages - List chat messages
# ---------------------------------------------------------------------------


@router.get("/{order_id}/messages")
async def list_order_messages(
    order_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
) -> MessageListResponse:
    """List chat messages for a specific order.

    Only the brand or creator of the order can view messages.
    Messages are ordered by created_at ascending (oldest first).
    """
    try:
        messages, total = await list_messages(
            db, order_id, current_user, page=page, limit=limit
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order's messages",
        )

    items = [MessageResponse(**_build_message_response(m)) for m in messages]

    return MessageListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


# ---------------------------------------------------------------------------
# POST /orders/{order_id}/messages - Send chat message
# ---------------------------------------------------------------------------


@router.post("/{order_id}/messages", status_code=status.HTTP_201_CREATED)
async def send_order_message(
    order_id: str,
    message_in: MessageCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    """Send a chat message on an order.

    Only the brand or creator of the order can send messages.
    The sender_id is automatically set to the current user.
    """
    try:
        msg = await send_message(db, order_id, message_in, current_user)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order's messages",
        )

    return MessageResponse(**_build_message_response(msg))


# ---------------------------------------------------------------------------
# PATCH /orders/{order_id}/messages/read - Mark messages as read
# ---------------------------------------------------------------------------


@router.patch("/{order_id}/messages/read")
async def mark_messages_as_read(
    order_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Mark all unread messages from the other party as read.

    For example, if the brand calls this endpoint, all unread messages
    from the creator will be marked as read.
    """
    try:
        count = await mark_as_read(db, order_id, current_user)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order's messages",
        )

    return {"marked_as_read": count}
