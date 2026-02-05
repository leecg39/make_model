# @TASK P4-R1-T1 - Delivery Files API endpoints
# @SPEC docs/planning/02-trd.md#delivery-files-api
"""Delivery Files API endpoints.

Routes:
    GET  /api/orders/{order_id}/files  - List delivery files (brand or creator)
    POST /api/orders/{order_id}/files  - Upload delivery file (creator only)
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.schemas.delivery import (
    DeliveryFileCreate,
    DeliveryFileListResponse,
    DeliveryFileResponse,
)
from app.services.delivery import list_files, upload_file

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["delivery-files"])


# ---------------------------------------------------------------------------
# GET /orders/{order_id}/files - List delivery files
# ---------------------------------------------------------------------------


@router.get("/{order_id}/files")
async def get_delivery_files(
    order_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DeliveryFileListResponse:
    """List delivery files for an order.

    Both the brand and the creator of the order can view files.
    """
    try:
        files = await list_files(db, order_id, current_user)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order",
        )

    items = [DeliveryFileResponse.model_validate(f) for f in files]
    return DeliveryFileListResponse(items=items, total=len(items))


# ---------------------------------------------------------------------------
# POST /orders/{order_id}/files - Upload delivery file (creator only)
# ---------------------------------------------------------------------------


@router.post("/{order_id}/files", status_code=status.HTTP_201_CREATED)
async def create_delivery_file(
    order_id: str,
    file_in: DeliveryFileCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DeliveryFileResponse:
    """Upload a delivery file for an order.

    Only the creator of the order can upload files.
    File size is validated to be <= 10 MB.
    """
    try:
        delivery_file = await upload_file(db, order_id, file_in, current_user)
    except ValueError as e:
        if "Order not found" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator of this order can upload files",
        )

    return DeliveryFileResponse.model_validate(delivery_file)
