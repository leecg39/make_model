# @TASK P1-R1-T1 - Authentication endpoints (signup, login JSON, refresh, social stubs)
# @SPEC docs/planning/02-trd.md#auth-api
"""Authentication endpoints.

Routes:
    POST /api/auth/signup      - Register new user
    POST /api/auth/login       - Login with email + password (JSON body)
    POST /api/auth/logout      - Logout (revoke refresh tokens)
    POST /api/auth/refresh     - Refresh access token
    POST /api/auth/password/change - Change password
    POST /api/auth/social/google   - Google social login (stub)
    POST /api/auth/social/kakao    - Kakao social login (stub)
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.core.security import verify_password
from app.db.session import get_db
from app.schemas.auth import (
    LoginRequest,
    PasswordChangeRequest,
    RefreshTokenRequest,
    RegisterRequest,
    SocialLoginRequest,
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

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Signup
# ---------------------------------------------------------------------------


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(
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
# Social login stubs
# ---------------------------------------------------------------------------


@router.post("/social/google", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def social_google(body: SocialLoginRequest):
    """Google social login (not yet implemented)."""
    return {"detail": "Google social login is not yet implemented"}


@router.post("/social/kakao", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def social_kakao(body: SocialLoginRequest):
    """Kakao social login (not yet implemented)."""
    return {"detail": "Kakao social login is not yet implemented"}
