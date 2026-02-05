# @TASK P2-R1-T1 - AI Models business logic (CRUD, filters, pagination)
# @SPEC docs/planning/02-trd.md#ai-models-api
"""AI Model service: CRUD operations, filtering, and pagination.

@TEST tests/api/test_models.py
"""
import logging
import uuid
from typing import Optional

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ai_model import AIModel, ModelImage, ModelTag
from app.schemas.model import AIModelCreate, AIModelUpdate

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


async def create_model(
    db: AsyncSession,
    creator_id: str,
    model_in: AIModelCreate,
) -> AIModel:
    """Create a new AI model with optional tags.

    Args:
        db: Async database session.
        creator_id: ID of the creator user.
        model_in: Validated model creation data.

    Returns:
        The newly created AIModel with relationships loaded.
    """
    ai_model = AIModel(
        creator_id=creator_id,
        name=model_in.name,
        description=model_in.description,
        style=model_in.style,
        gender=model_in.gender,
        age_range=model_in.age_range,
        status="draft",
        view_count=0,
        rating=0.0,
    )
    db.add(ai_model)
    await db.flush()

    # Create tags
    for tag_name in model_in.tags:
        tag = ModelTag(model_id=ai_model.id, tag=tag_name)
        db.add(tag)

    await db.commit()

    # Reload with relationships
    return await get_model_by_id(db, ai_model.id)


# ---------------------------------------------------------------------------
# Read (single)
# ---------------------------------------------------------------------------


async def get_model_by_id(
    db: AsyncSession,
    model_id: str,
) -> Optional[AIModel]:
    """Get a single AI model by ID with all relationships loaded.

    Args:
        db: Async database session.
        model_id: UUID of the model.

    Returns:
        AIModel with creator, images, and tags loaded, or None.
    """
    stmt = (
        select(AIModel)
        .where(AIModel.id == model_id)
        .options(
            selectinload(AIModel.creator),
            selectinload(AIModel.images),
            selectinload(AIModel.tags),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def increment_view_count(
    db: AsyncSession,
    model: AIModel,
) -> AIModel:
    """Increment the view_count of a model by 1.

    Args:
        db: Async database session.
        model: The AIModel instance.

    Returns:
        Updated AIModel.
    """
    model.view_count = model.view_count + 1
    await db.commit()
    await db.refresh(model)
    return model


# ---------------------------------------------------------------------------
# Read (list with filters)
# ---------------------------------------------------------------------------


async def list_models(
    db: AsyncSession,
    *,
    page: int = 1,
    limit: int = 12,
    style: Optional[str] = None,
    gender: Optional[str] = None,
    age_range: Optional[str] = None,
    keyword: Optional[str] = None,
    sort: str = "recent",
) -> tuple[list[AIModel], int]:
    """List AI models with optional filters, sorting, and pagination.

    Args:
        db: Async database session.
        page: Page number (1-based).
        limit: Items per page.
        style: Filter by style.
        gender: Filter by gender.
        age_range: Filter by age_range.
        keyword: Search keyword for name/description.
        sort: Sort order - "popular", "recent", or "rating".

    Returns:
        Tuple of (list of AIModel, total count).
    """
    # Base query
    base_stmt = select(AIModel)
    count_stmt = select(func.count(AIModel.id))

    # Apply filters
    conditions = []
    if style:
        conditions.append(AIModel.style == style)
    if gender:
        conditions.append(AIModel.gender == gender)
    if age_range:
        conditions.append(AIModel.age_range == age_range)
    if keyword:
        keyword_filter = or_(
            AIModel.name.ilike(f"%{keyword}%"),
            AIModel.description.ilike(f"%{keyword}%"),
        )
        conditions.append(keyword_filter)

    if conditions:
        for condition in conditions:
            base_stmt = base_stmt.where(condition)
            count_stmt = count_stmt.where(condition)

    # Get total count
    count_result = await db.execute(count_stmt)
    total = count_result.scalar_one()

    # Apply sorting
    if sort == "popular":
        base_stmt = base_stmt.order_by(AIModel.view_count.desc())
    elif sort == "rating":
        base_stmt = base_stmt.order_by(AIModel.rating.desc())
    else:  # "recent" (default)
        base_stmt = base_stmt.order_by(AIModel.created_at.desc())

    # Apply pagination
    offset = (page - 1) * limit
    base_stmt = base_stmt.offset(offset).limit(limit)

    # Load relationships
    base_stmt = base_stmt.options(
        selectinload(AIModel.creator),
        selectinload(AIModel.images),
        selectinload(AIModel.tags),
    )

    result = await db.execute(base_stmt)
    models = list(result.scalars().all())

    return models, total


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------


async def update_model(
    db: AsyncSession,
    model: AIModel,
    model_in: AIModelUpdate,
) -> AIModel:
    """Update an existing AI model.

    Args:
        db: Async database session.
        model: The AIModel to update.
        model_in: Validated partial update data.

    Returns:
        Updated AIModel with relationships loaded.
    """
    update_data = model_in.model_dump(exclude_unset=True)

    # Handle tags separately
    tags_data = update_data.pop("tags", None)

    # Update scalar fields
    for field, value in update_data.items():
        setattr(model, field, value)

    # Replace tags if provided
    if tags_data is not None:
        # Delete existing tags via bulk delete to avoid stale cache
        from sqlalchemy import delete
        await db.execute(
            delete(ModelTag).where(ModelTag.model_id == model.id)
        )
        # Expire the model's tags collection so it reloads fresh
        await db.flush()

        # Create new tags
        for tag_name in tags_data:
            new_tag = ModelTag(model_id=model.id, tag=tag_name)
            db.add(new_tag)

    await db.commit()

    # Expire all cached state to ensure fresh relationship loading
    model_id = model.id
    db.expunge_all()

    # Reload with relationships (fresh query, no stale cache)
    return await get_model_by_id(db, model_id)


# ---------------------------------------------------------------------------
# Image upload (stub)
# ---------------------------------------------------------------------------


async def add_model_image(
    db: AsyncSession,
    model_id: str,
    filename: str,
    is_thumbnail: bool = False,
) -> ModelImage:
    """Add an image to a model (S3/R2 upload is stubbed).

    In production, this would upload to S3/R2 and store the URL.
    For now, generates a stub URL.

    Args:
        db: Async database session.
        model_id: ID of the model.
        filename: Original filename.
        is_thumbnail: Whether this is the thumbnail image.

    Returns:
        The newly created ModelImage.
    """
    # Stub: generate a fake URL instead of actual S3 upload
    file_id = str(uuid.uuid4())
    stub_url = f"https://storage.example.com/models/{model_id}/{file_id}_{filename}"

    # Determine display order (next available)
    count_stmt = select(func.count(ModelImage.id)).where(
        ModelImage.model_id == model_id
    )
    count_result = await db.execute(count_stmt)
    current_count = count_result.scalar_one()
    display_order = current_count + 1

    image = ModelImage(
        model_id=model_id,
        image_url=stub_url,
        display_order=display_order,
        is_thumbnail=is_thumbnail,
    )
    db.add(image)
    await db.commit()
    await db.refresh(image)

    return image
