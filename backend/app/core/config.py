# @TASK P0-T0.3 - 공통 설정 (환경변수 관리)
# @SPEC docs/planning/02-trd.md#설정-관리
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/make_model"
    )

    # Authentication
    SECRET_KEY: str = "changeme"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Application
    DEBUG: bool = True
    APP_NAME: str = "Make Model API"
    API_V1_PREFIX: str = "/api"

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent.parent.parent / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
