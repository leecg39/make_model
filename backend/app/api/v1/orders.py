# @TASK P3-R2-T1 - Orders API endpoints
# @SPEC docs/planning/02-trd.md#orders-api
"""Orders API endpoints.

Routes:
    GET    /api/orders              - List orders (role-based filtering)
    GET    /api/orders/:id          - Get order detail
    POST   /api/orders              - Create order (brand only)
    PATCH  /api/orders/:id/status   - Update order status (accept/reject/start/complete/cancel)
"""
import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.schemas.order import (
    OrderCreate,
    OrderListItem,
    OrderListResponse,
    OrderResponse,
    StatusUpdate,
)
from app.services.order import (
    create_order,
    get_order_by_id,
    list_orders,
    update_order_status,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["orders"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _build_order_response(order) -> dict:
    """Build an order response dict from an ORM Order."""
    data = {
        "id": order.id,
        "brand_id": order.brand_id,
        "creator_id": order.creator_id,
        "model_id": order.model_id,
        "order_number": order.order_number,
        "concept_description": order.concept_description,
        "package_type": order.package_type,
        "image_count": order.image_count,
        "is_exclusive": order.is_exclusive,
        "exclusive_months": order.exclusive_months,
        "total_price": order.total_price,
        "status": order.status,
        "accepted_at": order.accepted_at,
        "completed_at": order.completed_at,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "brand": None,
        "creator": None,
        "model": None,
    }

    if order.brand_user:
        data["brand"] = {
            "id": order.brand_user.id,
            "nickname": order.brand_user.nickname,
            "company_name": order.brand_user.company_name,
        }

    if order.creator_user:
        data["creator"] = {
            "id": order.creator_user.id,
            "nickname": order.creator_user.nickname,
            "profile_image": order.creator_user.profile_image,
        }

    if order.model:
        data["model"] = {
            "id": order.model.id,
            "name": order.model.name,
            "style": order.model.style,
        }

    return data


def _build_list_item(order) -> dict:
    """Build a list item dict from an ORM Order."""
    data = {
        "id": order.id,
        "brand_id": order.brand_id,
        "creator_id": order.creator_id,
        "model_id": order.model_id,
        "order_number": order.order_number,
        "package_type": order.package_type,
        "image_count": order.image_count,
        "total_price": order.total_price,
        "status": order.status,
        "created_at": order.created_at,
        "brand": None,
        "creator": None,
        "model": None,
    }

    if order.brand_user:
        data["brand"] = {
            "id": order.brand_user.id,
            "nickname": order.brand_user.nickname,
            "company_name": order.brand_user.company_name,
        }

    if order.creator_user:
        data["creator"] = {
            "id": order.creator_user.id,
            "nickname": order.creator_user.nickname,
            "profile_image": order.creator_user.profile_image,
        }

    if order.model:
        data["model"] = {
            "id": order.model.id,
            "name": order.model.name,
            "style": order.model.style,
        }

    return data


# ---------------------------------------------------------------------------
# POST /orders - Create order (brand only)
# ---------------------------------------------------------------------------


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_new_order(
    order_in: OrderCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OrderResponse:
    """Create a new order. Only brand users can create orders."""
    if current_user.role != "brand":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only brand users can create orders",
        )

    order = await create_order(db, current_user.id, order_in)
    return OrderResponse(**_build_order_response(order))


# ---------------------------------------------------------------------------
# GET /orders - List orders (role-based filtering)
# ---------------------------------------------------------------------------


@router.get("")
async def list_user_orders(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
) -> OrderListResponse:
    """List orders for the current user, filtered by role.

    - Brand: sees orders they created
    - Creator: sees orders assigned to them
    """
    orders, total = await list_orders(
        db,
        current_user,
        page=page,
        limit=limit,
        status_filter=status_filter,
    )

    items = [OrderListItem(**_build_list_item(o)) for o in orders]

    return OrderListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


# ---------------------------------------------------------------------------
# GET /orders/{order_id} - Get order detail
# ---------------------------------------------------------------------------


@router.get("/{order_id}")
async def get_order_detail(
    order_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OrderResponse:
    """Get a single order by ID. Only brand/creator involved can view."""
    order = await get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Permission check: only brand or creator of this order can view
    if current_user.id not in (order.brand_id, order.creator_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order",
        )

    return OrderResponse(**_build_order_response(order))


# ---------------------------------------------------------------------------
# PATCH /orders/{order_id}/status - Update order status
# ---------------------------------------------------------------------------


@router.patch("/{order_id}/status")
async def update_status(
    order_id: str,
    status_in: StatusUpdate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OrderResponse:
    """Update order status. Permission depends on the action.

    Actions:
        - accept: creator only (pending -> accepted)
        - reject: creator only (pending -> rejected)
        - start: creator only (accepted -> in_progress)
        - complete: brand or creator (in_progress -> completed)
        - cancel: brand only (pending/accepted/in_progress -> cancelled)
    """
    order = await get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Must be brand or creator of this order
    if current_user.id not in (order.brand_id, order.creator_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order",
        )

    try:
        updated_order = await update_order_status(
            db, order, status_in.action, current_user
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return OrderResponse(**_build_order_response(updated_order))
