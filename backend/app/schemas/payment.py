# @TASK P3-R3-T1 - Payment Pydantic schemas
# @SPEC specs/domain/resources.yaml#payments
"""Payment schemas for request/response serialization.

Schemas:
    PaymentCreate   - Create request body (brand submits payment)
    PaymentResponse - Single payment response (full detail)
    WebhookPayload  - PortOne webhook simulation payload
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


# ---------------------------------------------------------------------------
# Allowed values
# ---------------------------------------------------------------------------

VALID_PAYMENT_METHODS = {"card", "transfer"}
VALID_WEBHOOK_STATUSES = {"paid", "failed"}


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


class PaymentCreate(BaseModel):
    """Request body for creating a payment (brand only)."""
    order_id: str
    payment_method: str
    amount: int

    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, v: str) -> str:
        if v not in VALID_PAYMENT_METHODS:
            raise ValueError(f"payment_method must be one of {VALID_PAYMENT_METHODS}")
        return v

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("amount must be positive")
        return v


# ---------------------------------------------------------------------------
# Webhook
# ---------------------------------------------------------------------------


class WebhookPayload(BaseModel):
    """PortOne webhook simulation payload."""
    imp_uid: str
    merchant_uid: str
    status: str
    amount: int

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_WEBHOOK_STATUSES:
            raise ValueError(f"status must be one of {VALID_WEBHOOK_STATUSES}")
        return v


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------


class PaymentOrderInfo(BaseModel):
    """Minimal order info embedded in payment response."""
    id: str
    order_number: str
    status: str
    total_price: int

    model_config = ConfigDict(from_attributes=True)


class PaymentResponse(BaseModel):
    """Full payment detail response."""
    id: str
    order_id: str
    payment_provider: str
    payment_method: str
    amount: int
    status: str
    transaction_id: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime
    order: Optional[PaymentOrderInfo] = None

    model_config = ConfigDict(from_attributes=True)
