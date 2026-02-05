# @TASK P4-R3-T1 - Settlement business logic (list, detail, auto-create)
# @SPEC specs/domain/resources.yaml#settlements
"""Settlement service: list settlements, get detail, create on order completion.

Business rules:
    - Only creator can view their own settlements
    - Settlement is auto-created when order status transitions to 'completed'
    - platform_fee = total_amount * 10%
    - settlement_amount = total_amount - platform_fee

@TEST tests/api/test_settlements.py
"""
import logging
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order
from app.models.settlement import Settlement
from app.models.user import User

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Fee calculation constants
# ---------------------------------------------------------------------------

PLATFORM_FEE_RATE = 0.10  # 10%


# ---------------------------------------------------------------------------
# List settlements (creator only)
# ---------------------------------------------------------------------------


async def list_settlements(
    db: AsyncSession,
    user: User,
    *,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Settlement], int]:
    """List settlements for the current creator.

    Args:
        db: Async database session.
        user: Current authenticated user (must be creator).
        page: Page number (1-based).
        limit: Items per page.

    Returns:
        Tuple of (list of Settlement, total count).

    Raises:
        PermissionError: If user is not a creator.
    """
    if user.role != "creator":
        raise PermissionError("Only creators can view settlements")

    base_stmt = select(Settlement).where(Settlement.creator_id == user.id)
    count_stmt = select(func.count(Settlement.id)).where(
        Settlement.creator_id == user.id
    )

    # Get total count
    count_result = await db.execute(count_stmt)
    total = count_result.scalar_one()

    # Sort by newest first, paginate
    base_stmt = base_stmt.order_by(Settlement.created_at.desc())
    offset = (page - 1) * limit
    base_stmt = base_stmt.offset(offset).limit(limit)

    # Load relationships
    base_stmt = base_stmt.options(selectinload(Settlement.order))

    result = await db.execute(base_stmt)
    settlements = list(result.scalars().all())

    return settlements, total


# ---------------------------------------------------------------------------
# Get single settlement (creator only)
# ---------------------------------------------------------------------------


async def get_settlement(
    db: AsyncSession,
    settlement_id: str,
    user: User,
) -> Optional[Settlement]:
    """Get a single settlement by ID.

    Args:
        db: Async database session.
        settlement_id: UUID of the settlement.
        user: Current authenticated user.

    Returns:
        Settlement with order relationship loaded, or None.

    Raises:
        PermissionError: If user is not the creator of this settlement.
    """
    stmt = (
        select(Settlement)
        .where(Settlement.id == settlement_id)
        .options(selectinload(Settlement.order))
    )
    result = await db.execute(stmt)
    settlement = result.scalar_one_or_none()

    if settlement is None:
        return None

    # Permission check: only the settlement's creator can view
    if settlement.creator_id != user.id:
        raise PermissionError("You do not have access to this settlement")

    return settlement


# ---------------------------------------------------------------------------
# Create settlement for completed order
# ---------------------------------------------------------------------------


async def create_settlement_for_order(
    db: AsyncSession,
    order: Order,
) -> Settlement:
    """Create a settlement record when an order is completed.

    Calculates:
        total_amount = order.total_price
        platform_fee = total_amount * 10%
        settlement_amount = total_amount - platform_fee

    Args:
        db: Async database session.
        order: The completed Order.

    Returns:
        Newly created Settlement.
    """
    total_amount = order.total_price
    platform_fee = int(total_amount * PLATFORM_FEE_RATE)
    settlement_amount = total_amount - platform_fee

    settlement = Settlement(
        creator_id=order.creator_id,
        order_id=order.id,
        total_amount=total_amount,
        platform_fee=platform_fee,
        settlement_amount=settlement_amount,
        status="pending",
    )
    db.add(settlement)
    await db.flush()

    return settlement
