# @TASK P4-R3-T1 - Settlement Pydantic schemas
# @SPEC specs/domain/resources.yaml#settlements
"""Settlement schemas for request/response serialization.

Schemas:
    SettlementResponse     - Single settlement response (full detail with order info)
    SettlementListResponse - Paginated list response
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Nested info schemas
# ---------------------------------------------------------------------------


class SettlementOrderInfo(BaseModel):
    """Minimal order info embedded in settlement response."""
    id: str
    order_number: str
    status: str
    total_price: int

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class SettlementResponse(BaseModel):
    """Full settlement detail response."""
    id: str
    creator_id: str
    order_id: str
    total_amount: int
    platform_fee: int
    settlement_amount: int
    status: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    order: Optional[SettlementOrderInfo] = None

    model_config = ConfigDict(from_attributes=True)


class SettlementListResponse(BaseModel):
    """Paginated list response for settlements."""
    items: list[SettlementResponse] = []
    total: int = 0
    page: int = 1
    limit: int = 20
