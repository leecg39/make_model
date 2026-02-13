"""OAuth service for Google and Kakao social login.

Handles:
- OAuth authorize URL generation
- Authorization code → access token exchange
- User info retrieval from OAuth providers
- Social user find-or-create in database
"""
import logging
from typing import Optional
from urllib.parse import urlencode

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Google OAuth
# ---------------------------------------------------------------------------

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


def get_google_authorize_url() -> str:
    """Build Google OAuth2 authorization URL."""
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


async def get_google_user_info(code: str) -> Optional[dict]:
    """Exchange authorization code for tokens, then fetch user info."""
    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            logger.error("Google token exchange failed: %s", token_resp.text)
            return None

        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            return None

        # Fetch user info
        userinfo_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo_resp.status_code != 200:
            logger.error("Google userinfo failed: %s", userinfo_resp.text)
            return None

        data = userinfo_resp.json()
        return {
            "provider": "google",
            "social_id": data.get("id"),
            "email": data.get("email"),
            "name": data.get("name", ""),
            "profile_image": data.get("picture"),
        }


# ---------------------------------------------------------------------------
# Kakao OAuth
# ---------------------------------------------------------------------------

KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize"
KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_USERINFO_URL = "https://kapi.kakao.com/v2/user/me"


def get_kakao_authorize_url() -> str:
    """Build Kakao OAuth2 authorization URL."""
    params = {
        "client_id": settings.KAKAO_CLIENT_ID,
        "redirect_uri": settings.KAKAO_REDIRECT_URI,
        "response_type": "code",
    }
    return f"{KAKAO_AUTH_URL}?{urlencode(params)}"


async def get_kakao_user_info(code: str) -> Optional[dict]:
    """Exchange authorization code for tokens, then fetch user info."""
    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_resp = await client.post(
            KAKAO_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "client_id": settings.KAKAO_CLIENT_ID,
                "client_secret": settings.KAKAO_CLIENT_SECRET,
                "redirect_uri": settings.KAKAO_REDIRECT_URI,
                "code": code,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if token_resp.status_code != 200:
            logger.error("Kakao token exchange failed: %s", token_resp.text)
            return None

        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            return None

        # Fetch user info
        userinfo_resp = await client.get(
            KAKAO_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo_resp.status_code != 200:
            logger.error("Kakao userinfo failed: %s", userinfo_resp.text)
            return None

        data = userinfo_resp.json()
        kakao_account = data.get("kakao_account", {})
        profile = kakao_account.get("profile", {})

        return {
            "provider": "kakao",
            "social_id": str(data.get("id")),
            "email": kakao_account.get("email"),
            "name": profile.get("nickname", ""),
            "profile_image": profile.get("profile_image_url"),
        }


# ---------------------------------------------------------------------------
# Social user find-or-create
# ---------------------------------------------------------------------------


async def find_or_create_social_user(
    db: AsyncSession,
    provider: str,
    social_id: str,
    email: str,
    name: str,
    profile_image: Optional[str] = None,
) -> User:
    """Find existing social user or create a new one.

    Lookup priority:
    1. Match by social_provider + social_id
    2. Match by email (link existing account)
    3. Create new user
    """
    # 1. Find by social provider + id
    result = await db.execute(
        select(User).where(
            User.social_provider == provider,
            User.social_id == social_id,
        )
    )
    user = result.scalar_one_or_none()
    if user:
        return user

    # 2. Find by email (link social login to existing account)
    if email:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            user.social_provider = provider
            user.social_id = social_id
            if profile_image and not user.profile_image:
                user.profile_image = profile_image
            await db.commit()
            await db.refresh(user)
            return user

    # 3. Create new user
    user = User(
        email=email or f"{provider}_{social_id}@social.makemodel.app",
        nickname=name or f"{provider}_user",
        role="brand",  # Default role for social signups
        social_provider=provider,
        social_id=social_id,
        profile_image=profile_image,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
