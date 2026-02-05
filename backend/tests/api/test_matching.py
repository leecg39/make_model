# @TASK P3-R1-T1 - AI Matching API tests
# @SPEC docs/planning/02-trd.md#ai-matching-api
"""Tests for AI Matching API endpoint.

RED phase: these tests define the expected behaviour before implementation.

Endpoints:
    POST /api/matching/recommend - Concept-based AI model recommendation
"""
from typing import Optional

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_model import AIModel, ModelTag
from app.models.user import User
from app.core.security import get_password_hash


# ---------------------------------------------------------------------------
# URLs
# ---------------------------------------------------------------------------

MATCHING_URL = "/api/matching/recommend"
SIGNUP_URL = "/api/auth/signup"
LOGIN_URL = "/api/auth/login"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _creator_payload(email: str = "creator@example.com") -> dict:
    return {
        "email": email,
        "password": "StrongPass1!",
        "nickname": "CreatorUser",
        "role": "creator",
    }


def _brand_payload(email: str = "brand@example.com") -> dict:
    return {
        "email": email,
        "password": "StrongPass1!",
        "nickname": "BrandUser",
        "role": "brand",
        "company_name": "TestCorp",
    }


async def _signup_and_login(client: AsyncClient, payload: Optional[dict] = None) -> dict:
    """Helper: sign up then login, return token response JSON."""
    payload = payload or _brand_payload()
    await client.post(SIGNUP_URL, json=payload)
    login_resp = await client.post(
        LOGIN_URL,
        json={"email": payload["email"], "password": payload["password"]},
    )
    return login_resp.json()


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def _seed_active_models(db_session: AsyncSession) -> list[AIModel]:
    """Seed multiple active AI models with varying styles/genders for matching tests."""
    user = User(
        email="seeded_creator@example.com",
        password_hash=get_password_hash("StrongPass1!"),
        nickname="SeededCreator",
        role="creator",
    )
    db_session.add(user)
    await db_session.flush()

    models_data = [
        {
            "name": "Casual Summer Girl",
            "description": "A casual summer look with beachwear and sunglasses",
            "style": "casual",
            "gender": "female",
            "age_range": "20s",
            "status": "active",
            "tags": ["summer", "beach", "casual"],
        },
        {
            "name": "Formal Business Man",
            "description": "Professional formal suit for corporate settings",
            "style": "formal",
            "gender": "male",
            "age_range": "30s",
            "status": "active",
            "tags": ["business", "suit", "formal"],
        },
        {
            "name": "Sporty Runner",
            "description": "Athletic sporty look for running and fitness",
            "style": "sporty",
            "gender": "female",
            "age_range": "20s",
            "status": "active",
            "tags": ["fitness", "running", "sporty"],
        },
        {
            "name": "Vintage Classic",
            "description": "Retro vintage style with classic accessories",
            "style": "vintage",
            "gender": "neutral",
            "age_range": "30s",
            "status": "active",
            "tags": ["retro", "classic", "vintage"],
        },
        {
            "name": "Draft Model",
            "description": "This model is still in draft status",
            "style": "casual",
            "gender": "male",
            "age_range": "20s",
            "status": "draft",
            "tags": ["draft"],
        },
    ]

    created_models = []
    for model_data in models_data:
        tags = model_data.pop("tags")
        ai_model = AIModel(
            creator_id=user.id,
            view_count=0,
            rating=0.0,
            **model_data,
        )
        db_session.add(ai_model)
        await db_session.flush()

        for tag_name in tags:
            tag = ModelTag(model_id=ai_model.id, tag=tag_name)
            db_session.add(tag)

        created_models.append(ai_model)

    await db_session.commit()
    for m in created_models:
        await db_session.refresh(m)

    return created_models


# ===========================================================================
# 1. Authentication checks
# ===========================================================================


@pytest.mark.asyncio
async def test_recommend_unauthenticated(client: AsyncClient):
    """Unauthenticated user cannot access matching endpoint."""
    resp = await client.post(
        MATCHING_URL,
        json={"concept_description": "casual summer look"},
    )
    assert resp.status_code == 401


# ===========================================================================
# 2. Validation checks
# ===========================================================================


@pytest.mark.asyncio
async def test_recommend_empty_concept(client: AsyncClient):
    """Empty concept_description should be rejected."""
    tokens = await _signup_and_login(client)
    resp = await client.post(
        MATCHING_URL,
        headers=_auth_header(tokens["access_token"]),
        json={"concept_description": ""},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_recommend_concept_too_long(client: AsyncClient):
    """concept_description exceeding 500 chars should be rejected."""
    tokens = await _signup_and_login(client)
    long_text = "a" * 501
    resp = await client.post(
        MATCHING_URL,
        headers=_auth_header(tokens["access_token"]),
        json={"concept_description": long_text},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_recommend_missing_concept(client: AsyncClient):
    """Missing concept_description field should be rejected."""
    tokens = await _signup_and_login(client)
    resp = await client.post(
        MATCHING_URL,
        headers=_auth_header(tokens["access_token"]),
        json={},
    )
    assert resp.status_code == 422


# ===========================================================================
# 3. Successful recommendation
# ===========================================================================


@pytest.mark.asyncio
async def test_recommend_success(client: AsyncClient, db_session: AsyncSession):
    """Successful recommendation returns models with scores."""
    await _seed_active_models(db_session)
    tokens = await _signup_and_login(client)

    resp = await client.post(
        MATCHING_URL,
        headers=_auth_header(tokens["access_token"]),
        json={"concept_description": "I need a casual summer look for a beach photo shoot"},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert "recommendations" in data
    assert len(data["recommendations"]) >= 1
    assert len(data["recommendations"]) <= 5

    # Each recommendation should have model and score
    for rec in data["recommendations"]:
        assert "model" in rec
        assert "score" in rec
        assert 0.0 <= rec["score"] <= 1.0
        assert "id" in rec["model"]
        assert "name" in rec["model"]
        assert "style" in rec["model"]
        assert "gender" in rec["model"]

    # Results should be sorted by score descending
    scores = [rec["score"] for rec in data["recommendations"]]
    assert scores == sorted(scores, reverse=True)


@pytest.mark.asyncio
async def test_recommend_only_active_models(client: AsyncClient, db_session: AsyncSession):
    """Only active models should be recommended, not draft/inactive."""
    await _seed_active_models(db_session)
    tokens = await _signup_and_login(client)

    resp = await client.post(
        MATCHING_URL,
        headers=_auth_header(tokens["access_token"]),
        json={"concept_description": "casual male model for a photoshoot"},
    )
    assert resp.status_code == 200
    data = resp.json()

    # Draft model should NOT appear in recommendations
    for rec in data["recommendations"]:
        assert rec["model"]["status"] == "active"


@pytest.mark.asyncio
async def test_recommend_max_5_results(client: AsyncClient, db_session: AsyncSession):
    """Recommendations should return at most 5 results."""
    await _seed_active_models(db_session)
    tokens = await _signup_and_login(client)

    resp = await client.post(
        MATCHING_URL,
        headers=_auth_header(tokens["access_token"]),
        json={"concept_description": "any style any gender any age"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["recommendations"]) <= 5


@pytest.mark.asyncio
async def test_recommend_with_reference_images(client: AsyncClient, db_session: AsyncSession):
    """Reference images should be accepted (optional field)."""
    await _seed_active_models(db_session)
    tokens = await _signup_and_login(client)

    resp = await client.post(
        MATCHING_URL,
        headers=_auth_header(tokens["access_token"]),
        json={
            "concept_description": "formal business look",
            "reference_images": [
                "https://example.com/ref1.jpg",
                "https://example.com/ref2.jpg",
            ],
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) >= 1


@pytest.mark.asyncio
async def test_recommend_no_matching_models(client: AsyncClient):
    """When no models exist, return empty recommendations."""
    tokens = await _signup_and_login(client)

    resp = await client.post(
        MATCHING_URL,
        headers=_auth_header(tokens["access_token"]),
        json={"concept_description": "casual summer look"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["recommendations"] == []


@pytest.mark.asyncio
async def test_recommend_keyword_matching(client: AsyncClient, db_session: AsyncSession):
    """Keyword matching should prioritize models matching the concept keywords."""
    await _seed_active_models(db_session)
    tokens = await _signup_and_login(client)

    # Request specifically for "formal business" - should rank formal model higher
    resp = await client.post(
        MATCHING_URL,
        headers=_auth_header(tokens["access_token"]),
        json={"concept_description": "formal business professional suit"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["recommendations"]) >= 1

    # The top recommendation should be the formal business model
    top_rec = data["recommendations"][0]
    assert top_rec["model"]["style"] == "formal"
    assert top_rec["score"] > 0.0


@pytest.mark.asyncio
async def test_recommend_response_structure(client: AsyncClient, db_session: AsyncSession):
    """Verify complete response structure matches schema."""
    await _seed_active_models(db_session)
    tokens = await _signup_and_login(client)

    resp = await client.post(
        MATCHING_URL,
        headers=_auth_header(tokens["access_token"]),
        json={"concept_description": "sporty fitness model"},
    )
    assert resp.status_code == 200
    data = resp.json()

    # Top-level structure
    assert "recommendations" in data

    if len(data["recommendations"]) > 0:
        rec = data["recommendations"][0]
        # Recommendation structure
        assert "model" in rec
        assert "score" in rec

        # Model structure
        model = rec["model"]
        required_fields = [
            "id", "name", "style", "gender", "age_range",
            "status", "view_count", "rating",
        ]
        for field in required_fields:
            assert field in model, f"Missing field: {field}"
