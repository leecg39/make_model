# @TASK P2-R3-T1 - Platform Stats API endpoint
# @SPEC docs/planning/02-trd.md#platform-stats-api
"""Platform Statistics API endpoint.

Routes:
    GET /api/stats - Public platform statistics (no auth required)
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.stats import PlatformStatsResponse
from app.services.stats import get_platform_stats

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stats", tags=["stats"])


# ---------------------------------------------------------------------------
# GET /stats - Public platform statistics
# ---------------------------------------------------------------------------


@router.get("", response_model=PlatformStatsResponse)
async def platform_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PlatformStatsResponse:
    """Return aggregated platform statistics.

    Public endpoint - no authentication required.

    Returns:
        PlatformStatsResponse with total_models, total_bookings, total_brands.
    """
    stats = await get_platform_stats(db)
    return PlatformStatsResponse(**stats)
