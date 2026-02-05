# @TASK P2-R3-T1 - Platform Stats API tests
# @SPEC docs/planning/02-trd.md#platform-stats-api
"""Tests for platform statistics endpoint.

RED phase: these tests define the expected behaviour before implementation.

Endpoint:
    GET /api/stats - Public platform statistics (no auth required)

Response:
    {
        "total_models": int,    # AIModel where status="active"
        "total_bookings": int,  # Order where status="completed"
        "total_brands": int,    # User where role="brand" and is_active=True
    }
"""
import uuid

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_model import AIModel
from app.models.order import Order
from app.models.user import User
from app.core.security import get_password_hash


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

STATS_URL = "/api/stats"
SIGNUP_URL = "/api/auth/signup"
LOGIN_URL = "/api/auth/login"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _create_user(
    db_session: AsyncSession,
    *,
    email: str,
    role: str = "creator",
    is_active: bool = True,
) -> User:
    """Create a user directly in the database."""
    user = User(
        id=str(uuid.uuid4()),
        email=email,
        password_hash=get_password_hash("StrongPass1!"),
        nickname=f"User_{role}",
        role=role,
        is_active=is_active,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


async def _create_ai_model(
    db_session: AsyncSession,
    creator_id: str,
    *,
    status: str = "active",
) -> AIModel:
    """Create an AIModel directly in the database."""
    model = AIModel(
        id=str(uuid.uuid4()),
        creator_id=creator_id,
        name="TestModel",
        description="A test AI model",
        style="casual",
        gender="female",
        age_range="20s",
        status=status,
    )
    db_session.add(model)
    await db_session.commit()
    await db_session.refresh(model)
    return model


async def _create_order(
    db_session: AsyncSession,
    brand_id: str,
    creator_id: str,
    model_id: str,
    *,
    status: str = "completed",
) -> Order:
    """Create an Order directly in the database."""
    order = Order(
        id=str(uuid.uuid4()),
        brand_id=brand_id,
        creator_id=creator_id,
        model_id=model_id,
        order_number=f"ORD-{uuid.uuid4().hex[:8].upper()}",
        concept_description="Test order concept",
        package_type="basic",
        image_count=5,
        is_exclusive=False,
        total_price=100000,
        status=status,
    )
    db_session.add(order)
    await db_session.commit()
    await db_session.refresh(order)
    return order


# ---------------------------------------------------------------------------
# 1. GET /api/stats - Empty state (all zeros)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_stats_empty_returns_zeros(client: AsyncClient):
    """When no relevant data exists, all stats should be zero."""
    resp = await client.get(STATS_URL)
    assert resp.status_code == 200

    data = resp.json()
    assert data["total_models"] == 0
    assert data["total_bookings"] == 0
    assert data["total_brands"] == 0


# ---------------------------------------------------------------------------
# 2. GET /api/stats - No auth required (public endpoint)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_stats_no_auth_required(client: AsyncClient):
    """Stats endpoint is publicly accessible without authentication."""
    resp = await client.get(STATS_URL)
    assert resp.status_code == 200
    assert "total_models" in resp.json()
    assert "total_bookings" in resp.json()
    assert "total_brands" in resp.json()


# ---------------------------------------------------------------------------
# 3. GET /api/stats - With data
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_stats_counts_active_models_only(
    client: AsyncClient,
    db_session: AsyncSession,
):
    """total_models counts only AIModel with status='active'."""
    creator = await _create_user(db_session, email="creator@example.com", role="creator")

    # Create 2 active models and 1 draft model
    await _create_ai_model(db_session, creator.id, status="active")
    await _create_ai_model(db_session, creator.id, status="active")
    await _create_ai_model(db_session, creator.id, status="draft")

    resp = await client.get(STATS_URL)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_models"] == 2


@pytest.mark.asyncio
async def test_stats_counts_completed_orders_only(
    client: AsyncClient,
    db_session: AsyncSession,
):
    """total_bookings counts only Order with status='completed'."""
    brand = await _create_user(db_session, email="brand@example.com", role="brand")
    creator = await _create_user(db_session, email="creator@example.com", role="creator")
    model = await _create_ai_model(db_session, creator.id, status="active")

    # Create 2 completed orders, 1 pending, 1 cancelled
    await _create_order(db_session, brand.id, creator.id, model.id, status="completed")
    await _create_order(db_session, brand.id, creator.id, model.id, status="completed")
    await _create_order(db_session, brand.id, creator.id, model.id, status="pending")
    await _create_order(db_session, brand.id, creator.id, model.id, status="cancelled")

    resp = await client.get(STATS_URL)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_bookings"] == 2


@pytest.mark.asyncio
async def test_stats_counts_active_brands_only(
    client: AsyncClient,
    db_session: AsyncSession,
):
    """total_brands counts only User with role='brand' and is_active=True."""
    # Create 2 active brands, 1 inactive brand, 1 active creator
    await _create_user(db_session, email="brand1@example.com", role="brand", is_active=True)
    await _create_user(db_session, email="brand2@example.com", role="brand", is_active=True)
    await _create_user(db_session, email="brand3@example.com", role="brand", is_active=False)
    await _create_user(db_session, email="creator@example.com", role="creator", is_active=True)

    resp = await client.get(STATS_URL)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_brands"] == 2


# ---------------------------------------------------------------------------
# 4. GET /api/stats - Combined scenario
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_stats_combined_all_counts(
    client: AsyncClient,
    db_session: AsyncSession,
):
    """All three stats are returned correctly when data exists."""
    # Create 2 active brands + 1 creator
    brand1 = await _create_user(db_session, email="brand1@example.com", role="brand", is_active=True)
    brand2 = await _create_user(db_session, email="brand2@example.com", role="brand", is_active=True)
    creator = await _create_user(db_session, email="creator@example.com", role="creator", is_active=True)

    # Create 3 active models + 1 inactive
    model1 = await _create_ai_model(db_session, creator.id, status="active")
    model2 = await _create_ai_model(db_session, creator.id, status="active")
    model3 = await _create_ai_model(db_session, creator.id, status="active")
    await _create_ai_model(db_session, creator.id, status="inactive")

    # Create 1 completed order
    await _create_order(db_session, brand1.id, creator.id, model1.id, status="completed")

    resp = await client.get(STATS_URL)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_models"] == 3
    assert data["total_bookings"] == 1
    assert data["total_brands"] == 2


# ---------------------------------------------------------------------------
# 5. GET /api/stats - Response schema validation
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_stats_response_has_correct_fields(client: AsyncClient):
    """Response contains exactly the expected fields."""
    resp = await client.get(STATS_URL)
    assert resp.status_code == 200
    data = resp.json()

    expected_keys = {"total_models", "total_bookings", "total_brands"}
    assert set(data.keys()) == expected_keys

    # All values should be non-negative integers
    for key in expected_keys:
        assert isinstance(data[key], int)
        assert data[key] >= 0
