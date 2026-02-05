# @TASK P4-R1-T1 - Delivery Files API tests
# @SPEC docs/planning/02-trd.md#delivery-files-api
"""Tests for Delivery Files API endpoints.

Covers:
    1.  File list - brand can view (200)
    2.  File list - creator can view (200)
    3.  File list - other user forbidden (403)
    4.  File list - unauthenticated (401)
    5.  File upload - creator success (201)
    6.  File upload - brand forbidden (403)
    7.  File upload - file size exceeds 10MB (422)
    8.  File upload - order not found (404)
    9.  File list - empty list (200)
    10. File upload - invalid file_url (422)
    11. File upload - empty file_name (422)
"""
import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# URLs
# ---------------------------------------------------------------------------

SIGNUP_URL = "/api/auth/signup"
LOGIN_URL = "/api/auth/login"
ORDERS_URL = "/api/orders"


def _files_url(order_id: str) -> str:
    return f"/api/orders/{order_id}/files"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _brand_payload(email: str = "brand-delivery@example.com") -> dict:
    return {
        "email": email,
        "password": "StrongPass1!",
        "nickname": "BrandDelivery",
        "role": "brand",
        "company_name": "DeliveryCorp",
    }


def _creator_payload(email: str = "creator-delivery@example.com") -> dict:
    return {
        "email": email,
        "password": "StrongPass1!",
        "nickname": "CreatorDelivery",
        "role": "creator",
    }


async def _signup_and_login(client: AsyncClient, payload: dict) -> dict:
    """Sign up then login, return full token response JSON."""
    await client.post(SIGNUP_URL, json=payload)
    resp = await client.post(
        LOGIN_URL,
        json={"email": payload["email"], "password": payload["password"]},
    )
    return resp.json()


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def _create_model(client: AsyncClient, token: str) -> str:
    """Create an AI model and return its ID."""
    resp = await client.post(
        "/api/models",
        headers=_auth_header(token),
        json={
            "name": "DeliveryTestModel",
            "description": "A test AI model for delivery",
            "style": "casual",
            "gender": "female",
            "age_range": "20s",
            "tags": ["fashion"],
        },
    )
    assert resp.status_code == 201
    return resp.json()["id"]


async def _setup_brand_creator_model(client: AsyncClient):
    """Set up brand + creator + model. Returns (brand_tokens, creator_tokens, model_id)."""
    creator_tokens = await _signup_and_login(client, _creator_payload())
    brand_tokens = await _signup_and_login(client, _brand_payload())
    model_id = await _create_model(client, creator_tokens["access_token"])
    return brand_tokens, creator_tokens, model_id


def _order_payload(model_id: str, creator_id: str) -> dict:
    return {
        "model_id": model_id,
        "creator_id": creator_id,
        "concept_description": "Delivery test campaign",
        "package_type": "standard",
        "image_count": 5,
        "is_exclusive": False,
        "total_price": 300000,
    }


async def _create_order(client: AsyncClient, brand_token: str, model_id: str, creator_id: str) -> str:
    """Create an order and return its ID."""
    payload = _order_payload(model_id, creator_id)
    resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_token),
        json=payload,
    )
    assert resp.status_code == 201
    return resp.json()["id"]


def _file_payload(
    file_url: str = "https://cdn.example.com/photo.jpg",
    file_name: str = "photo.jpg",
    file_size: int = 1024 * 100,  # 100 KB
) -> dict:
    return {
        "file_url": file_url,
        "file_name": file_name,
        "file_size": file_size,
    }


# ---------------------------------------------------------------------------
# 1. File list - brand can view
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_files_brand(client: AsyncClient):
    """Brand (order owner) can list delivery files."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]
    order_id = await _create_order(client, brand_tokens["access_token"], model_id, creator_id)

    # Creator uploads a file first
    await client.post(
        _files_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
        json=_file_payload(),
    )

    # Brand lists files
    resp = await client.get(
        _files_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["file_name"] == "photo.jpg"
    assert data["items"][0]["order_id"] == order_id


# ---------------------------------------------------------------------------
# 2. File list - creator can view
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_files_creator(client: AsyncClient):
    """Creator (assigned to the order) can list delivery files."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]
    order_id = await _create_order(client, brand_tokens["access_token"], model_id, creator_id)

    # Creator uploads a file
    await client.post(
        _files_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
        json=_file_payload(),
    )

    # Creator lists files
    resp = await client.get(
        _files_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


# ---------------------------------------------------------------------------
# 3. File list - other user forbidden (403)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_files_other_user_forbidden(client: AsyncClient):
    """User not related to the order gets 403."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]
    order_id = await _create_order(client, brand_tokens["access_token"], model_id, creator_id)

    # Another brand user
    other_tokens = await _signup_and_login(
        client, _brand_payload(email="other-brand@example.com")
    )

    resp = await client.get(
        _files_url(order_id),
        headers=_auth_header(other_tokens["access_token"]),
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 4. File list - unauthenticated (401)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_files_unauthenticated(client: AsyncClient):
    """Unauthenticated request returns 401."""
    resp = await client.get(_files_url("some-order-id"))
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 5. File upload - creator success (201)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_upload_file_creator_success(client: AsyncClient):
    """Creator can upload a delivery file successfully."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]
    order_id = await _create_order(client, brand_tokens["access_token"], model_id, creator_id)

    payload = _file_payload()
    resp = await client.post(
        _files_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
        json=payload,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["file_url"] == payload["file_url"]
    assert data["file_name"] == payload["file_name"]
    assert data["file_size"] == payload["file_size"]
    assert data["order_id"] == order_id
    assert "id" in data
    assert "uploaded_at" in data


# ---------------------------------------------------------------------------
# 6. File upload - brand forbidden (403)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_upload_file_brand_forbidden(client: AsyncClient):
    """Brand cannot upload delivery files (only creator can)."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]
    order_id = await _create_order(client, brand_tokens["access_token"], model_id, creator_id)

    resp = await client.post(
        _files_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
        json=_file_payload(),
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 7. File upload - file size exceeds 10MB (422)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_upload_file_size_exceeds_limit(client: AsyncClient):
    """File size exceeding 10 MB returns 422 (Pydantic validation)."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]
    order_id = await _create_order(client, brand_tokens["access_token"], model_id, creator_id)

    oversized_payload = _file_payload(file_size=11 * 1024 * 1024)  # 11 MB
    resp = await client.post(
        _files_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
        json=oversized_payload,
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# 8. File upload - order not found (404)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_upload_file_order_not_found(client: AsyncClient):
    """Uploading to a non-existent order returns 404."""
    _, creator_tokens, _ = await _setup_brand_creator_model(client)

    resp = await client.post(
        _files_url("nonexistent-order-id"),
        headers=_auth_header(creator_tokens["access_token"]),
        json=_file_payload(),
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# 9. File list - empty list (200)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_files_empty(client: AsyncClient):
    """Listing files on an order with no uploads returns empty list."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]
    order_id = await _create_order(client, brand_tokens["access_token"], model_id, creator_id)

    resp = await client.get(
        _files_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


# ---------------------------------------------------------------------------
# 10. File upload - invalid file_url (422)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_upload_file_invalid_url(client: AsyncClient):
    """Invalid file_url (not starting with http/https) returns 422."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]
    order_id = await _create_order(client, brand_tokens["access_token"], model_id, creator_id)

    bad_payload = _file_payload(file_url="ftp://invalid.com/file.jpg")
    resp = await client.post(
        _files_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
        json=bad_payload,
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# 11. File upload - empty file_name (422)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_upload_file_empty_name(client: AsyncClient):
    """Empty file_name returns 422."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]
    order_id = await _create_order(client, brand_tokens["access_token"], model_id, creator_id)

    bad_payload = _file_payload(file_name="   ")
    resp = await client.post(
        _files_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
        json=bad_payload,
    )
    assert resp.status_code == 422
