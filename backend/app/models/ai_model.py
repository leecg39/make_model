"""AI Model and related models for AI influencer portfolio.

@TASK P0-T0.2 - DB 스키마 및 마이그레이션
@SPEC docs/planning/04-database-design.md#aimodel-ai-모델---feat-1
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, DateTime, Boolean, Index, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import uuid


class AIModel(Base):
    """AI Model table - stores AI influencer portfolios created by creators."""
    __tablename__ = "ai_models"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    creator_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    style: Mapped[str] = mapped_column(
        String(50), nullable=False  # casual, formal, sporty, vintage
    )
    gender: Mapped[str] = mapped_column(
        String(20), nullable=False  # male, female, neutral
    )
    age_range: Mapped[str] = mapped_column(
        String(10), nullable=False  # 10s, 20s, 30s, 40s+
    )
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=0.0)  # 1.0-5.0
    status: Mapped[str] = mapped_column(
        String(20), default="draft", nullable=False  # draft, active, inactive
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    creator = relationship("User", back_populates="ai_models")
    images = relationship("ModelImage", back_populates="model", cascade="all, delete-orphan")
    tags = relationship("ModelTag", back_populates="model", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="model", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="model", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_model_creator_id", "creator_id"),
        Index("idx_model_status", "status"),
        Index("idx_model_style", "style"),
        Index("idx_model_rating", "rating"),
        Index("idx_model_created_at", "created_at"),
    )


class ModelImage(Base):
    """Model Image table - portfolio images for AI models."""
    __tablename__ = "model_images"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("ai_models.id", ondelete="CASCADE"), nullable=False
    )
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)
    is_thumbnail: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    model = relationship("AIModel", back_populates="images")


class ModelTag(Base):
    """Model Tag table - tags for categorizing AI models."""
    __tablename__ = "model_tags"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("ai_models.id", ondelete="CASCADE"), nullable=False
    )
    tag: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    model = relationship("AIModel", back_populates="tags")


class Favorite(Base):
    """Favorite table - brands can favorite AI models."""
    __tablename__ = "favorites"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("ai_models.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="favorites")
    model = relationship("AIModel", back_populates="favorites")

    __table_args__ = (
        Index("idx_favorite_user_id", "user_id"),
        Index("idx_favorite_model_id", "model_id"),
    )
