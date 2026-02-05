# @TASK P4-R1-T1 - Delivery Files business logic
# @SPEC docs/planning/02-trd.md#delivery-files-api
"""Delivery file service: list files, upload file.

Permissions:
    - list_files:  brand or creator of the order can view
    - upload_file: only the creator of the order can upload

@TEST tests/api/test_delivery.py
"""
import logging
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.delivery import DeliveryFile
from app.models.order import Order
from app.models.user import User
from app.schemas.delivery import DeliveryFileCreate

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def get_order_by_id(
    db: AsyncSession,
    order_id: str,
) -> Optional[Order]:
    """Get a single order by ID (without heavy relationship loading).

    Args:
        db: Async database session.
        order_id: UUID of the order.

    Returns:
        Order or None.
    """
    stmt = select(Order).where(Order.id == order_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


# ---------------------------------------------------------------------------
# List files
# ---------------------------------------------------------------------------


async def list_files(
    db: AsyncSession,
    order_id: str,
    user: User,
) -> list[DeliveryFile]:
    """List delivery files for an order.

    Only the brand or creator of the order can view files.

    Args:
        db: Async database session.
        order_id: UUID of the order.
        user: Current authenticated user.

    Returns:
        List of DeliveryFile objects.

    Raises:
        ValueError: If the order does not exist.
        PermissionError: If the user is not the brand or creator of the order.
    """
    order = await get_order_by_id(db, order_id)
    if order is None:
        raise ValueError("Order not found")

    if user.id not in (order.brand_id, order.creator_id):
        raise PermissionError("You do not have access to this order")

    stmt = (
        select(DeliveryFile)
        .where(DeliveryFile.order_id == order_id)
        .order_by(DeliveryFile.uploaded_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Upload file
# ---------------------------------------------------------------------------


async def upload_file(
    db: AsyncSession,
    order_id: str,
    data: DeliveryFileCreate,
    user: User,
) -> DeliveryFile:
    """Upload a delivery file for an order.

    Only the creator of the order can upload files.

    Args:
        db: Async database session.
        order_id: UUID of the order.
        data: Validated file data (url, name, size).
        user: Current authenticated user.

    Returns:
        The newly created DeliveryFile.

    Raises:
        ValueError: If the order does not exist.
        PermissionError: If the user is not the creator of the order.
    """
    order = await get_order_by_id(db, order_id)
    if order is None:
        raise ValueError("Order not found")

    if user.id != order.creator_id:
        raise PermissionError("Only the creator of this order can upload files")

    delivery_file = DeliveryFile(
        order_id=order_id,
        file_url=data.file_url,
        file_name=data.file_name,
        file_size=data.file_size,
    )
    db.add(delivery_file)
    await db.commit()
    await db.refresh(delivery_file)

    return delivery_file
