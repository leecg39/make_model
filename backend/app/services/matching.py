# @TASK P3-R1-T1 - AI Matching service (keyword-based MVP)
# @SPEC docs/planning/02-trd.md#ai-matching-api
"""AI Matching service: keyword-based concept matching for MVP.

MVP approach: extract style/gender/description keywords from concept_description,
then score each active model based on keyword overlap.

Future: Replace with Pinecone vector similarity search.

@TEST tests/api/test_matching.py
"""
import logging
import re
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ai_model import AIModel
from app.schemas.matching import (
    MatchedModelSummary,
    MatchingRecommendation,
    MatchingRequest,
    MatchingResponse,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Keyword dictionaries for MVP matching
# ---------------------------------------------------------------------------

STYLE_KEYWORDS: dict[str, set[str]] = {
    "casual": {"casual", "relaxed", "everyday", "comfortable", "chill", "laid-back",
               "beach", "summer", "street", "daily"},
    "formal": {"formal", "business", "professional", "corporate", "suit", "elegant",
               "office", "meeting", "executive", "classy"},
    "sporty": {"sporty", "athletic", "fitness", "sport", "running", "gym", "active",
               "workout", "training", "exercise"},
    "vintage": {"vintage", "retro", "classic", "old-school", "antique", "nostalgic",
                "traditional", "timeless", "heritage"},
}

GENDER_KEYWORDS: dict[str, set[str]] = {
    "male": {"male", "man", "men", "boy", "masculine", "gentleman", "guy"},
    "female": {"female", "woman", "women", "girl", "feminine", "lady"},
    "neutral": {"neutral", "unisex", "androgynous", "genderless", "non-binary"},
}

AGE_KEYWORDS: dict[str, set[str]] = {
    "10s": {"teen", "teenager", "young", "youth", "adolescent"},
    "20s": {"twenties", "20s", "young adult", "college"},
    "30s": {"thirties", "30s", "mature", "adult"},
    "40s+": {"forties", "40s", "senior", "experienced", "older"},
}


# ---------------------------------------------------------------------------
# Core matching logic
# ---------------------------------------------------------------------------


def _extract_words(text: str) -> set[str]:
    """Extract lowercase words from text, removing punctuation."""
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def _compute_score(
    concept_words: set[str],
    model: AIModel,
    model_tags: list[str],
) -> float:
    """Compute a match score (0.0 - 1.0) between concept keywords and a model.

    Scoring components (max 1.0):
      - Style match:  0.35 (exact style keyword match)
      - Gender match: 0.25 (exact gender keyword match)
      - Age match:    0.15 (age range keyword match)
      - Tag overlap:  0.15 (fraction of model tags found in concept)
      - Description:  0.10 (word overlap with model name + description)
    """
    score = 0.0

    # 1. Style match (0.35)
    style_kws = STYLE_KEYWORDS.get(model.style, set())
    if concept_words & style_kws:
        score += 0.35

    # 2. Gender match (0.25)
    gender_kws = GENDER_KEYWORDS.get(model.gender, set())
    if concept_words & gender_kws:
        score += 0.25

    # 3. Age range match (0.15)
    age_kws = AGE_KEYWORDS.get(model.age_range, set())
    if concept_words & age_kws:
        score += 0.15

    # 4. Tag overlap (0.15)
    if model_tags:
        tag_set = {t.lower() for t in model_tags}
        overlap = len(concept_words & tag_set)
        tag_ratio = min(overlap / len(tag_set), 1.0)
        score += 0.15 * tag_ratio

    # 5. Description/name word overlap (0.10)
    model_text_parts = []
    if model.name:
        model_text_parts.append(model.name)
    if model.description:
        model_text_parts.append(model.description)
    if model_text_parts:
        model_words = _extract_words(" ".join(model_text_parts))
        if model_words:
            overlap = len(concept_words & model_words)
            desc_ratio = min(overlap / max(len(model_words), 1), 1.0)
            score += 0.10 * desc_ratio

    return round(min(score, 1.0), 4)


def _extract_thumbnail_url(model: AIModel) -> Optional[str]:
    """Extract thumbnail URL from model images."""
    if not model.images:
        return None
    for img in model.images:
        if img.is_thumbnail:
            return img.image_url
    return None


def _extract_tags(model: AIModel) -> list[str]:
    """Extract tag names from model tags."""
    if not model.tags:
        return []
    return [tag.tag for tag in model.tags]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


async def recommend_models(
    db: AsyncSession,
    request: MatchingRequest,
    max_results: int = 5,
    min_score: float = 0.0,
) -> MatchingResponse:
    """Recommend AI models based on concept description keywords.

    Args:
        db: Async database session.
        request: Matching request with concept_description.
        max_results: Maximum number of recommendations (default 5).
        min_score: Minimum score threshold (default 0.0 - include all).

    Returns:
        MatchingResponse with sorted recommendations.
    """
    # 1. Extract keywords from concept description
    concept_words = _extract_words(request.concept_description)

    # 2. Fetch all active models with relationships
    stmt = (
        select(AIModel)
        .where(AIModel.status == "active")
        .options(
            selectinload(AIModel.images),
            selectinload(AIModel.tags),
        )
    )
    result = await db.execute(stmt)
    active_models = list(result.scalars().all())

    if not active_models:
        return MatchingResponse(recommendations=[])

    # 3. Score each model
    scored: list[tuple[AIModel, list[str], float]] = []
    for model in active_models:
        tags = _extract_tags(model)
        model_score = _compute_score(concept_words, model, tags)
        if model_score > min_score:
            scored.append((model, tags, model_score))

    # 4. Sort by score descending, take top N
    scored.sort(key=lambda x: x[2], reverse=True)
    top = scored[:max_results]

    # 5. Build response
    recommendations = []
    for model, tags, model_score in top:
        summary = MatchedModelSummary(
            id=model.id,
            name=model.name,
            description=model.description,
            style=model.style,
            gender=model.gender,
            age_range=model.age_range,
            view_count=model.view_count,
            rating=model.rating,
            status=model.status,
            thumbnail_url=_extract_thumbnail_url(model),
            tags=tags,
        )
        recommendations.append(
            MatchingRecommendation(model=summary, score=model_score)
        )

    return MatchingResponse(recommendations=recommendations)
