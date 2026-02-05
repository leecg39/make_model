# @TASK P2-R2-T1 - Favorites API tests
# @SPEC docs/planning/02-trd.md#favorites-api
"""Tests for favorites (bookmarks) endpoints.

RED phase: these tests define the expected behaviour before implementation.

Endpoints:
    GET    /api/favorites          - List my favorites (paginated, with model info)
    POST   /api/favorites          - Add a favorite (409 if already favorited)
    DELETE /api/favorites/{model_id} - Remove favorite by model_id (404 if not found)
"""
import uuid

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_model import AIModel
from app.models.user import User
from app.core.security import get_password_hash, create_access_token


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

FAVORITES_URL = "/api/favorites"
SIGNUP_URL = "/api/auth/signup"
LOGIN_URL = "/api/auth/login"


def _brand_payload(email: str = "brand@example.com") -> dict:
    return {
        "email": email,
        "password": "StrongPass1!",
        "nickname": "BrandUser",
        "role": "brand",
        "company_name": "TestCorp",
    }


def _creator_payload(email: str = "creator@example.com") -> dict:
    return {
        "email": email,
        "password": "StrongPass1!",
        "nickname": "CreatorUser",
        "role": "creator",
    }


async def _signup_and_login(client: AsyncClient, payload: dict = None) -> dict:
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


async def _create_ai_model(db_session: AsyncSession, creator_id: str, name: str = "TestModel") -> AIModel:
    """Create an AIModel directly in the database for testing."""
    model = AIModel(
        id=str(uuid.uuid4()),
        creator_id=creator_id,
        name=name,
        description="A test AI model",
        style="casual",
        gender="female",
        age_range="20s",
        status="active",
    )
    db_session.add(model)
    await db_session.commit()
    await db_session.refresh(model)
    return model


# ---------------------------------------------------------------------------
# 1. POST /api/favorites - Add favorite
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_add_favorite_success(client: AsyncClient, db_session: AsyncSession):
    """Authenticated user can add a model to favorites."""
    # Create a creator user and an AI model
    creator_tokens = await _signup_and_login(client, _creator_payload())
    creator_id = creator_tokens["user"]["id"]
    ai_model = await _create_ai_model(db_session, creator_id)

    # Login as brand user
    brand_tokens = await _signup_and_login(client, _brand_payload())

    resp = await client.post(
        FAVORITES_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json={"model_id": ai_model.id},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["model_id"] == ai_model.id
    assert "id" in data
    assert "user_id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_add_favorite_duplicate_returns_409(client: AsyncClient, db_session: AsyncSession):
    """Adding the same model twice returns 409 Conflict."""
    creator_tokens = await _signup_and_login(client, _creator_payload())
    creator_id = creator_tokens["user"]["id"]
    ai_model = await _create_ai_model(db_session, creator_id)

    brand_tokens = await _signup_and_login(client, _brand_payload())
    headers = _auth_header(brand_tokens["access_token"])

    # First add - should succeed
    resp1 = await client.post(FAVORITES_URL, headers=headers, json={"model_id": ai_model.id})
    assert resp1.status_code == 201

    # Second add - should conflict
    resp2 = await client.post(FAVORITES_URL, headers=headers, json={"model_id": ai_model.id})
    assert resp2.status_code == 409


@pytest.mark.asyncio
async def test_add_favorite_model_not_found_returns_404(client: AsyncClient):
    """Adding a non-existent model returns 404."""
    brand_tokens = await _signup_and_login(client, _brand_payload())
    fake_model_id = str(uuid.uuid4())

    resp = await client.post(
        FAVORITES_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json={"model_id": fake_model_id},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_add_favorite_unauthenticated_returns_401(client: AsyncClient):
    """Unauthenticated request returns 401."""
    resp = await client.post(
        FAVORITES_URL,
        json={"model_id": str(uuid.uuid4())},
    )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 2. GET /api/favorites - List my favorites
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_favorites_empty(client: AsyncClient):
    """Authenticated user with no favorites gets empty list."""
    brand_tokens = await _signup_and_login(client, _brand_payload())

    resp = await client.get(
        FAVORITES_URL,
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0
    assert data["page"] == 1


@pytest.mark.asyncio
async def test_list_favorites_with_model_info(client: AsyncClient, db_session: AsyncSession):
    """Favorites list includes AI model information (name, etc.)."""
    creator_tokens = await _signup_and_login(client, _creator_payload())
    creator_id = creator_tokens["user"]["id"]
    ai_model = await _create_ai_model(db_session, creator_id, name="BeautifulModel")

    brand_tokens = await _signup_and_login(client, _brand_payload())
    headers = _auth_header(brand_tokens["access_token"])

    # Add favorite
    await client.post(FAVORITES_URL, headers=headers, json={"model_id": ai_model.id})

    # List favorites
    resp = await client.get(FAVORITES_URL, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1

    item = data["items"][0]
    assert item["model_id"] == ai_model.id
    assert "model" in item
    assert item["model"]["name"] == "BeautifulModel"
    assert item["model"]["id"] == ai_model.id


@pytest.mark.asyncio
async def test_list_favorites_pagination(client: AsyncClient, db_session: AsyncSession):
    """Favorites list supports pagination (page, limit)."""
    creator_tokens = await _signup_and_login(client, _creator_payload())
    creator_id = creator_tokens["user"]["id"]

    brand_tokens = await _signup_and_login(client, _brand_payload())
    headers = _auth_header(brand_tokens["access_token"])

    # Create 5 models and favorite them all
    for i in range(5):
        ai_model = await _create_ai_model(db_session, creator_id, name=f"Model{i}")
        await client.post(FAVORITES_URL, headers=headers, json={"model_id": ai_model.id})

    # Request page 1 with limit 2
    resp = await client.get(FAVORITES_URL, headers=headers, params={"page": 1, "limit": 2})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 2
    assert data["total"] == 5
    assert data["page"] == 1
    assert data["limit"] == 2

    # Request page 3 with limit 2 (should get 1 item)
    resp2 = await client.get(FAVORITES_URL, headers=headers, params={"page": 3, "limit": 2})
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert len(data2["items"]) == 1
    assert data2["total"] == 5
    assert data2["page"] == 3


@pytest.mark.asyncio
async def test_list_favorites_unauthenticated_returns_401(client: AsyncClient):
    """Unauthenticated request returns 401."""
    resp = await client.get(FAVORITES_URL)
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 3. DELETE /api/favorites/{model_id} - Remove favorite
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_delete_favorite_success(client: AsyncClient, db_session: AsyncSession):
    """Authenticated user can remove a favorite by model_id."""
    creator_tokens = await _signup_and_login(client, _creator_payload())
    creator_id = creator_tokens["user"]["id"]
    ai_model = await _create_ai_model(db_session, creator_id)

    brand_tokens = await _signup_and_login(client, _brand_payload())
    headers = _auth_header(brand_tokens["access_token"])

    # Add favorite
    await client.post(FAVORITES_URL, headers=headers, json={"model_id": ai_model.id})

    # Delete favorite
    resp = await client.delete(f"{FAVORITES_URL}/{ai_model.id}", headers=headers)
    assert resp.status_code == 204

    # Verify it's gone
    list_resp = await client.get(FAVORITES_URL, headers=headers)
    assert list_resp.json()["total"] == 0


@pytest.mark.asyncio
async def test_delete_favorite_not_found_returns_404(client: AsyncClient):
    """Deleting a non-existent favorite returns 404."""
    brand_tokens = await _signup_and_login(client, _brand_payload())
    fake_model_id = str(uuid.uuid4())

    resp = await client.delete(
        f"{FAVORITES_URL}/{fake_model_id}",
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_favorite_unauthenticated_returns_401(client: AsyncClient):
    """Unauthenticated request returns 401."""
    fake_model_id = str(uuid.uuid4())
    resp = await client.delete(f"{FAVORITES_URL}/{fake_model_id}")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 4. Isolation: user can only see own favorites
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_favorites_are_user_scoped(client: AsyncClient, db_session: AsyncSession):
    """Each user can only see their own favorites."""
    creator_tokens = await _signup_and_login(client, _creator_payload())
    creator_id = creator_tokens["user"]["id"]
    ai_model = await _create_ai_model(db_session, creator_id)

    # Brand A favorites the model
    brand_a_tokens = await _signup_and_login(client, _brand_payload("brandA@example.com"))
    headers_a = _auth_header(brand_a_tokens["access_token"])
    await client.post(FAVORITES_URL, headers=headers_a, json={"model_id": ai_model.id})

    # Brand B has no favorites
    brand_b_tokens = await _signup_and_login(client, _brand_payload("brandB@example.com"))
    headers_b = _auth_header(brand_b_tokens["access_token"])

    resp_a = await client.get(FAVORITES_URL, headers=headers_a)
    resp_b = await client.get(FAVORITES_URL, headers=headers_b)

    assert resp_a.json()["total"] == 1
    assert resp_b.json()["total"] == 0
