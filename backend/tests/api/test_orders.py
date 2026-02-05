# @TASK P3-R2-T1 - Orders API tests
# @SPEC docs/planning/02-trd.md#orders-api
"""Tests for Orders API endpoints.

Covers:
    - Order creation (brand only)
    - Order listing with role-based filtering
    - Order detail retrieval
    - Status transitions (accept/reject/complete/cancel)
    - Permission checks per status change
    - Validation (package_type, image_count, etc.)
"""
import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# URLs
# ---------------------------------------------------------------------------

SIGNUP_URL = "/api/auth/signup"
LOGIN_URL = "/api/auth/login"
ORDERS_URL = "/api/orders"


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


def _order_payload(model_id: str, creator_id: str) -> dict:
    return {
        "model_id": model_id,
        "creator_id": creator_id,
        "concept_description": "Summer fashion campaign for social media",
        "package_type": "standard",
        "image_count": 10,
        "is_exclusive": False,
        "total_price": 500000,
    }


# ---------------------------------------------------------------------------
# 1. Order creation
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_order_success(client: AsyncClient):
    """Brand can create an order."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "pending"
    assert data["model_id"] == model_id
    assert data["creator_id"] == creator_id
    assert data["concept_description"] == payload["concept_description"]
    assert data["package_type"] == "standard"
    assert data["image_count"] == 10
    assert data["total_price"] == 500000
    assert data["order_number"].startswith("ORD-")
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_order_with_exclusive(client: AsyncClient):
    """Brand can create an exclusive order with exclusive_months."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    payload["is_exclusive"] = True
    payload["exclusive_months"] = 6
    payload["package_type"] = "exclusive"

    resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["is_exclusive"] is True
    assert data["exclusive_months"] == 6
    assert data["package_type"] == "exclusive"


@pytest.mark.asyncio
async def test_create_order_creator_forbidden(client: AsyncClient):
    """Creator cannot create orders (only brand can)."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
        json=payload,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_order_unauthenticated(client: AsyncClient):
    """Unauthenticated request returns 401."""
    resp = await client.post(ORDERS_URL, json={"model_id": "fake"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_order_invalid_package_type(client: AsyncClient):
    """Invalid package_type returns 422."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    payload["package_type"] = "invalid_type"
    resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_order_auto_order_number(client: AsyncClient):
    """Each order gets a unique order_number in ORD-YYYYMMDD-NNN format."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    # Create two orders
    payload = _order_payload(model_id, creator_id)
    resp1 = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    resp2 = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    assert resp1.status_code == 201
    assert resp2.status_code == 201
    order1 = resp1.json()
    order2 = resp2.json()

    # Both start with ORD- and are different
    assert order1["order_number"].startswith("ORD-")
    assert order2["order_number"].startswith("ORD-")
    assert order1["order_number"] != order2["order_number"]


# ---------------------------------------------------------------------------
# 2. Order listing
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_orders_brand_sees_own(client: AsyncClient):
    """Brand sees only their own orders."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    # Brand creates an order
    payload = _order_payload(model_id, creator_id)
    await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )

    # Brand lists orders
    resp = await client.get(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_list_orders_creator_sees_own(client: AsyncClient):
    """Creator sees orders assigned to them."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    # Brand creates an order targeting this creator
    payload = _order_payload(model_id, creator_id)
    await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )

    # Creator lists orders
    resp = await client.get(
        ORDERS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_list_orders_other_brand_sees_nothing(client: AsyncClient):
    """Another brand sees no orders (not theirs)."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    # First brand creates an order
    payload = _order_payload(model_id, creator_id)
    await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )

    # Second brand signs up
    brand2_tokens = await _signup_and_login(
        client, _brand_payload(email="brand2@example.com")
    )

    # Second brand lists orders - should see 0
    resp = await client.get(
        ORDERS_URL,
        headers=_auth_header(brand2_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_list_orders_pagination(client: AsyncClient):
    """Order listing supports pagination."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    # Create 3 orders
    payload = _order_payload(model_id, creator_id)
    for _ in range(3):
        await client.post(
            ORDERS_URL,
            headers=_auth_header(brand_tokens["access_token"]),
            json=payload,
        )

    # Page 1, limit 2
    resp = await client.get(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        params={"page": 1, "limit": 2},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 3
    assert len(data["items"]) == 2

    # Page 2, limit 2
    resp2 = await client.get(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        params={"page": 2, "limit": 2},
    )
    data2 = resp2.json()
    assert len(data2["items"]) == 1


@pytest.mark.asyncio
async def test_list_orders_filter_by_status(client: AsyncClient):
    """Order listing supports status filtering."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    # Create an order (pending)
    payload = _order_payload(model_id, creator_id)
    await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )

    # Filter by pending
    resp = await client.get(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        params={"status": "pending"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1

    # Filter by accepted (should be 0)
    resp2 = await client.get(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        params={"status": "accepted"},
    )
    data2 = resp2.json()
    assert data2["total"] == 0


# ---------------------------------------------------------------------------
# 3. Order detail
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_order_detail(client: AsyncClient):
    """Can retrieve order detail by ID."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    # Brand can see the order
    resp = await client.get(
        f"{ORDERS_URL}/{order_id}",
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == order_id
    assert data["concept_description"] == payload["concept_description"]


@pytest.mark.asyncio
async def test_get_order_detail_creator(client: AsyncClient):
    """Creator assigned to the order can see it."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    resp = await client.get(
        f"{ORDERS_URL}/{order_id}",
        headers=_auth_header(creator_tokens["access_token"]),
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_get_order_not_found(client: AsyncClient):
    """Non-existent order returns 404."""
    brand_tokens, _, _ = await _setup_brand_creator_model(client)
    resp = await client.get(
        f"{ORDERS_URL}/nonexistent-id",
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_order_other_user_forbidden(client: AsyncClient):
    """User not related to the order gets 403."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    # Another brand cannot see the order
    brand2_tokens = await _signup_and_login(
        client, _brand_payload(email="brand2@example.com")
    )
    resp = await client.get(
        f"{ORDERS_URL}/{order_id}",
        headers=_auth_header(brand2_tokens["access_token"]),
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 4. Status transitions
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_status_accept_by_creator(client: AsyncClient):
    """Creator can accept a pending order."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    # Creator accepts
    resp = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "accept"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "accepted"
    assert data["accepted_at"] is not None


@pytest.mark.asyncio
async def test_status_reject_by_creator(client: AsyncClient):
    """Creator can reject a pending order."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    resp = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "reject"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "rejected"


@pytest.mark.asyncio
async def test_status_complete_by_creator(client: AsyncClient):
    """Creator can complete an accepted order (moves to in_progress first, then completed)."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    # Accept first
    await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "accept"},
    )

    # Start work (in_progress)
    resp_progress = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "start"},
    )
    assert resp_progress.status_code == 200
    assert resp_progress.json()["status"] == "in_progress"

    # Complete
    resp = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "complete"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "completed"
    assert data["completed_at"] is not None


@pytest.mark.asyncio
async def test_status_complete_by_brand(client: AsyncClient):
    """Brand can also complete an in_progress order."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    # Accept
    await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "accept"},
    )
    # Start
    await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "start"},
    )

    # Brand completes
    resp = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(brand_tokens["access_token"]),
        json={"action": "complete"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_status_cancel_by_brand(client: AsyncClient):
    """Brand can cancel a pending order."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    resp = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(brand_tokens["access_token"]),
        json={"action": "cancel"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "cancelled"


@pytest.mark.asyncio
async def test_status_cancel_creator_forbidden(client: AsyncClient):
    """Creator cannot cancel an order (only brand can)."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    resp = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "cancel"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_status_accept_by_brand_forbidden(client: AsyncClient):
    """Brand cannot accept an order (only creator can)."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    resp = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(brand_tokens["access_token"]),
        json={"action": "accept"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_status_invalid_transition(client: AsyncClient):
    """Cannot complete a pending order (must accept first)."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    # Try to complete directly from pending
    resp = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "complete"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_status_invalid_action(client: AsyncClient):
    """Invalid action name returns 422."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    order_id = create_resp.json()["id"]

    resp = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_tokens["access_token"]),
        json={"action": "invalid_action"},
    )
    assert resp.status_code == 422
