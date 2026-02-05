# @TASK P3-R3-T1 - Payments API endpoints
# @SPEC specs/domain/resources.yaml#payments
"""Payments API endpoints.

Routes:
    POST   /api/payments              - Create payment (brand only, JWT required)
    GET    /api/payments/:order_id     - Get payment by order (JWT required)
    POST   /api/payments/webhook       - PortOne webhook (no auth)
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.schemas.payment import (
    PaymentCreate,
    PaymentResponse,
    WebhookPayload,
)
from app.services.payment import (
    create_payment,
    get_payment_by_order,
    process_webhook,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _build_payment_response(payment) -> dict:
    """Build a payment response dict from an ORM Payment."""
    data = {
        "id": payment.id,
        "order_id": payment.order_id,
        "payment_provider": payment.payment_provider,
        "payment_method": payment.payment_method,
        "amount": payment.amount,
        "status": payment.status,
        "transaction_id": payment.transaction_id,
        "paid_at": payment.paid_at,
        "created_at": payment.created_at,
        "order": None,
    }

    if payment.order:
        data["order"] = {
            "id": payment.order.id,
            "order_number": payment.order.order_number,
            "status": payment.order.status,
            "total_price": payment.order.total_price,
        }

    return data


# ---------------------------------------------------------------------------
# POST /payments/webhook - PortOne webhook (no auth, must be before /{order_id})
# ---------------------------------------------------------------------------


@router.post("/webhook")
async def handle_webhook(
    payload: WebhookPayload,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PaymentResponse:
    """Process PortOne webhook notification.

    No authentication required (simulated webhook).
    """
    try:
        payment = await process_webhook(db, payload)
    except LookupError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return PaymentResponse(**_build_payment_response(payment))


# ---------------------------------------------------------------------------
# POST /payments - Create payment (brand only)
# ---------------------------------------------------------------------------


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_new_payment(
    payment_in: PaymentCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PaymentResponse:
    """Create a new payment for an order. Only brand users can create payments."""
    try:
        payment = await create_payment(db, payment_in, current_user)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except LookupError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except FileExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )

    return PaymentResponse(**_build_payment_response(payment))


# ---------------------------------------------------------------------------
# GET /payments/{order_id} - Get payment by order
# ---------------------------------------------------------------------------


@router.get("/{order_id}")
async def get_payment(
    order_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PaymentResponse:
    """Get payment information for an order."""
    try:
        payment = await get_payment_by_order(db, order_id, current_user)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except LookupError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found for this order",
        )

    return PaymentResponse(**_build_payment_response(payment))
