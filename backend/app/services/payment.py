# @TASK P3-R3-T1 - Payment business logic (create, retrieve, webhook)
# @SPEC specs/domain/resources.yaml#payments
"""Payment service: create payment, get by order, process webhook.

Business rules:
    - Only brand users can create payments
    - Order must be in 'accepted' status to create payment
    - One payment per order (unique constraint)
    - Webhook updates payment status (paid -> completed, failed -> failed)
    - Completed payment sets paid_at timestamp

@TEST tests/api/test_payments.py
"""
import logging
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, Payment
from app.models.user import User
from app.schemas.payment import PaymentCreate, WebhookPayload

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Create payment
# ---------------------------------------------------------------------------


async def create_payment(
    db: AsyncSession,
    data: PaymentCreate,
    user: User,
) -> Payment:
    """Create a payment for an order.

    Args:
        db: Async database session.
        data: Validated payment creation data.
        user: Current authenticated user (must be brand).

    Returns:
        Newly created Payment with order relationship loaded.

    Raises:
        PermissionError: If user is not a brand.
        LookupError: If order not found.
        ValueError: If order status is not 'accepted'.
        FileExistsError: If payment already exists for this order.
    """
    # Permission: brand only
    if user.role != "brand":
        raise PermissionError("Only brand users can create payments")

    # Load order
    stmt = (
        select(Order)
        .where(Order.id == data.order_id)
        .options(selectinload(Order.payment))
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if order is None:
        raise LookupError("Order not found")

    # Duplicate check (before status check, since first payment changes status)
    if order.payment is not None:
        raise FileExistsError("Payment already exists for this order")

    # Status check: must be accepted
    if order.status != "accepted":
        raise ValueError(
            f"Order status must be 'accepted' to create payment, "
            f"current status is '{order.status}'"
        )

    # Generate a simulated transaction_id (PortOne imp_uid simulation)
    transaction_id = f"imp_{uuid.uuid4().hex[:16]}"

    payment = Payment(
        order_id=data.order_id,
        payment_provider="portone",
        payment_method=data.payment_method,
        amount=data.amount,
        status="pending",
        transaction_id=transaction_id,
    )
    db.add(payment)

    # Update order status to in_progress
    order.status = "in_progress"

    await db.commit()

    # Reload with relationships
    return await get_payment_by_order(db, data.order_id)


# ---------------------------------------------------------------------------
# Get payment by order_id
# ---------------------------------------------------------------------------


async def get_payment_by_order(
    db: AsyncSession,
    order_id: str,
    user: Optional[User] = None,
) -> Optional[Payment]:
    """Get payment for an order.

    Args:
        db: Async database session.
        order_id: UUID of the order.
        user: If provided, checks permission (must be brand or creator of order).

    Returns:
        Payment with order relationship loaded, or None.

    Raises:
        PermissionError: If user is not the brand/creator of the order.
        LookupError: If order not found.
    """
    # Load order first to check permissions
    if user is not None:
        order_stmt = select(Order).where(Order.id == order_id)
        order_result = await db.execute(order_stmt)
        order = order_result.scalar_one_or_none()

        if order is None:
            raise LookupError("Order not found")

        if user.id not in (order.brand_id, order.creator_id):
            raise PermissionError("You do not have access to this order's payment")

    # Load payment
    stmt = (
        select(Payment)
        .where(Payment.order_id == order_id)
        .options(selectinload(Payment.order))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


# ---------------------------------------------------------------------------
# Process webhook
# ---------------------------------------------------------------------------


WEBHOOK_STATUS_MAP = {
    "paid": "completed",
    "failed": "failed",
}


async def process_webhook(
    db: AsyncSession,
    payload: WebhookPayload,
) -> Optional[Payment]:
    """Process a PortOne webhook payload.

    Args:
        db: Async database session.
        payload: Validated webhook payload.

    Returns:
        Updated Payment, or None if not found.

    Raises:
        LookupError: If payment with the given transaction_id not found.
    """
    # Find payment by transaction_id (imp_uid)
    stmt = (
        select(Payment)
        .where(Payment.transaction_id == payload.imp_uid)
        .options(selectinload(Payment.order))
    )
    result = await db.execute(stmt)
    payment = result.scalar_one_or_none()

    if payment is None:
        raise LookupError(f"Payment with transaction_id '{payload.imp_uid}' not found")

    # Map webhook status to internal status
    new_status = WEBHOOK_STATUS_MAP.get(payload.status)
    if new_status is None:
        raise ValueError(f"Unknown webhook status: {payload.status}")

    payment.status = new_status

    if new_status == "completed":
        payment.paid_at = datetime.utcnow()

    await db.commit()
    await db.refresh(payment)

    # Reload with relationships
    stmt = (
        select(Payment)
        .where(Payment.id == payment.id)
        .options(selectinload(Payment.order))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
