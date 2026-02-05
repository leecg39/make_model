# @TASK P2-R3-T1 - Platform Stats business logic (aggregate queries)
# @SPEC docs/planning/02-trd.md#platform-stats-api
"""Platform statistics service: aggregate counts for public dashboard.

@TEST tests/api/test_stats.py
"""
import logging

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_model import AIModel
from app.models.order import Order
from app.models.user import User

logger = logging.getLogger(__name__)


async def get_platform_stats(db: AsyncSession) -> dict[str, int]:
    """Compute platform-wide statistics.

    Queries:
        total_models:   COUNT of AIModel WHERE status = 'active'
        total_bookings: COUNT of Order   WHERE status = 'completed'
        total_brands:   COUNT of User    WHERE role = 'brand' AND is_active = True

    Args:
        db: Async database session.

    Returns:
        Dictionary with total_models, total_bookings, and total_brands.
    """
    # Count active AI models
    models_stmt = select(func.count(AIModel.id)).where(
        AIModel.status == "active"
    )
    models_result = await db.execute(models_stmt)
    total_models = models_result.scalar_one()

    # Count completed orders (bookings)
    bookings_stmt = select(func.count(Order.id)).where(
        Order.status == "completed"
    )
    bookings_result = await db.execute(bookings_stmt)
    total_bookings = bookings_result.scalar_one()

    # Count active brand users
    brands_stmt = select(func.count(User.id)).where(
        User.role == "brand",
        User.is_active == True,  # noqa: E712
    )
    brands_result = await db.execute(brands_stmt)
    total_brands = brands_result.scalar_one()

    return {
        "total_models": total_models,
        "total_bookings": total_bookings,
        "total_brands": total_brands,
    }
