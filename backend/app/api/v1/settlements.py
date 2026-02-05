# @TASK P4-R3-T1 - Settlements API endpoints
# @SPEC specs/domain/resources.yaml#settlements
"""Settlements API endpoints.

Routes:
    GET    /api/settlements          - List settlements (creator only, JWT required)
    GET    /api/settlements/:id      - Get settlement detail (creator only, JWT required)
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.schemas.settlement import (
    SettlementListResponse,
    SettlementResponse,
)
from app.services.settlement import (
    get_settlement,
    list_settlements,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/settlements", tags=["settlements"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _build_settlement_response(settlement) -> dict:
    """Build a settlement response dict from an ORM Settlement."""
    data = {
        "id": settlement.id,
        "creator_id": settlement.creator_id,
        "order_id": settlement.order_id,
        "total_amount": settlement.total_amount,
        "platform_fee": settlement.platform_fee,
        "settlement_amount": settlement.settlement_amount,
        "status": settlement.status,
        "completed_at": settlement.completed_at,
        "created_at": settlement.created_at,
        "order": None,
    }

    if settlement.order:
        data["order"] = {
            "id": settlement.order.id,
            "order_number": settlement.order.order_number,
            "status": settlement.order.status,
            "total_price": settlement.order.total_price,
        }

    return data


# ---------------------------------------------------------------------------
# GET /settlements - List settlements (creator only)
# ---------------------------------------------------------------------------


@router.get("")
async def list_creator_settlements(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
) -> SettlementListResponse:
    """List settlements for the current creator.

    Only creator users can view their settlements.
    """
    try:
        settlements, total = await list_settlements(
            db, current_user, page=page, limit=limit
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    items = [
        SettlementResponse(**_build_settlement_response(s))
        for s in settlements
    ]

    return SettlementListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


# ---------------------------------------------------------------------------
# GET /settlements/{settlement_id} - Get settlement detail
# ---------------------------------------------------------------------------


@router.get("/{settlement_id}")
async def get_settlement_detail(
    settlement_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SettlementResponse:
    """Get a single settlement by ID. Only the settlement's creator can view."""
    try:
        settlement = await get_settlement(db, settlement_id, current_user)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    if settlement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settlement not found",
        )

    return SettlementResponse(**_build_settlement_response(settlement))
