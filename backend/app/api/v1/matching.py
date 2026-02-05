# @TASK P3-R1-T1 - AI Matching API endpoint
# @SPEC docs/planning/02-trd.md#ai-matching-api
"""AI Matching API endpoint: concept-based model recommendation.

Routes:
    POST /api/matching/recommend - Recommend AI models based on concept description
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.schemas.matching import MatchingRequest, MatchingResponse
from app.services.matching import recommend_models

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/matching", tags=["matching"])


# ---------------------------------------------------------------------------
# POST /matching/recommend - Concept-based AI model recommendation
# ---------------------------------------------------------------------------


@router.post("/recommend", response_model=MatchingResponse)
async def recommend(
    request: MatchingRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MatchingResponse:
    """Recommend AI models based on a concept description.

    Extracts style, gender, and descriptive keywords from the concept,
    then scores all active models for relevance. Returns top 3-5 matches
    sorted by score descending.

    Requires JWT authentication.
    """
    logger.info(
        "Matching request from user %s: concept=%s",
        current_user.id,
        request.concept_description[:80],
    )

    result = await recommend_models(db, request)

    logger.info(
        "Matching result: %d recommendations for user %s",
        len(result.recommendations),
        current_user.id,
    )

    return result
