# @TASK P4-R3-T1 - Settlements API tests
# @SPEC specs/domain/resources.yaml#settlements
"""Tests for Settlements API endpoints.

Covers:
    1.  Settlement list (creator)
    2.  Brand cannot list settlements (403)
    3.  Unauthenticated request (401)
    4.  Empty settlement list
    5.  Settlement list pagination
    6.  Settlement detail (creator)
    7.  Other creator cannot view settlement (403)
    8.  Settlement not found (404)
    9.  Platform fee 10% calculation
    10. Auto-create settlement on order completion
"""
import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# URLs
# ---------------------------------------------------------------------------

SIGNUP_URL = "/api/auth/signup"
LOGIN_URL = "/api/auth/login"
ORDERS_URL = "/api/orders"
SETTLEMENTS_URL = "/api/settlements"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


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
            "name": "TestModel",
            "description": "A test AI model",
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


def _order_payload(model_id: str, creator_id: str, total_price: int = 500000) -> dict:
    return {
        "model_id": model_id,
        "creator_id": creator_id,
        "concept_description": "Summer fashion campaign for social media",
        "package_type": "standard",
        "image_count": 10,
        "is_exclusive": False,
        "total_price": total_price,
    }


async def _create_and_complete_order(
    client: AsyncClient,
    brand_tokens: dict,
    creator_tokens: dict,
    model_id: str,
    total_price: int = 500000,
) -> str:
    """Create an order and advance it to 'completed'. Returns order_id."""
    creator_id = creator_tokens["user"]["id"]
    payload = _order_payload(model_id, creator_id, total_price=total_price)

    # Create order
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    assert create_resp.status_code == 201
    order_id = create_resp.json()["id"]

    # Accept (creator)
    await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "accept"},
    )
    # Start (creator)
    await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "start"},
    )
    # Complete (creator)
    resp = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "complete"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"

    return order_id


# ---------------------------------------------------------------------------
# 1. Settlement list (creator)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_settlements_creator(client: AsyncClient):
    """Creator can list their own settlements after order completion."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    await _create_and_complete_order(client, brand_tokens, creator_tokens, model_id)

    resp = await client.get(
        SETTLEMENTS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["status"] == "pending"


# ---------------------------------------------------------------------------
# 2. Brand cannot list settlements (403)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_settlements_brand_forbidden(client: AsyncClient):
    """Brand user cannot list settlements (only creators can)."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    await _create_and_complete_order(client, brand_tokens, creator_tokens, model_id)

    resp = await client.get(
        SETTLEMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 3. Unauthenticated request (401)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_settlements_unauthenticated(client: AsyncClient):
    """Unauthenticated request returns 401."""
    resp = await client.get(SETTLEMENTS_URL)
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 4. Empty settlement list
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_settlements_empty(client: AsyncClient):
    """Creator with no settlements sees empty list."""
    creator_tokens = await _signup_and_login(client, _creator_payload())

    resp = await client.get(
        SETTLEMENTS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


# ---------------------------------------------------------------------------
# 5. Settlement list pagination
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_settlements_pagination(client: AsyncClient):
    """Settlement listing supports pagination."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)

    # Create 3 completed orders (each generates a settlement)
    for _ in range(3):
        await _create_and_complete_order(
            client, brand_tokens, creator_tokens, model_id
        )

    # Page 1, limit 2
    resp = await client.get(
        SETTLEMENTS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
        params={"page": 1, "limit": 2},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 3
    assert len(data["items"]) == 2

    # Page 2, limit 2
    resp2 = await client.get(
        SETTLEMENTS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
        params={"page": 2, "limit": 2},
    )
    data2 = resp2.json()
    assert len(data2["items"]) == 1


# ---------------------------------------------------------------------------
# 6. Settlement detail (creator)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_settlement_detail(client: AsyncClient):
    """Creator can view settlement detail."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    await _create_and_complete_order(client, brand_tokens, creator_tokens, model_id)

    # Get the settlement ID from list
    list_resp = await client.get(
        SETTLEMENTS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
    )
    settlement_id = list_resp.json()["items"][0]["id"]

    # Get detail
    resp = await client.get(
        f"{SETTLEMENTS_URL}/{settlement_id}",
        headers=_auth_header(creator_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == settlement_id
    assert data["status"] == "pending"
    assert "order" in data
    assert data["order"] is not None
    assert data["order"]["status"] == "completed"


# ---------------------------------------------------------------------------
# 7. Other creator cannot view settlement (403)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_settlement_other_creator_forbidden(client: AsyncClient):
    """Another creator cannot view someone else's settlement."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    await _create_and_complete_order(client, brand_tokens, creator_tokens, model_id)

    # Get settlement ID from list
    list_resp = await client.get(
        SETTLEMENTS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
    )
    settlement_id = list_resp.json()["items"][0]["id"]

    # Sign up another creator
    creator2_tokens = await _signup_and_login(
        client, _creator_payload(email="creator2@example.com")
    )

    # Other creator tries to access the settlement
    resp = await client.get(
        f"{SETTLEMENTS_URL}/{settlement_id}",
        headers=_auth_header(creator2_tokens["access_token"]),
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 8. Settlement not found (404)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_settlement_not_found(client: AsyncClient):
    """Non-existent settlement returns 404."""
    creator_tokens = await _signup_and_login(client, _creator_payload())

    resp = await client.get(
        f"{SETTLEMENTS_URL}/nonexistent-id",
        headers=_auth_header(creator_tokens["access_token"]),
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# 9. Platform fee 10% calculation
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_settlement_fee_calculation(client: AsyncClient):
    """Settlement correctly applies 10% platform fee."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    total_price = 1000000  # 1,000,000 won

    await _create_and_complete_order(
        client, brand_tokens, creator_tokens, model_id, total_price=total_price
    )

    # Get settlement detail
    list_resp = await client.get(
        SETTLEMENTS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
    )
    settlement = list_resp.json()["items"][0]

    assert settlement["total_amount"] == total_price
    assert settlement["platform_fee"] == int(total_price * 0.10)  # 100,000
    assert settlement["settlement_amount"] == total_price - int(total_price * 0.10)  # 900,000


# ---------------------------------------------------------------------------
# 10. Auto-create settlement on order completion
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_auto_settlement_on_order_complete(client: AsyncClient):
    """Settlement is automatically created when order is completed."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)

    # Before completing any order, settlement list should be empty
    resp_before = await client.get(
        SETTLEMENTS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
    )
    assert resp_before.status_code == 200
    assert resp_before.json()["total"] == 0

    # Complete an order
    order_id = await _create_and_complete_order(
        client, brand_tokens, creator_tokens, model_id, total_price=500000
    )

    # After completion, settlement should exist
    resp_after = await client.get(
        SETTLEMENTS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
    )
    assert resp_after.status_code == 200
    data = resp_after.json()
    assert data["total"] == 1

    settlement = data["items"][0]
    assert settlement["order_id"] == order_id
    assert settlement["creator_id"] == creator_tokens["user"]["id"]
    assert settlement["total_amount"] == 500000
    assert settlement["platform_fee"] == 50000  # 10%
    assert settlement["settlement_amount"] == 450000  # 500000 - 50000
    assert settlement["status"] == "pending"
