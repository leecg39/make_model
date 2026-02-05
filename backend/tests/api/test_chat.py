# @TASK P4-R2-T1 - Chat Messages API tests
# @SPEC specs/domain/resources.yaml#chat_messages
"""Tests for Chat Messages API endpoints.

Covers:
    1.  Send message (brand)
    2.  Send message (creator)
    3.  Send message forbidden for non-party user (403)
    4.  Send message unauthenticated (401)
    5.  List messages (brand)
    6.  List messages (creator)
    7.  List messages forbidden for non-party user (403)
    8.  Empty message list
    9.  Message list pagination
    10. Message with attachment
    11. Mark messages as read
    12. Order not found (404)
"""
import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# URLs
# ---------------------------------------------------------------------------

SIGNUP_URL = "/api/auth/signup"
LOGIN_URL = "/api/auth/login"
ORDERS_URL = "/api/orders"


def _messages_url(order_id: str) -> str:
    return f"/api/orders/{order_id}/messages"


def _read_url(order_id: str) -> str:
    return f"/api/orders/{order_id}/messages/read"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _brand_payload(email: str = "chatbrand@example.com") -> dict:
    return {
        "email": email,
        "password": "StrongPass1!",
        "nickname": "ChatBrand",
        "role": "brand",
        "company_name": "ChatCorp",
    }


def _creator_payload(email: str = "chatcreator@example.com") -> dict:
    return {
        "email": email,
        "password": "StrongPass1!",
        "nickname": "ChatCreator",
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
            "name": "ChatTestModel",
            "description": "A chat test AI model",
            "style": "casual",
            "gender": "female",
            "age_range": "20s",
            "tags": ["fashion"],
        },
    )
    assert resp.status_code == 201
    return resp.json()["id"]


async def _setup_order(client: AsyncClient):
    """Set up brand + creator + model + order.

    Returns (brand_tokens, creator_tokens, order_id).
    """
    creator_tokens = await _signup_and_login(client, _creator_payload())
    brand_tokens = await _signup_and_login(client, _brand_payload())
    model_id = await _create_model(client, creator_tokens["access_token"])
    creator_id = creator_tokens["user"]["id"]

    # Create order
    order_payload = {
        "model_id": model_id,
        "creator_id": creator_id,
        "concept_description": "Chat test campaign",
        "package_type": "standard",
        "image_count": 5,
        "is_exclusive": False,
        "total_price": 300000,
    }
    resp = await client.post(
        ORDERS_URL,
        headers=_auth_header(brand_tokens["access_token"]),
        json=order_payload,
    )
    assert resp.status_code == 201
    order_id = resp.json()["id"]

    return brand_tokens, creator_tokens, order_id


# ---------------------------------------------------------------------------
# 1. Send message (brand)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_send_message_brand(client: AsyncClient):
    """Brand can send a chat message on their order."""
    brand_tokens, _, order_id = await _setup_order(client)

    resp = await client.post(
        _messages_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
        json={"message": "Hello from brand!"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["message"] == "Hello from brand!"
    assert data["order_id"] == order_id
    assert data["sender_id"] == brand_tokens["user"]["id"]
    assert data["is_read"] is False
    assert data["attachment_url"] is None
    assert "id" in data
    assert "created_at" in data
    # Sender info embedded
    assert data["sender"]["id"] == brand_tokens["user"]["id"]
    assert data["sender"]["nickname"] == "ChatBrand"
    assert data["sender"]["role"] == "brand"


# ---------------------------------------------------------------------------
# 2. Send message (creator)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_send_message_creator(client: AsyncClient):
    """Creator can send a chat message on their order."""
    _, creator_tokens, order_id = await _setup_order(client)

    resp = await client.post(
        _messages_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
        json={"message": "Hello from creator!"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["message"] == "Hello from creator!"
    assert data["sender_id"] == creator_tokens["user"]["id"]
    assert data["sender"]["role"] == "creator"


# ---------------------------------------------------------------------------
# 3. Send message forbidden for non-party user (403)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_send_message_forbidden(client: AsyncClient):
    """User who is not party to the order cannot send messages."""
    _, _, order_id = await _setup_order(client)

    # Create a third user
    outsider_tokens = await _signup_and_login(
        client, _brand_payload(email="outsider@example.com")
    )

    resp = await client.post(
        _messages_url(order_id),
        headers=_auth_header(outsider_tokens["access_token"]),
        json={"message": "I should not be here"},
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 4. Send message unauthenticated (401)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_send_message_unauthenticated(client: AsyncClient):
    """Unauthenticated request returns 401."""
    _, _, order_id = await _setup_order(client)

    resp = await client.post(
        _messages_url(order_id),
        json={"message": "No auth"},
    )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 5. List messages (brand)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_messages_brand(client: AsyncClient):
    """Brand can list chat messages for their order."""
    brand_tokens, creator_tokens, order_id = await _setup_order(client)

    # Send a couple of messages
    await client.post(
        _messages_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
        json={"message": "Brand msg 1"},
    )
    await client.post(
        _messages_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
        json={"message": "Creator msg 1"},
    )

    resp = await client.get(
        _messages_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    assert data["page"] == 1
    assert data["limit"] == 20
    # Messages ordered by created_at ascending
    assert data["items"][0]["message"] == "Brand msg 1"
    assert data["items"][1]["message"] == "Creator msg 1"


# ---------------------------------------------------------------------------
# 6. List messages (creator)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_messages_creator(client: AsyncClient):
    """Creator can list chat messages for their order."""
    brand_tokens, creator_tokens, order_id = await _setup_order(client)

    await client.post(
        _messages_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
        json={"message": "Hello creator"},
    )

    resp = await client.get(
        _messages_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["message"] == "Hello creator"


# ---------------------------------------------------------------------------
# 7. List messages forbidden for non-party user (403)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_messages_forbidden(client: AsyncClient):
    """User who is not party to the order cannot list messages."""
    _, _, order_id = await _setup_order(client)

    outsider_tokens = await _signup_and_login(
        client, _creator_payload(email="outsider_creator@example.com")
    )

    resp = await client.get(
        _messages_url(order_id),
        headers=_auth_header(outsider_tokens["access_token"]),
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 8. Empty message list
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_empty_message_list(client: AsyncClient):
    """Order with no messages returns empty list."""
    brand_tokens, _, order_id = await _setup_order(client)

    resp = await client.get(
        _messages_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


# ---------------------------------------------------------------------------
# 9. Message list pagination
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_message_pagination(client: AsyncClient):
    """Messages can be paginated."""
    brand_tokens, _, order_id = await _setup_order(client)

    # Send 5 messages
    for i in range(5):
        await client.post(
            _messages_url(order_id),
            headers=_auth_header(brand_tokens["access_token"]),
            json={"message": f"Message {i + 1}"},
        )

    # Page 1, limit 2
    resp = await client.get(
        _messages_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
        params={"page": 1, "limit": 2},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["page"] == 1
    assert data["limit"] == 2
    assert data["items"][0]["message"] == "Message 1"
    assert data["items"][1]["message"] == "Message 2"

    # Page 3, limit 2 (should get 1 item)
    resp = await client.get(
        _messages_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
        params={"page": 3, "limit": 2},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 5
    assert len(data["items"]) == 1
    assert data["items"][0]["message"] == "Message 5"


# ---------------------------------------------------------------------------
# 10. Message with attachment
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_send_message_with_attachment(client: AsyncClient):
    """Message can include an attachment URL."""
    brand_tokens, _, order_id = await _setup_order(client)

    resp = await client.post(
        _messages_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
        json={
            "message": "Here is the file",
            "attachment_url": "https://storage.example.com/files/design.png",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["message"] == "Here is the file"
    assert data["attachment_url"] == "https://storage.example.com/files/design.png"


# ---------------------------------------------------------------------------
# 11. Mark messages as read
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_mark_messages_as_read(client: AsyncClient):
    """Brand marks creator's messages as read."""
    brand_tokens, creator_tokens, order_id = await _setup_order(client)

    # Creator sends 2 messages
    await client.post(
        _messages_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
        json={"message": "Creator msg 1"},
    )
    await client.post(
        _messages_url(order_id),
        headers=_auth_header(creator_tokens["access_token"]),
        json={"message": "Creator msg 2"},
    )

    # Brand sends 1 message (should NOT be affected by brand's read)
    await client.post(
        _messages_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
        json={"message": "Brand msg 1"},
    )

    # Brand marks as read - should mark creator's 2 msgs only
    resp = await client.patch(
        _read_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["marked_as_read"] == 2

    # Verify: list messages and check is_read
    resp = await client.get(
        _messages_url(order_id),
        headers=_auth_header(brand_tokens["access_token"]),
    )
    items = resp.json()["items"]
    # Creator's messages should be read
    creator_msgs = [m for m in items if m["sender_id"] == creator_tokens["user"]["id"]]
    brand_msgs = [m for m in items if m["sender_id"] == brand_tokens["user"]["id"]]
    assert all(m["is_read"] is True for m in creator_msgs)
    # Brand's own message is_read is still False (unaffected)
    assert all(m["is_read"] is False for m in brand_msgs)


# ---------------------------------------------------------------------------
# 12. Order not found (404)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_send_message_order_not_found(client: AsyncClient):
    """Sending a message on a non-existent order returns 404."""
    brand_tokens = await _signup_and_login(client, _brand_payload())

    resp = await client.post(
        _messages_url("nonexistent-order-id"),
        headers=_auth_header(brand_tokens["access_token"]),
        json={"message": "Hello?"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_messages_order_not_found(client: AsyncClient):
    """Listing messages on a non-existent order returns 404."""
    brand_tokens = await _signup_and_login(client, _brand_payload())

    resp = await client.get(
        _messages_url("nonexistent-order-id"),
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_mark_read_order_not_found(client: AsyncClient):
    """Marking read on a non-existent order returns 404."""
    brand_tokens = await _signup_and_login(client, _brand_payload())

    resp = await client.patch(
        _read_url("nonexistent-order-id"),
        headers=_auth_header(brand_tokens["access_token"]),
    )
    assert resp.status_code == 404
