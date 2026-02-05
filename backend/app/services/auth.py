# @TASK P1-R1-T1 - Authentication service (extended with refresh tokens)
# @SPEC docs/planning/02-trd.md#auth-api
"""Authentication service: user CRUD, token creation and refresh."""
import logging
from datetime import datetime, timedelta
from typing import Optional, Tuple

from jose import JWTError
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.auth import AuthToken
from app.models.user import User
from app.schemas.auth import RegisterRequest

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# User queries
# ---------------------------------------------------------------------------


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """Get user by primary key."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> Optional[User]:
    """Authenticate user with email and password."""
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# ---------------------------------------------------------------------------
# User creation
# ---------------------------------------------------------------------------


async def create_user(db: AsyncSession, user_in: RegisterRequest) -> User:
    """Create new user with role and optional company_name."""
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        nickname=user_in.nickname,
        role=user_in.role,
        company_name=user_in.company_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Token management
# ---------------------------------------------------------------------------


async def create_tokens(
    db: AsyncSession, user: User
) -> Tuple[str, str]:
    """Create access + refresh token pair. Persist refresh token in DB.

    Returns:
        (access_token, refresh_token)
    """
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    # Store refresh token in the database
    expires_at = datetime.utcnow() + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS,
    )
    auth_token = AuthToken(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=expires_at,
    )
    db.add(auth_token)
    await db.commit()

    return access_token, refresh_token


async def refresh_access_token(
    db: AsyncSession, refresh_token: str
) -> Optional[Tuple[str, str]]:
    """Validate refresh_token and issue a new access_token.

    Returns:
        (new_access_token, same_refresh_token) or None if invalid.
    """
    # Decode JWT first
    try:
        payload = decode_token(refresh_token)
    except JWTError:
        return None

    if payload.get("type") != "refresh":
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    # Verify token exists in DB (not revoked)
    result = await db.execute(
        select(AuthToken).where(
            AuthToken.refresh_token == refresh_token,
            AuthToken.user_id == user_id,
        )
    )
    stored_token = result.scalar_one_or_none()
    if not stored_token:
        return None

    # Check expiry
    if stored_token.expires_at < datetime.utcnow():
        # Clean up expired token
        await db.delete(stored_token)
        await db.commit()
        return None

    # Issue new access token
    new_access_token = create_access_token(subject=user_id)
    return new_access_token, refresh_token


async def revoke_refresh_tokens(db: AsyncSession, user_id: str) -> None:
    """Revoke all refresh tokens for a user (used on logout)."""
    await db.execute(
        delete(AuthToken).where(AuthToken.user_id == user_id)
    )
    await db.commit()


# ---------------------------------------------------------------------------
# Password update
# ---------------------------------------------------------------------------


async def update_password(
    db: AsyncSession, user: User, new_password: str
) -> User:
    """Update user password."""
    user.hashed_password = get_password_hash(new_password)
    await db.commit()
    await db.refresh(user)
    return user
