# @TASK P4-R2-T1 - Chat Messages business logic
# @SPEC specs/domain/resources.yaml#chat_messages
"""Chat message service: list, send, mark as read.

Permissions:
    - Only the brand and creator of an order can send/view messages.
    - mark_as_read marks the OTHER party's messages as read.

@TEST tests/api/test_chat.py
"""
import logging
from typing import Optional

from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat import ChatMessage
from app.models.order import Order
from app.models.user import User
from app.schemas.chat import MessageCreate

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _get_order_with_permission(
    db: AsyncSession,
    order_id: str,
    user: User,
) -> Optional[Order]:
    """Load the order and verify the user is a party (brand or creator).

    Returns:
        The Order if found and user has access, None if not found.

    Raises:
        PermissionError: If the user is not the brand or creator.
    """
    stmt = select(Order).where(Order.id == order_id)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if order is None:
        return None

    if user.id not in (order.brand_id, order.creator_id):
        raise PermissionError("You do not have access to this order's messages")

    return order


# ---------------------------------------------------------------------------
# List messages
# ---------------------------------------------------------------------------


async def list_messages(
    db: AsyncSession,
    order_id: str,
    user: User,
    *,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[ChatMessage], int]:
    """List chat messages for an order with pagination.

    Args:
        db: Async database session.
        order_id: UUID of the order.
        user: Current authenticated user (must be brand or creator of the order).
        page: Page number (1-based).
        limit: Items per page.

    Returns:
        Tuple of (list of ChatMessage with sender loaded, total count).

    Raises:
        PermissionError: If user is not a party to the order.
        ValueError: If the order does not exist.
    """
    order = await _get_order_with_permission(db, order_id, user)
    if order is None:
        raise ValueError("Order not found")

    # Count total messages for this order
    count_stmt = select(func.count(ChatMessage.id)).where(
        ChatMessage.order_id == order_id
    )
    count_result = await db.execute(count_stmt)
    total = count_result.scalar_one()

    # Fetch messages with sender, ordered by created_at ascending (oldest first)
    offset = (page - 1) * limit
    stmt = (
        select(ChatMessage)
        .where(ChatMessage.order_id == order_id)
        .options(selectinload(ChatMessage.sender))
        .order_by(ChatMessage.created_at.asc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    messages = list(result.scalars().all())

    return messages, total


# ---------------------------------------------------------------------------
# Send message
# ---------------------------------------------------------------------------


async def send_message(
    db: AsyncSession,
    order_id: str,
    data: MessageCreate,
    user: User,
) -> ChatMessage:
    """Send a chat message on an order.

    Args:
        db: Async database session.
        order_id: UUID of the order.
        data: Validated message data.
        user: Current authenticated user (sender).

    Returns:
        The newly created ChatMessage with sender loaded.

    Raises:
        PermissionError: If user is not a party to the order.
        ValueError: If the order does not exist.
    """
    order = await _get_order_with_permission(db, order_id, user)
    if order is None:
        raise ValueError("Order not found")

    msg = ChatMessage(
        order_id=order_id,
        sender_id=user.id,
        message=data.message,
        attachment_url=data.attachment_url,
    )
    db.add(msg)
    await db.commit()

    # Reload with sender relationship
    stmt = (
        select(ChatMessage)
        .where(ChatMessage.id == msg.id)
        .options(selectinload(ChatMessage.sender))
    )
    result = await db.execute(stmt)
    return result.scalar_one()


# ---------------------------------------------------------------------------
# Mark as read
# ---------------------------------------------------------------------------


async def mark_as_read(
    db: AsyncSession,
    order_id: str,
    user: User,
) -> int:
    """Mark all unread messages from the OTHER party as read.

    For example, if user is the brand, all messages sent by the creator
    for this order will be marked as read.

    Args:
        db: Async database session.
        order_id: UUID of the order.
        user: Current authenticated user (reader).

    Returns:
        Number of messages marked as read.

    Raises:
        PermissionError: If user is not a party to the order.
        ValueError: If the order does not exist.
    """
    order = await _get_order_with_permission(db, order_id, user)
    if order is None:
        raise ValueError("Order not found")

    # Mark messages from the OTHER party as read
    stmt = (
        update(ChatMessage)
        .where(
            ChatMessage.order_id == order_id,
            ChatMessage.sender_id != user.id,
            ChatMessage.is_read == False,  # noqa: E712
        )
        .values(is_read=True)
    )
    result = await db.execute(stmt)
    await db.commit()

    return result.rowcount
