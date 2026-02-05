"""User model for authentication and user management.

@TASK P0-T0.2 - DB 스키마 및 마이그레이션
@SPEC docs/planning/04-database-design.md#user-사용자---feat-0
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import uuid


class User(Base):
    """User table - stores user accounts (brand, creator, admin)."""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default="creator"  # brand, creator, admin
    )
    profile_image: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    company_name: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True
    )

    # Relationships
    auth_tokens = relationship("AuthToken", back_populates="user", cascade="all, delete-orphan")
    ai_models = relationship("AIModel", back_populates="creator", cascade="all, delete-orphan")
    orders_as_brand = relationship(
        "Order",
        foreign_keys="Order.brand_id",
        back_populates="brand_user",
        cascade="all, delete-orphan"
    )
    orders_as_creator = relationship(
        "Order",
        foreign_keys="Order.creator_id",
        back_populates="creator_user",
        cascade="all, delete-orphan"
    )
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="sender", cascade="all, delete-orphan")
    settlements = relationship("Settlement", back_populates="creator", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_user_email", "email"),
        Index("idx_user_role", "role"),
    )
