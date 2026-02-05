# @TASK P2-R1-T1 - AI Models API endpoints
# @SPEC docs/planning/02-trd.md#ai-models-api
"""AI Models API endpoints.

Routes:
    GET    /api/models              - List models with filters & pagination
    GET    /api/models/:id          - Get model detail (view_count++)
    POST   /api/models              - Create model (creator only)
    PATCH  /api/models/:id          - Update model (owner only)
    POST   /api/models/:id/images   - Upload image to model (owner only)
"""
import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.schemas.model import (
    AIModelCreate,
    AIModelListItem,
    AIModelListResponse,
    AIModelResponse,
    AIModelUpdate,
    CreatorInfo,
    ModelImageResponse,
)
from app.services.model import (
    add_model_image,
    create_model,
    get_model_by_id,
    increment_view_count,
    list_models,
    update_model,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/models", tags=["models"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _extract_thumbnail_url(model) -> Optional[str]:
    """Extract thumbnail URL from model images."""
    if not model.images:
        return None
    for img in model.images:
        if img.is_thumbnail:
            return img.image_url
    return None


def _extract_tags(model) -> list[str]:
    """Extract tag names from model tags."""
    if not model.tags:
        return []
    return [tag.tag for tag in model.tags]


def _build_model_response(model) -> dict:
    """Build a full model response dict from an ORM model."""
    return {
        "id": model.id,
        "creator_id": model.creator_id,
        "name": model.name,
        "description": model.description,
        "style": model.style,
        "gender": model.gender,
        "age_range": model.age_range,
        "view_count": model.view_count,
        "rating": model.rating,
        "status": model.status,
        "thumbnail_url": _extract_thumbnail_url(model),
        "tags": _extract_tags(model),
        "images": [
            ModelImageResponse.model_validate(img) for img in (model.images or [])
        ],
        "creator": (
            CreatorInfo.model_validate(model.creator) if model.creator else None
        ),
        "created_at": model.created_at,
        "updated_at": model.updated_at,
    }


def _build_list_item(model) -> dict:
    """Build a list item dict from an ORM model."""
    return {
        "id": model.id,
        "creator_id": model.creator_id,
        "name": model.name,
        "style": model.style,
        "gender": model.gender,
        "age_range": model.age_range,
        "view_count": model.view_count,
        "rating": model.rating,
        "status": model.status,
        "thumbnail_url": _extract_thumbnail_url(model),
        "tags": _extract_tags(model),
        "creator": (
            CreatorInfo.model_validate(model.creator) if model.creator else None
        ),
        "created_at": model.created_at,
    }


def _require_creator(user) -> None:
    """Raise 403 if user is not a creator."""
    if user.role != "creator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can perform this action",
        )


def _require_owner(model, user) -> None:
    """Raise 403 if user is not the owner of the model."""
    if model.creator_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own models",
        )


# ---------------------------------------------------------------------------
# POST /models - Create model (creator only)
# ---------------------------------------------------------------------------


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_ai_model(
    model_in: AIModelCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AIModelResponse:
    """Create a new AI model. Only creators can create models."""
    _require_creator(current_user)

    model = await create_model(db, current_user.id, model_in)
    return AIModelResponse(**_build_model_response(model))


# ---------------------------------------------------------------------------
# GET /models - List models with filters & pagination
# ---------------------------------------------------------------------------


@router.get("")
async def list_ai_models(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
    style: Optional[str] = Query(None, description="Filter by style"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    age_range: Optional[str] = Query(None, description="Filter by age range"),
    keyword: Optional[str] = Query(None, description="Search keyword"),
    sort: str = Query("recent", description="Sort: popular, recent, rating"),
) -> AIModelListResponse:
    """List AI models with optional filters, sorting, and pagination."""
    models, total = await list_models(
        db,
        page=page,
        limit=limit,
        style=style,
        gender=gender,
        age_range=age_range,
        keyword=keyword,
        sort=sort,
    )

    items = [AIModelListItem(**_build_list_item(m)) for m in models]

    return AIModelListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


# ---------------------------------------------------------------------------
# GET /models/{model_id} - Get model detail
# ---------------------------------------------------------------------------


@router.get("/{model_id}")
async def get_ai_model(
    model_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AIModelResponse:
    """Get a single AI model by ID. Increments view_count on each access."""
    model = await get_model_by_id(db, model_id)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found",
        )

    # Increment view count
    model = await increment_view_count(db, model)

    # Reload relationships after commit
    model = await get_model_by_id(db, model_id)

    return AIModelResponse(**_build_model_response(model))


# ---------------------------------------------------------------------------
# PATCH /models/{model_id} - Update model (owner only)
# ---------------------------------------------------------------------------


@router.patch("/{model_id}")
async def update_ai_model(
    model_id: str,
    model_in: AIModelUpdate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AIModelResponse:
    """Update an AI model. Only the owner (creator) can update."""
    _require_creator(current_user)

    model = await get_model_by_id(db, model_id)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found",
        )

    _require_owner(model, current_user)

    model = await update_model(db, model, model_in)
    return AIModelResponse(**_build_model_response(model))


# ---------------------------------------------------------------------------
# POST /models/{model_id}/images - Upload image (owner only)
# ---------------------------------------------------------------------------


@router.post("/{model_id}/images", status_code=status.HTTP_201_CREATED)
async def upload_model_image(
    model_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
    is_thumbnail: str = Form("false"),
) -> ModelImageResponse:
    """Upload an image for an AI model. Only the owner can upload.

    S3/R2 upload is stubbed: returns a generated URL.
    """
    model = await get_model_by_id(db, model_id)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found",
        )

    _require_creator(current_user)
    _require_owner(model, current_user)

    # Parse is_thumbnail from form field
    thumbnail_flag = is_thumbnail.lower() in ("true", "1", "yes")

    image = await add_model_image(
        db,
        model_id=model_id,
        filename=file.filename or "upload.jpg",
        is_thumbnail=thumbnail_flag,
    )

    return ModelImageResponse.model_validate(image)
