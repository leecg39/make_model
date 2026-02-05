# @TASK P1-R1-T1 - Auth/Users API tests
# @SPEC docs/planning/02-trd.md#auth-api
"""Tests for authentication and user endpoints.

RED phase: these tests define the expected behaviour before implementation.
"""
import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

SIGNUP_URL = "/api/auth/signup"
LOGIN_URL = "/api/auth/login"
LOGOUT_URL = "/api/auth/logout"
REFRESH_URL = "/api/auth/refresh"
ME_URL = "/api/users/me"
SOCIAL_GOOGLE_URL = "/api/auth/social/google"
SOCIAL_KAKAO_URL = "/api/auth/social/kakao"
PASSWORD_CHANGE_URL = "/api/auth/password/change"


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


# ---------------------------------------------------------------------------
# 1. Signup tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_signup_brand_success(client: AsyncClient):
    """Brand user can register with company_name."""
    resp = await client.post(SIGNUP_URL, json=_brand_payload())
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "brand@example.com"
    assert data["role"] == "brand"
    assert data["company_name"] == "TestCorp"
    assert "id" in data


@pytest.mark.asyncio
async def test_signup_creator_success(client: AsyncClient):
    """Creator user can register without company_name."""
    resp = await client.post(SIGNUP_URL, json=_creator_payload())
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "creator@example.com"
    assert data["role"] == "creator"


@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient):
    """Duplicate email returns 400."""
    await client.post(SIGNUP_URL, json=_brand_payload())
    resp = await client.post(SIGNUP_URL, json=_brand_payload())
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_signup_password_too_short(client: AsyncClient):
    """Password shorter than 8 chars is rejected."""
    payload = _brand_payload()
    payload["password"] = "short"
    resp = await client.post(SIGNUP_URL, json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_signup_brand_without_company_name(client: AsyncClient):
    """Brand role without company_name is rejected."""
    payload = _brand_payload()
    del payload["company_name"]
    resp = await client.post(SIGNUP_URL, json=payload)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# 2. Login tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Valid credentials return access_token and refresh_token."""
    await client.post(SIGNUP_URL, json=_brand_payload())
    resp = await client.post(
        LOGIN_URL,
        json={"email": "brand@example.com", "password": "StrongPass1!"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    # Should also include user info
    assert "user" in data
    assert data["user"]["email"] == "brand@example.com"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    """Wrong password returns 401."""
    await client.post(SIGNUP_URL, json=_brand_payload())
    resp = await client.post(
        LOGIN_URL,
        json={"email": "brand@example.com", "password": "WrongPass!"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    """Nonexistent email returns 401."""
    resp = await client.post(
        LOGIN_URL,
        json={"email": "nobody@example.com", "password": "SomePass1!"},
    )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 3. Token refresh
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    """Valid refresh_token returns new access_token."""
    tokens = await _signup_and_login(client)
    resp = await client.post(
        REFRESH_URL,
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_refresh_token_invalid(client: AsyncClient):
    """Invalid refresh_token returns 401."""
    resp = await client.post(
        REFRESH_URL,
        json={"refresh_token": "invalid-token-value"},
    )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 4. Current user (GET /api/users/me)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient):
    """Authenticated user can fetch their profile."""
    tokens = await _signup_and_login(client)
    resp = await client.get(
        ME_URL,
        headers=_auth_header(tokens["access_token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "brand@example.com"
    assert data["role"] == "brand"
    assert data["company_name"] == "TestCorp"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    """Unauthenticated request returns 401."""
    resp = await client.get(ME_URL)
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 5. Update profile (PATCH /api/users/me)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_patch_me(client: AsyncClient):
    """Authenticated user can update nickname and company_name."""
    tokens = await _signup_and_login(client)
    resp = await client.patch(
        ME_URL,
        headers=_auth_header(tokens["access_token"]),
        json={"nickname": "UpdatedNick", "company_name": "NewCorp"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["nickname"] == "UpdatedNick"
    assert data["company_name"] == "NewCorp"


# ---------------------------------------------------------------------------
# 6. Logout
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_logout(client: AsyncClient):
    """Logout invalidates refresh token."""
    tokens = await _signup_and_login(client)
    resp = await client.post(
        LOGOUT_URL,
        headers=_auth_header(tokens["access_token"]),
    )
    assert resp.status_code == 200
    assert resp.json()["message"] == "Successfully logged out"


# ---------------------------------------------------------------------------
# 7. Password change (preserved from bootstrap)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_password_change(client: AsyncClient):
    """Authenticated user can change their password."""
    tokens = await _signup_and_login(client)
    resp = await client.post(
        PASSWORD_CHANGE_URL,
        headers=_auth_header(tokens["access_token"]),
        json={
            "current_password": "StrongPass1!",
            "new_password": "NewStrongPass1!",
        },
    )
    assert resp.status_code == 200

    # Old password should no longer work
    resp2 = await client.post(
        LOGIN_URL,
        json={"email": "brand@example.com", "password": "StrongPass1!"},
    )
    assert resp2.status_code == 401

    # New password should work
    resp3 = await client.post(
        LOGIN_URL,
        json={"email": "brand@example.com", "password": "NewStrongPass1!"},
    )
    assert resp3.status_code == 200


# ---------------------------------------------------------------------------
# 8. Social login stubs
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_social_google_stub(client: AsyncClient):
    """Google social login stub returns 501."""
    resp = await client.post(
        SOCIAL_GOOGLE_URL,
        json={"access_token": "google-token"},
    )
    assert resp.status_code == 501


@pytest.mark.asyncio
async def test_social_kakao_stub(client: AsyncClient):
    """Kakao social login stub returns 501."""
    resp = await client.post(
        SOCIAL_KAKAO_URL,
        json={"access_token": "kakao-token"},
    )
    assert resp.status_code == 501
