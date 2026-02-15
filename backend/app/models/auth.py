"""Authentication token model.

@TASK P0-T0.2 - DB 스키마 및 마이그레이션
@SPEC docs/planning/04-database-design.md#authtoken
"""
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import uuid


class AuthToken(Base):
    """Auth Token table - stores refresh tokens for user sessions."""
    __tablename__ = "auth_tokens"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    refresh_token: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="auth_tokens")

    __table_args__ = (
        Index("idx_auth_token_user_id", "user_id"),
    )
