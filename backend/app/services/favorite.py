# @TASK P2-R2-T1 - Favorites service (business logic)
# @SPEC docs/planning/02-trd.md#favorites-api
"""Favorites service: add, list (paginated), and remove favorites."""
import logging
from typing import Optional

from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.ai_model import AIModel, Favorite

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Queries
# ---------------------------------------------------------------------------


async def get_favorite_by_user_and_model(
    db: AsyncSession, user_id: str, model_id: str
) -> Optional[Favorite]:
    """Find a favorite by user_id + model_id combination."""
    result = await db.execute(
        select(Favorite).where(
            Favorite.user_id == user_id,
            Favorite.model_id == model_id,
        )
    )
    return result.scalar_one_or_none()


async def get_ai_model_by_id(
    db: AsyncSession, model_id: str
) -> Optional[AIModel]:
    """Check if an AI model exists by its ID."""
    result = await db.execute(
        select(AIModel).where(AIModel.id == model_id)
    )
    return result.scalar_one_or_none()


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------


async def add_favorite(
    db: AsyncSession, user_id: str, model_id: str
) -> Favorite:
    """Create a new favorite record.

    Caller must verify the model exists and no duplicate before calling.
    """
    favorite = Favorite(
        user_id=user_id,
        model_id=model_id,
    )
    db.add(favorite)
    await db.commit()
    await db.refresh(favorite)
    return favorite


async def list_favorites(
    db: AsyncSession,
    user_id: str,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Favorite], int]:
    """Return paginated favorites for a user with eager-loaded model info.

    Returns:
        (list_of_favorites, total_count)
    """
    # Count total
    count_query = select(func.count()).select_from(Favorite).where(
        Favorite.user_id == user_id
    )
    count_result = await db.execute(count_query)
    total = count_result.scalar_one()

    # Fetch page with model relationship
    offset = (page - 1) * limit
    items_query = (
        select(Favorite)
        .where(Favorite.user_id == user_id)
        .options(
            joinedload(Favorite.model).subqueryload(AIModel.images),
        )
        .order_by(Favorite.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    items_result = await db.execute(items_query)
    favorites = list(items_result.scalars().unique().all())

    return favorites, total


async def remove_favorite(
    db: AsyncSession, user_id: str, model_id: str
) -> bool:
    """Remove a favorite by user_id + model_id.

    Returns:
        True if a row was deleted, False if not found.
    """
    result = await db.execute(
        delete(Favorite).where(
            Favorite.user_id == user_id,
            Favorite.model_id == model_id,
        )
    )
    await db.commit()
    return result.rowcount > 0
