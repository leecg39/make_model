# @TASK P1-R1-T1 - Authentication endpoints (signup, login, refresh, social OAuth)
# @SPEC docs/planning/02-trd.md#auth-api
"""Authentication endpoints.

Routes:
    POST /api/auth/signup           - Register new user
    POST /api/auth/login            - Login with email + password (JSON body)
    POST /api/auth/logout           - Logout (revoke refresh tokens)
    POST /api/auth/refresh          - Refresh access token
    POST /api/auth/password/change  - Change password
    GET  /api/auth/google           - Redirect to Google OAuth
    GET  /api/auth/google/callback  - Google OAuth callback
    GET  /api/auth/kakao            - Redirect to Kakao OAuth
    GET  /api/auth/kakao/callback   - Kakao OAuth callback
"""
import logging
from typing import Annotated
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import CurrentUser
from app.core.security import verify_password
from app.db.session import get_db
from app.schemas.auth import (
    LoginRequest,
    PasswordChangeRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse
from app.services.auth import (
    authenticate_user,
    create_tokens,
    create_user,
    get_user_by_email,
    refresh_access_token,
    revoke_refresh_tokens,
    update_password,
)
from app.services.oauth import (
    find_or_create_social_user,
    get_google_authorize_url,
    get_google_user_info,
    get_kakao_authorize_url,
    get_kakao_user_info,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Signup
# ---------------------------------------------------------------------------


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    request: Request,
    user_in: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register a new user (brand or creator)."""
    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = await create_user(db, user_in)
    return user


# ---------------------------------------------------------------------------
# Login (JSON body)
# ---------------------------------------------------------------------------


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    login_data: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Login with email + password (JSON body). Returns token pair + user."""
    user = await authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token, refresh_token = await create_tokens(db, user)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------


@router.post("/logout")
async def logout(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Logout current user: revokes all refresh tokens."""
    await revoke_refresh_tokens(db, current_user.id)
    return {"message": "Successfully logged out"}


# ---------------------------------------------------------------------------
# Refresh
# ---------------------------------------------------------------------------


@router.post("/refresh")
async def refresh(
    request: Request,
    body: RefreshTokenRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Exchange a valid refresh token for a new access token."""
    result = await refresh_access_token(db, body.refresh_token)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    new_access_token, refresh_tok = result
    return {
        "access_token": new_access_token,
        "refresh_token": refresh_tok,
        "token_type": "bearer",
    }


# ---------------------------------------------------------------------------
# Password change (preserved from bootstrap)
# ---------------------------------------------------------------------------


@router.post("/password/change")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Change current user's password."""
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )
    await update_password(db, current_user, password_data.new_password)
    return {"message": "Password changed successfully"}


# ---------------------------------------------------------------------------
# Google OAuth
# ---------------------------------------------------------------------------


@router.get("/google")
async def google_login():
    """Redirect user to Google OAuth authorization page."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured",
        )
    return RedirectResponse(url=get_google_authorize_url())


@router.get("/google/callback")
async def google_callback(
    code: str = Query(None),
    error: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Handle Google OAuth callback."""
    frontend_login = f"{settings.FRONTEND_URL}/auth/login"

    if error or not code:
        return RedirectResponse(url=f"{frontend_login}?error=social_login_failed")

    user_info = await get_google_user_info(code)
    if not user_info or not user_info.get("email"):
        return RedirectResponse(url=f"{frontend_login}?error=social_login_failed")

    user = await find_or_create_social_user(
        db,
        provider=user_info["provider"],
        social_id=user_info["social_id"],
        email=user_info["email"],
        name=user_info["name"],
        profile_image=user_info.get("profile_image"),
    )

    access_token, refresh_token = await create_tokens(db, user)
    params = urlencode({"token": access_token, "refresh_token": refresh_token})
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?{params}")


# ---------------------------------------------------------------------------
# Kakao OAuth
# ---------------------------------------------------------------------------


@router.get("/kakao")
async def kakao_login():
    """Redirect user to Kakao OAuth authorization page."""
    if not settings.KAKAO_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Kakao OAuth is not configured",
        )
    return RedirectResponse(url=get_kakao_authorize_url())


@router.get("/kakao/callback")
async def kakao_callback(
    code: str = Query(None),
    error: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Handle Kakao OAuth callback."""
    frontend_login = f"{settings.FRONTEND_URL}/auth/login"

    if error or not code:
        return RedirectResponse(url=f"{frontend_login}?error=social_login_failed")

    user_info = await get_kakao_user_info(code)
    if not user_info:
        return RedirectResponse(url=f"{frontend_login}?error=social_login_failed")

    email = user_info.get("email")
    user = await find_or_create_social_user(
        db,
        provider=user_info["provider"],
        social_id=user_info["social_id"],
        email=email or "",
        name=user_info["name"],
        profile_image=user_info.get("profile_image"),
    )

    access_token, refresh_token = await create_tokens(db, user)
    params = urlencode({"token": access_token, "refresh_token": refresh_token})
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?{params}")
