# @TASK P2-R1-T1 - AI Models API tests
# @SPEC docs/planning/02-trd.md#ai-models-api
"""Tests for AI Models API endpoints.

RED phase: these tests define the expected behaviour before implementation.

Endpoints:
    GET    /api/models              - List models with filters & pagination
    GET    /api/models/:id          - Get model detail (view_count++)
    POST   /api/models              - Create model (creator only)
    PATCH  /api/models/:id          - Update model (owner only)
    POST   /api/models/:id/images   - Upload model image (owner only)
"""
from typing import Optional, Tuple

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_model import AIModel, ModelImage, ModelTag
from app.models.user import User
from app.core.security import get_password_hash


# ---------------------------------------------------------------------------
# URLs
# ---------------------------------------------------------------------------

MODELS_URL = "/api/models"
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


def _model_payload(overrides: Optional[dict] = None) -> dict:
    base = {
        "name": "Test Model",
        "description": "A beautiful test model",
        "style": "casual",
        "gender": "female",
        "age_range": "20s",
        "tags": ["fashion", "casual"],
    }
    if overrides:
        base.update(overrides)
    return base


async def _signup_and_login(client: AsyncClient, payload: Optional[dict] = None) -> dict:
    """Helper: sign up then login, return token response JSON."""
    payload = payload or _creator_payload()
    await client.post(SIGNUP_URL, json=payload)
    login_resp = await client.post(
        LOGIN_URL,
        json={"email": payload["email"], "password": payload["password"]},
    )
    return login_resp.json()


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def _create_model_via_api(
    client: AsyncClient, token: str, overrides: Optional[dict] = None
) -> dict:
    """Helper: create a model and return response JSON."""
    resp = await client.post(
        MODELS_URL,
        headers=_auth_header(token),
        json=_model_payload(overrides),
    )
    assert resp.status_code == 201
    return resp.json()


async def _seed_creator_with_model(
    db_session: AsyncSession,
) -> Tuple[User, AIModel]:
    """Seed a creator user and AI model directly in DB for read tests."""
    user = User(
        email="seeded@example.com",
        password_hash=get_password_hash("StrongPass1!"),
        nickname="SeededCreator",
        role="creator",
    )
    db_session.add(user)
    await db_session.flush()

    model = AIModel(
        creator_id=user.id,
        name="Seeded Model",
        description="A seeded model for testing",
        style="formal",
        gender="male",
        age_range="30s",
        view_count=10,
        rating=4.5,
        status="active",
    )
    db_session.add(model)
    await db_session.flush()

    tag1 = ModelTag(model_id=model.id, tag="fashion")
    tag2 = ModelTag(model_id=model.id, tag="formal")
    db_session.add_all([tag1, tag2])

    img = ModelImage(
        model_id=model.id,
        image_url="https://example.com/thumb.jpg",
        display_order=1,
        is_thumbnail=True,
    )
    db_session.add(img)
    await db_session.commit()
    await db_session.refresh(model)
    await db_session.refresh(user)

    return user, model


# ===========================================================================
# 1. POST /api/models - Create model
# ===========================================================================


@pytest.mark.asyncio
async def test_create_model_success(client: AsyncClient):
    """Creator can create a new AI model."""
    tokens = await _signup_and_login(client, _creator_payload())
    resp = await client.post(
        MODELS_URL,
        headers=_auth_header(tokens["access_token"]),
        json=_model_payload(),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Test Model"
    assert data["style"] == "casual"
    assert data["gender"] == "female"
    assert data["age_range"] == "20s"
    assert data["status"] == "draft"
    assert data["view_count"] == 0
    assert "id" in data
    assert "created_at" in data
    # Tags should be returned
    assert len(data["tags"]) == 2
    assert "fashion" in data["tags"]
    assert "casual" in data["tags"]


@pytest.mark.asyncio
async def test_create_model_brand_forbidden(client: AsyncClient):
    """Brand user cannot create AI models."""
    tokens = await _signup_and_login(client, _brand_payload())
    resp = await client.post(
        MODELS_URL,
        headers=_auth_header(tokens["access_token"]),
        json=_model_payload(),
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_model_unauthenticated(client: AsyncClient):
    """Unauthenticated user cannot create AI models."""
    resp = await client.post(MODELS_URL, json=_model_payload())
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_model_invalid_style(client: AsyncClient):
    """Invalid style value is rejected."""
    tokens = await _signup_and_login(client, _creator_payload())
    resp = await client.post(
        MODELS_URL,
        headers=_auth_header(tokens["access_token"]),
        json=_model_payload({"style": "INVALID_STYLE"}),
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_model_invalid_gender(client: AsyncClient):
    """Invalid gender value is rejected."""
    tokens = await _signup_and_login(client, _creator_payload())
    resp = await client.post(
        MODELS_URL,
        headers=_auth_header(tokens["access_token"]),
        json=_model_payload({"gender": "INVALID"}),
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_model_invalid_age_range(client: AsyncClient):
    """Invalid age_range value is rejected."""
    tokens = await _signup_and_login(client, _creator_payload())
    resp = await client.post(
        MODELS_URL,
        headers=_auth_header(tokens["access_token"]),
        json=_model_payload({"age_range": "99s"}),
    )
    assert resp.status_code == 422


# ===========================================================================
# 2. GET /api/models - List models
# ===========================================================================


@pytest.mark.asyncio
async def test_list_models_empty(client: AsyncClient):
    """Empty database returns empty list."""
    resp = await client.get(MODELS_URL)
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0
    assert data["page"] == 1
    assert data["limit"] == 12


@pytest.mark.asyncio
async def test_list_models_with_data(client: AsyncClient, db_session: AsyncSession):
    """List models returns seeded data."""
    await _seed_creator_with_model(db_session)
    resp = await client.get(MODELS_URL)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1
    item = data["items"][0]
    assert "id" in item
    assert "name" in item
    assert "thumbnail_url" in item
    assert "tags" in item
    assert "creator" in item


@pytest.mark.asyncio
async def test_list_models_pagination(client: AsyncClient):
    """Pagination works with page and limit params."""
    # Create multiple models via API
    tokens = await _signup_and_login(client, _creator_payload())
    for i in range(5):
        await _create_model_via_api(
            client, tokens["access_token"], {"name": f"Model {i}"}
        )

    # Page 1, limit 2
    resp = await client.get(MODELS_URL, params={"page": 1, "limit": 2})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 2
    assert data["total"] == 5
    assert data["page"] == 1
    assert data["limit"] == 2

    # Page 3, limit 2 (should have 1 item)
    resp2 = await client.get(MODELS_URL, params={"page": 3, "limit": 2})
    data2 = resp2.json()
    assert len(data2["items"]) == 1


@pytest.mark.asyncio
async def test_list_models_filter_by_style(client: AsyncClient):
    """Filter models by style."""
    tokens = await _signup_and_login(client, _creator_payload())
    await _create_model_via_api(client, tokens["access_token"], {"style": "casual"})
    await _create_model_via_api(client, tokens["access_token"], {"style": "formal", "name": "Formal Model"})

    resp = await client.get(MODELS_URL, params={"style": "casual"})
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["style"] == "casual"


@pytest.mark.asyncio
async def test_list_models_filter_by_gender(client: AsyncClient):
    """Filter models by gender."""
    tokens = await _signup_and_login(client, _creator_payload())
    await _create_model_via_api(client, tokens["access_token"], {"gender": "female"})
    await _create_model_via_api(client, tokens["access_token"], {"gender": "male", "name": "Male Model"})

    resp = await client.get(MODELS_URL, params={"gender": "female"})
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["gender"] == "female"


@pytest.mark.asyncio
async def test_list_models_filter_by_age_range(client: AsyncClient):
    """Filter models by age_range."""
    tokens = await _signup_and_login(client, _creator_payload())
    await _create_model_via_api(client, tokens["access_token"], {"age_range": "20s"})
    await _create_model_via_api(client, tokens["access_token"], {"age_range": "30s", "name": "Older Model"})

    resp = await client.get(MODELS_URL, params={"age_range": "20s"})
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["age_range"] == "20s"


@pytest.mark.asyncio
async def test_list_models_keyword_search(client: AsyncClient):
    """Search models by keyword in name/description."""
    tokens = await _signup_and_login(client, _creator_payload())
    await _create_model_via_api(client, tokens["access_token"], {"name": "Summer Vibe"})
    await _create_model_via_api(client, tokens["access_token"], {"name": "Winter Look"})

    resp = await client.get(MODELS_URL, params={"keyword": "Summer"})
    data = resp.json()
    assert data["total"] == 1
    assert "Summer" in data["items"][0]["name"]


@pytest.mark.asyncio
async def test_list_models_sort_recent(client: AsyncClient):
    """Sort models by most recent."""
    tokens = await _signup_and_login(client, _creator_payload())
    await _create_model_via_api(client, tokens["access_token"], {"name": "First"})
    await _create_model_via_api(client, tokens["access_token"], {"name": "Second"})

    resp = await client.get(MODELS_URL, params={"sort": "recent"})
    data = resp.json()
    assert data["items"][0]["name"] == "Second"


@pytest.mark.asyncio
async def test_list_models_sort_popular(client: AsyncClient, db_session: AsyncSession):
    """Sort models by popularity (view_count)."""
    user, popular_model = await _seed_creator_with_model(db_session)

    tokens = await _signup_and_login(client, _creator_payload())
    await _create_model_via_api(client, tokens["access_token"], {"name": "Less Popular"})

    resp = await client.get(MODELS_URL, params={"sort": "popular"})
    data = resp.json()
    # Seeded model has view_count=10, new model has 0
    assert data["items"][0]["view_count"] >= data["items"][1]["view_count"]


@pytest.mark.asyncio
async def test_list_models_sort_rating(client: AsyncClient, db_session: AsyncSession):
    """Sort models by rating."""
    user, high_rated_model = await _seed_creator_with_model(db_session)

    tokens = await _signup_and_login(client, _creator_payload())
    await _create_model_via_api(client, tokens["access_token"], {"name": "Low Rated"})

    resp = await client.get(MODELS_URL, params={"sort": "rating"})
    data = resp.json()
    assert data["items"][0]["rating"] >= data["items"][1]["rating"]


# ===========================================================================
# 3. GET /api/models/:id - Get model detail
# ===========================================================================


@pytest.mark.asyncio
async def test_get_model_detail(client: AsyncClient, db_session: AsyncSession):
    """Get model detail with images, tags, and creator info."""
    user, model = await _seed_creator_with_model(db_session)

    resp = await client.get(f"{MODELS_URL}/{model.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == model.id
    assert data["name"] == "Seeded Model"
    assert data["style"] == "formal"
    assert data["gender"] == "male"
    assert data["age_range"] == "30s"

    # Should include creator info
    assert "creator" in data
    assert data["creator"]["nickname"] == "SeededCreator"

    # Should include tags
    assert "tags" in data
    assert len(data["tags"]) == 2

    # Should include images
    assert "images" in data
    assert len(data["images"]) >= 1

    # Should include thumbnail_url
    assert "thumbnail_url" in data
    assert data["thumbnail_url"] == "https://example.com/thumb.jpg"


@pytest.mark.asyncio
async def test_get_model_detail_increments_view_count(
    client: AsyncClient, db_session: AsyncSession
):
    """Accessing model detail increments view_count."""
    user, model = await _seed_creator_with_model(db_session)
    initial_view_count = model.view_count

    await client.get(f"{MODELS_URL}/{model.id}")

    resp = await client.get(f"{MODELS_URL}/{model.id}")
    data = resp.json()
    # After two GETs, view_count should be initial + 2
    assert data["view_count"] == initial_view_count + 2


@pytest.mark.asyncio
async def test_get_model_not_found(client: AsyncClient):
    """Non-existent model ID returns 404."""
    resp = await client.get(f"{MODELS_URL}/nonexistent-id")
    assert resp.status_code == 404


# ===========================================================================
# 4. PATCH /api/models/:id - Update model
# ===========================================================================


@pytest.mark.asyncio
async def test_update_model_success(client: AsyncClient):
    """Owner can update their model."""
    tokens = await _signup_and_login(client, _creator_payload())
    model_data = await _create_model_via_api(client, tokens["access_token"])

    resp = await client.patch(
        f"{MODELS_URL}/{model_data['id']}",
        headers=_auth_header(tokens["access_token"]),
        json={"name": "Updated Name", "description": "Updated desc"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Updated desc"


@pytest.mark.asyncio
async def test_update_model_non_owner_forbidden(client: AsyncClient):
    """Non-owner creator cannot update another's model."""
    # Creator 1 creates model
    tokens1 = await _signup_and_login(client, _creator_payload("creator1@example.com"))
    model_data = await _create_model_via_api(client, tokens1["access_token"])

    # Creator 2 tries to update
    tokens2 = await _signup_and_login(client, _creator_payload("creator2@example.com"))
    resp = await client.patch(
        f"{MODELS_URL}/{model_data['id']}",
        headers=_auth_header(tokens2["access_token"]),
        json={"name": "Hacked Name"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_update_model_brand_forbidden(client: AsyncClient):
    """Brand user cannot update any model."""
    tokens_creator = await _signup_and_login(client, _creator_payload())
    model_data = await _create_model_via_api(client, tokens_creator["access_token"])

    tokens_brand = await _signup_and_login(client, _brand_payload())
    resp = await client.patch(
        f"{MODELS_URL}/{model_data['id']}",
        headers=_auth_header(tokens_brand["access_token"]),
        json={"name": "Brand Update"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_update_model_unauthenticated(client: AsyncClient):
    """Unauthenticated user cannot update models."""
    tokens = await _signup_and_login(client, _creator_payload())
    model_data = await _create_model_via_api(client, tokens["access_token"])

    resp = await client.patch(
        f"{MODELS_URL}/{model_data['id']}",
        json={"name": "No Auth"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_update_model_not_found(client: AsyncClient):
    """Updating non-existent model returns 404."""
    tokens = await _signup_and_login(client, _creator_payload())
    resp = await client.patch(
        f"{MODELS_URL}/nonexistent-id",
        headers=_auth_header(tokens["access_token"]),
        json={"name": "Ghost"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_model_tags(client: AsyncClient):
    """Owner can update model tags."""
    tokens = await _signup_and_login(client, _creator_payload())
    model_data = await _create_model_via_api(client, tokens["access_token"])

    resp = await client.patch(
        f"{MODELS_URL}/{model_data['id']}",
        headers=_auth_header(tokens["access_token"]),
        json={"tags": ["updated", "new-tag"]},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert set(data["tags"]) == {"updated", "new-tag"}


@pytest.mark.asyncio
async def test_update_model_status(client: AsyncClient):
    """Owner can change model status."""
    tokens = await _signup_and_login(client, _creator_payload())
    model_data = await _create_model_via_api(client, tokens["access_token"])
    assert model_data["status"] == "draft"

    resp = await client.patch(
        f"{MODELS_URL}/{model_data['id']}",
        headers=_auth_header(tokens["access_token"]),
        json={"status": "active"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "active"


# ===========================================================================
# 5. POST /api/models/:id/images - Upload model image
# ===========================================================================


@pytest.mark.asyncio
async def test_upload_model_image(client: AsyncClient):
    """Owner can upload an image to their model."""
    tokens = await _signup_and_login(client, _creator_payload())
    model_data = await _create_model_via_api(client, tokens["access_token"])

    # Use multipart form upload (stub - file content doesn't matter for S3 stub)
    resp = await client.post(
        f"{MODELS_URL}/{model_data['id']}/images",
        headers=_auth_header(tokens["access_token"]),
        files={"file": ("test.jpg", b"fake-image-data", "image/jpeg")},
        data={"is_thumbnail": "false"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "id" in data
    assert "image_url" in data
    assert data["image_url"].startswith("https://")


@pytest.mark.asyncio
async def test_upload_model_image_as_thumbnail(client: AsyncClient):
    """Owner can upload a thumbnail image."""
    tokens = await _signup_and_login(client, _creator_payload())
    model_data = await _create_model_via_api(client, tokens["access_token"])

    resp = await client.post(
        f"{MODELS_URL}/{model_data['id']}/images",
        headers=_auth_header(tokens["access_token"]),
        files={"file": ("thumb.jpg", b"fake-image-data", "image/jpeg")},
        data={"is_thumbnail": "true"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["is_thumbnail"] is True


@pytest.mark.asyncio
async def test_upload_image_non_owner_forbidden(client: AsyncClient):
    """Non-owner cannot upload images to another's model."""
    tokens1 = await _signup_and_login(client, _creator_payload("owner@example.com"))
    model_data = await _create_model_via_api(client, tokens1["access_token"])

    tokens2 = await _signup_and_login(client, _creator_payload("other@example.com"))
    resp = await client.post(
        f"{MODELS_URL}/{model_data['id']}/images",
        headers=_auth_header(tokens2["access_token"]),
        files={"file": ("test.jpg", b"fake-image-data", "image/jpeg")},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_upload_image_unauthenticated(client: AsyncClient):
    """Unauthenticated user cannot upload images."""
    tokens = await _signup_and_login(client, _creator_payload())
    model_data = await _create_model_via_api(client, tokens["access_token"])

    resp = await client.post(
        f"{MODELS_URL}/{model_data['id']}/images",
        files={"file": ("test.jpg", b"fake-image-data", "image/jpeg")},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_upload_image_model_not_found(client: AsyncClient):
    """Upload to non-existent model returns 404."""
    tokens = await _signup_and_login(client, _creator_payload())
    resp = await client.post(
        f"{MODELS_URL}/nonexistent-id/images",
        headers=_auth_header(tokens["access_token"]),
        files={"file": ("test.jpg", b"fake-image-data", "image/jpeg")},
    )
    assert resp.status_code == 404


# ===========================================================================
# 6. Combined filter tests
# ===========================================================================


@pytest.mark.asyncio
async def test_list_models_combined_filters(client: AsyncClient):
    """Multiple filters can be combined."""
    tokens = await _signup_and_login(client, _creator_payload())

    # Create models with different attributes
    await _create_model_via_api(
        client, tokens["access_token"],
        {"name": "Casual Young", "style": "casual", "gender": "female", "age_range": "20s"},
    )
    await _create_model_via_api(
        client, tokens["access_token"],
        {"name": "Formal Old", "style": "formal", "gender": "male", "age_range": "40s+"},
    )
    await _create_model_via_api(
        client, tokens["access_token"],
        {"name": "Casual Old", "style": "casual", "gender": "male", "age_range": "40s+"},
    )

    resp = await client.get(
        MODELS_URL,
        params={"style": "casual", "gender": "male"},
    )
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Casual Old"
