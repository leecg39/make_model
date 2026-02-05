# @TASK P3-R2-T1 - Orders business logic (CRUD, status machine, permissions)
# @SPEC docs/planning/02-trd.md#orders-api
"""Order service: create, list, detail, status transitions.

State machine:
    pending -> accepted (creator accepts)
    pending -> rejected (creator rejects)
    pending -> cancelled (brand cancels)
    accepted -> in_progress (creator starts work)
    accepted -> cancelled (brand cancels)
    in_progress -> completed (brand or creator completes)
    in_progress -> cancelled (brand cancels)

@TEST tests/api/test_orders.py
"""
import logging
from datetime import datetime
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderCreate

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# State machine: defines valid transitions per action
# ---------------------------------------------------------------------------

# action -> { current_status -> new_status }
STATE_TRANSITIONS = {
    "accept": {"pending": "accepted"},
    "reject": {"pending": "rejected"},
    "start": {"accepted": "in_progress"},
    "complete": {"in_progress": "completed"},
    "cancel": {"pending": "cancelled", "accepted": "cancelled", "in_progress": "cancelled"},
}

# action -> set of roles allowed to perform it
ACTION_PERMISSIONS = {
    "accept": {"creator"},
    "reject": {"creator"},
    "start": {"creator"},
    "complete": {"brand", "creator"},
    "cancel": {"brand"},
}


# ---------------------------------------------------------------------------
# Order number generation
# ---------------------------------------------------------------------------


async def _generate_order_number(db: AsyncSession) -> str:
    """Generate a unique order number in ORD-YYYYMMDD-NNN format.

    Uses today's date and counts existing orders for today to determine
    the sequence number.
    """
    today = datetime.utcnow().strftime("%Y%m%d")
    prefix = f"ORD-{today}-"

    # Count orders with today's prefix
    count_stmt = select(func.count(Order.id)).where(
        Order.order_number.like(f"{prefix}%")
    )
    result = await db.execute(count_stmt)
    count = result.scalar_one()

    sequence = count + 1
    return f"{prefix}{sequence:03d}"


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


async def create_order(
    db: AsyncSession,
    brand_id: str,
    order_in: OrderCreate,
) -> Order:
    """Create a new order.

    Args:
        db: Async database session.
        brand_id: ID of the brand user creating the order.
        order_in: Validated order creation data.

    Returns:
        The newly created Order with relationships loaded.
    """
    order_number = await _generate_order_number(db)

    order = Order(
        brand_id=brand_id,
        creator_id=order_in.creator_id,
        model_id=order_in.model_id,
        order_number=order_number,
        concept_description=order_in.concept_description,
        package_type=order_in.package_type,
        image_count=order_in.image_count,
        is_exclusive=order_in.is_exclusive,
        exclusive_months=order_in.exclusive_months,
        total_price=order_in.total_price,
        status="pending",
    )
    db.add(order)
    await db.commit()

    # Reload with relationships
    return await get_order_by_id(db, order.id)


# ---------------------------------------------------------------------------
# Read (single)
# ---------------------------------------------------------------------------


async def get_order_by_id(
    db: AsyncSession,
    order_id: str,
) -> Optional[Order]:
    """Get a single order by ID with relationships loaded.

    Args:
        db: Async database session.
        order_id: UUID of the order.

    Returns:
        Order with brand_user, creator_user, model loaded, or None.
    """
    stmt = (
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.brand_user),
            selectinload(Order.creator_user),
            selectinload(Order.model),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


# ---------------------------------------------------------------------------
# Read (list with role-based filtering)
# ---------------------------------------------------------------------------


async def list_orders(
    db: AsyncSession,
    user: User,
    *,
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[str] = None,
) -> tuple[list[Order], int]:
    """List orders filtered by user role.

    - brand: sees orders where brand_id == user.id
    - creator: sees orders where creator_id == user.id

    Args:
        db: Async database session.
        user: Current authenticated user.
        page: Page number (1-based).
        limit: Items per page.
        status_filter: Optional status filter.

    Returns:
        Tuple of (list of Order, total count).
    """
    base_stmt = select(Order)
    count_stmt = select(func.count(Order.id))

    # Role-based filtering
    if user.role == "brand":
        base_stmt = base_stmt.where(Order.brand_id == user.id)
        count_stmt = count_stmt.where(Order.brand_id == user.id)
    elif user.role == "creator":
        base_stmt = base_stmt.where(Order.creator_id == user.id)
        count_stmt = count_stmt.where(Order.creator_id == user.id)

    # Status filter
    if status_filter:
        base_stmt = base_stmt.where(Order.status == status_filter)
        count_stmt = count_stmt.where(Order.status == status_filter)

    # Get total count
    count_result = await db.execute(count_stmt)
    total = count_result.scalar_one()

    # Sort by newest first
    base_stmt = base_stmt.order_by(Order.created_at.desc())

    # Pagination
    offset = (page - 1) * limit
    base_stmt = base_stmt.offset(offset).limit(limit)

    # Load relationships
    base_stmt = base_stmt.options(
        selectinload(Order.brand_user),
        selectinload(Order.creator_user),
        selectinload(Order.model),
    )

    result = await db.execute(base_stmt)
    orders = list(result.scalars().all())

    return orders, total


# ---------------------------------------------------------------------------
# Status update
# ---------------------------------------------------------------------------


async def update_order_status(
    db: AsyncSession,
    order: Order,
    action: str,
    user: User,
) -> Order:
    """Update order status based on action.

    Validates:
        1. The action is a valid transition from the current status.
        2. The user has permission to perform this action.

    Args:
        db: Async database session.
        order: The Order to update.
        action: The action to perform (accept/reject/start/complete/cancel).
        user: The user performing the action.

    Returns:
        Updated Order.

    Raises:
        ValueError: If transition is invalid.
        PermissionError: If user lacks permission.
    """
    # Check permission
    allowed_roles = ACTION_PERMISSIONS.get(action, set())
    if user.role not in allowed_roles:
        raise PermissionError(
            f"Role '{user.role}' is not allowed to perform '{action}'"
        )

    # Check transition
    transitions = STATE_TRANSITIONS.get(action, {})
    new_status = transitions.get(order.status)
    if new_status is None:
        raise ValueError(
            f"Cannot perform '{action}' on order with status '{order.status}'"
        )

    # Apply transition
    order.status = new_status
    now = datetime.utcnow()

    if new_status == "accepted":
        order.accepted_at = now
    elif new_status == "completed":
        order.completed_at = now

    await db.commit()
    await db.refresh(order)

    # Reload with relationships
    return await get_order_by_id(db, order.id)
