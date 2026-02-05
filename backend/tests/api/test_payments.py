# @TASK P3-R3-T1 - Payments API tests
# @SPEC specs/domain/resources.yaml#payments
"""Tests for Payments API endpoints.

Covers:
    - Payment creation (brand only, accepted order)
    - Payment creation edge cases (auth, role, status, duplicate)
    - Payment retrieval (brand/creator, forbidden for others)
    - Webhook processing (completed, failed)
"""
import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# URLs
# ---------------------------------------------------------------------------

SIGNUP_URL = "/api/auth/signup"
LOGIN_URL = "/api/auth/login"
ORDERS_URL = "/api/orders"
PAYMENTS_URL = "/api/payments"


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


async def _create_order_and_accept(
    client: AsyncClient,
    brand_token: str,
    creator_token: str,
    model_id: str,
    creator_id: str,
) -> str:
    """Create an order as brand, accept it as creator, return order_id."""
    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_token),
        json=payload,
    )
    assert create_resp.status_code == 201
    order_id = create_resp.json()["id"]

    # Creator accepts the order -> status: accepted
    accept_resp = await client.patch(
        f"{ORDERS_URL}/{order_id}/status",
        headers=_auth_header(creator_token),
        json={"action": "accept"},
    )
    assert accept_resp.status_code == 200
    assert accept_resp.json()["status"] == "accepted"

    return order_id


# ---------------------------------------------------------------------------
# 1. Payment creation - success
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_payment_success(client: AsyncClient):
    """Brand can create a payment for an accepted order."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    order_id = await _create_order_and_accept(
        client,
        brand_tokens["access_token"],
        creator_tokens["access_token"],
        model_id,
        creator_id,
    )

    resp = await client.post(
        PAYMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json={
            "order_id": order_id,
            "payment_method": "card",
            "amount": 500000,
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["order_id"] == order_id
    assert data["payment_method"] == "card"
    assert data["amount"] == 500000
    assert data["status"] == "pending"
    assert data["payment_provider"] == "portone"
    assert data["transaction_id"] is not None  # auto-generated
    assert "id" in data
    assert "created_at" in data


# ---------------------------------------------------------------------------
# 2. Payment creation - unauthenticated (401)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_payment_unauthenticated(client: AsyncClient):
    """Unauthenticated request returns 401."""
    resp = await client.post(
        PAYMENTS_URL,
        json={
            "order_id": "fake-id",
            "payment_method": "card",
            "amount": 100000,
        },
    )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 3. Payment creation - creator forbidden (403)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_payment_creator_forbidden(client: AsyncClient):
    """Creator cannot create payments (only brand can)."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    order_id = await _create_order_and_accept(
        client,
        brand_tokens["access_token"],
        creator_tokens["access_token"],
        model_id,
        creator_id,
    )

    resp = await client.post(
        PAYMENTS_URL,
        headers=_auth_header(creator_tokens["access_token"]),
        json={
            "order_id": order_id,
            "payment_method": "card",
            "amount": 500000,
        },
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 4. Payment creation - order not found (404)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_payment_order_not_found(client: AsyncClient):
    """Payment for non-existent order returns 404."""
    brand_tokens, _, _ = await _setup_brand_creator_model(client)

    resp = await client.post(
        PAYMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json={
            "order_id": "nonexistent-order-id",
            "payment_method": "card",
            "amount": 100000,
        },
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# 5. Payment creation - order status not accepted (400)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_payment_order_not_accepted(client: AsyncClient):
    """Payment for order not in 'accepted' status returns 400."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    # Create order but do NOT accept it (status remains pending)
    payload = _order_payload(model_id, creator_id)
    create_resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payload,
    )
    assert create_resp.status_code == 201
    order_id = create_resp.json()["id"]

    resp = await client.post(
        PAYMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json={
            "order_id": order_id,
            "payment_method": "card",
            "amount": 500000,
        },
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# 6. Payment creation - duplicate payment (409)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_payment_duplicate(client: AsyncClient):
    """Duplicate payment for the same order returns 409."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    order_id = await _create_order_and_accept(
        client,
        brand_tokens["access_token"],
        creator_tokens["access_token"],
        model_id,
        creator_id,
    )

    payment_data = {
        "order_id": order_id,
        "payment_method": "card",
        "amount": 500000,
    }

    # First payment - success
    resp1 = await client.post(
        PAYMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payment_data,
    )
    assert resp1.status_code == 201

    # Second payment - conflict
    resp2 = await client.post(
        PAYMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=payment_data,
    )
    assert resp2.status_code == 409


# ---------------------------------------------------------------------------
# 7. Payment creation - invalid payment_method (422)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_payment_invalid_method(client: AsyncClient):
    """Invalid payment_method returns 422."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    order_id = await _create_order_and_accept(
        client,
        brand_tokens["access_token"],
        creator_tokens["access_token"],
        model_id,
        creator_id,
    )

    resp = await client.post(
        PAYMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json={
            "order_id": order_id,
            "payment_method": "bitcoin",
            "amount": 500000,
        },
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# 8. Payment retrieval - brand success
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_payment_brand_success(client: AsyncClient):
    """Brand can retrieve payment info for their order."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    order_id = await _create_order_and_accept(
        client,
        brand_tokens["access_token"],
        creator_tokens["access_token"],
        model_id,
        creator_id,
    )

    # Create payment
    await client.post(
        PAYMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json={
            "order_id": order_id,
            "payment_method": "card",
            "amount": 500000,
        },
    )

    # Get payment by order_id
    resp = await client.get(
        f"{PAYMENTS_URL}/{order_id}",
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["order_id"] == order_id
    assert data["amount"] == 500000
    assert data["payment_method"] == "card"


# ---------------------------------------------------------------------------
# 9. Payment retrieval - creator success
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_payment_creator_success(client: AsyncClient):
    """Creator can retrieve payment info for their assigned order."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    order_id = await _create_order_and_accept(
        client,
        brand_tokens["access_token"],
        creator_tokens["access_token"],
        model_id,
        creator_id,
    )

    # Create payment (brand)
    await client.post(
        PAYMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json={
            "order_id": order_id,
            "payment_method": "transfer",
            "amount": 500000,
        },
    )

    # Creator gets payment
    resp = await client.get(
        f"{PAYMENTS_URL}/{order_id}",
        headers=_auth_header(creator_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["order_id"] == order_id
    assert data["payment_method"] == "transfer"


# ---------------------------------------------------------------------------
# 10. Payment retrieval - other user forbidden (403)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_payment_other_user_forbidden(client: AsyncClient):
    """User not related to the order gets 403."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    order_id = await _create_order_and_accept(
        client,
        brand_tokens["access_token"],
        creator_tokens["access_token"],
        model_id,
        creator_id,
    )

    # Create payment
    await client.post(
        PAYMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json={
            "order_id": order_id,
            "payment_method": "card",
            "amount": 500000,
        },
    )

    # Another brand tries to see the payment
    brand2_tokens = await _signup_and_login(
        client, _brand_payload(email="brand2@example.com")
    )
    resp = await client.get(
        f"{PAYMENTS_URL}/{order_id}",
        headers=_auth_header(brand2_tokens["access_token"]),
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 11. Webhook - payment completed
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_webhook_payment_completed(client: AsyncClient):
    """Webhook marks payment as completed and sets paid_at."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    order_id = await _create_order_and_accept(
        client,
        brand_tokens["access_token"],
        creator_tokens["access_token"],
        model_id,
        creator_id,
    )

    # Create payment
    create_resp = await client.post(
        PAYMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json={
            "order_id": order_id,
            "payment_method": "card",
            "amount": 500000,
        },
    )
    assert create_resp.status_code == 201
    transaction_id = create_resp.json()["transaction_id"]

    # Send webhook (no auth required)
    webhook_resp = await client.post(
        f"{PAYMENTS_URL}/webhook",
        json={
            "imp_uid": transaction_id,
            "merchant_uid": order_id,
            "status": "paid",
            "amount": 500000,
        },
    )
    assert webhook_resp.status_code == 200
    data = webhook_resp.json()
    assert data["status"] == "completed"
    assert data["paid_at"] is not None

    # Verify payment state via GET
    get_resp = await client.get(
        f"{PAYMENTS_URL}/{order_id}",
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["status"] == "completed"
    assert get_resp.json()["paid_at"] is not None


# ---------------------------------------------------------------------------
# 12. Webhook - payment failed
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_webhook_payment_failed(client: AsyncClient):
    """Webhook marks payment as failed."""
    brand_tokens, creator_tokens, model_id = await _setup_brand_creator_model(client)
    creator_id = creator_tokens["user"]["id"]

    order_id = await _create_order_and_accept(
        client,
        brand_tokens["access_token"],
        creator_tokens["access_token"],
        model_id,
        creator_id,
    )

    # Create payment
    create_resp = await client.post(
        PAYMENTS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json={
            "order_id": order_id,
            "payment_method": "card",
            "amount": 500000,
        },
    )
    assert create_resp.status_code == 201
    transaction_id = create_resp.json()["transaction_id"]

    # Send webhook with failed status
    webhook_resp = await client.post(
        f"{PAYMENTS_URL}/webhook",
        json={
            "imp_uid": transaction_id,
            "merchant_uid": order_id,
            "status": "failed",
            "amount": 500000,
        },
    )
    assert webhook_resp.status_code == 200
    data = webhook_resp.json()
    assert data["status"] == "failed"
    assert data["paid_at"] is None

    # Verify payment state via GET
    get_resp = await client.get(
        f"{PAYMENTS_URL}/{order_id}",
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["status"] == "failed"
