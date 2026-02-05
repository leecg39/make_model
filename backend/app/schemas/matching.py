# @TASK P3-R1-T1 - AI Matching Pydantic schemas
# @SPEC docs/planning/02-trd.md#ai-matching-api
"""AI Matching schemas for concept-based model recommendation.

Schemas:
    MatchingRequest       - Request body with concept description
    MatchedModelSummary   - Summary of a matched AI model
    MatchingRecommendation - Single recommendation (model + score)
    MatchingResponse      - List of recommendations
"""
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------


class MatchingRequest(BaseModel):
    """Request body for AI model matching/recommendation."""

    concept_description: str
    reference_images: list[str] = []

    @field_validator("concept_description")
    @classmethod
    def validate_concept_description(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("concept_description must not be empty")
        if len(v) > 500:
            raise ValueError("concept_description must be 500 characters or fewer")
        return v.strip()


# ---------------------------------------------------------------------------
# Response components
# ---------------------------------------------------------------------------


class MatchedModelSummary(BaseModel):
    """Summary of a recommended AI model."""

    id: str
    name: str
    description: Optional[str] = None
    style: str
    gender: str
    age_range: str
    view_count: int
    rating: float
    status: str
    thumbnail_url: Optional[str] = None
    tags: list[str] = []

    model_config = ConfigDict(from_attributes=True)


class MatchingRecommendation(BaseModel):
    """Single recommendation: a model paired with its match score."""

    model: MatchedModelSummary
    score: float


class MatchingResponse(BaseModel):
    """Response containing a list of model recommendations."""

    recommendations: list[MatchingRecommendation] = []
