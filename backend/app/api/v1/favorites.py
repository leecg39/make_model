# @TASK P2-R2-T1 - Favorites API endpoints
# @SPEC docs/planning/02-trd.md#favorites-api
"""Favorites (bookmarks) endpoints.

Routes:
    GET    /api/favorites              - List my favorites (paginated, with model info)
    POST   /api/favorites              - Add a favorite (409 if duplicate)
    DELETE /api/favorites/{model_id}   - Remove favorite by model_id (404 if not found)
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.schemas.favorite import (
    AIModelBrief,
    FavoriteCreate,
    FavoriteListResponse,
    FavoriteResponse,
    FavoriteWithModel,
)
from app.services.favorite import (
    add_favorite,
    get_ai_model_by_id,
    get_favorite_by_user_and_model,
    list_favorites,
    remove_favorite,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/favorites", tags=["favorites"])


# ---------------------------------------------------------------------------
# Helper: convert AIModel ORM -> AIModelBrief schema
# ---------------------------------------------------------------------------


def _model_to_brief(ai_model) -> AIModelBrief:
    """Convert an AIModel ORM instance to an AIModelBrief schema.

    Extracts thumbnail URL from the model's images relationship if available.
    """
    thumbnail = None
    if hasattr(ai_model, "images") and ai_model.images:
        for img in ai_model.images:
            if img.is_thumbnail:
                thumbnail = img.image_url
                break
        if thumbnail is None and ai_model.images:
            thumbnail = ai_model.images[0].image_url

    return AIModelBrief(
        id=ai_model.id,
        name=ai_model.name,
        description=ai_model.description,
        style=ai_model.style,
        gender=ai_model.gender,
        age_range=ai_model.age_range,
        rating=ai_model.rating,
        status=ai_model.status,
        thumbnail=thumbnail,
    )


# ---------------------------------------------------------------------------
# POST /favorites - Add favorite
# ---------------------------------------------------------------------------


@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def create_favorite(
    body: FavoriteCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Add an AI model to the current user's favorites.

    - 404 if the model does not exist
    - 409 if already favorited
    """
    # Check model exists
    ai_model = await get_ai_model_by_id(db, body.model_id)
    if ai_model is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI model not found",
        )

    # Check duplicate
    existing = await get_favorite_by_user_and_model(db, current_user.id, body.model_id)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Model already in favorites",
        )

    favorite = await add_favorite(db, current_user.id, body.model_id)
    return favorite


# ---------------------------------------------------------------------------
# GET /favorites - List my favorites
# ---------------------------------------------------------------------------


@router.get("", response_model=FavoriteListResponse)
async def get_favorites(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
):
    """List the current user's favorites with AI model info (paginated)."""
    favorites, total = await list_favorites(db, current_user.id, page=page, limit=limit)

    items = []
    for fav in favorites:
        model_brief = None
        if fav.model is not None:
            model_brief = _model_to_brief(fav.model)
        items.append(
            FavoriteWithModel(
                id=fav.id,
                user_id=fav.user_id,
                model_id=fav.model_id,
                created_at=fav.created_at,
                model=model_brief,
            )
        )

    return FavoriteListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


# ---------------------------------------------------------------------------
# DELETE /favorites/{model_id} - Remove favorite
# ---------------------------------------------------------------------------


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_favorite(
    model_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Remove an AI model from the current user's favorites.

    Uses model_id (NOT favorite_id) for deletion.
    Returns 404 if the favorite does not exist.
    """
    deleted = await remove_favorite(db, current_user.id, model_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        )
    return None
