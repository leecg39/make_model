"""Order model for influencer outsourcing requests.

@TASK P0-T0.2 - DB 스키마 및 마이그레이션
@SPEC docs/planning/04-database-design.md#order-섭외-주문---feat-2
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import uuid


class Order(Base):
    """Order table - stores outsourcing requests from brands to creators."""
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    brand_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    creator_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("ai_models.id", ondelete="CASCADE"), nullable=False
    )
    order_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    concept_description: Mapped[str] = mapped_column(Text, nullable=False)
    package_type: Mapped[str] = mapped_column(
        String(20), nullable=False  # basic, standard, premium
    )
    image_count: Mapped[int] = mapped_column(Integer, nullable=False)
    is_exclusive: Mapped[bool] = mapped_column(Boolean, default=False)
    exclusive_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_price: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30),
        default="pending",
        nullable=False
        # pending, accepted, in_progress, completed, cancelled
    )
    accepted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    brand_user = relationship(
        "User",
        foreign_keys=[brand_id],
        back_populates="orders_as_brand"
    )
    creator_user = relationship(
        "User",
        foreign_keys=[creator_id],
        back_populates="orders_as_creator"
    )
    model = relationship("AIModel", back_populates="orders")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")
    delivery_files = relationship("DeliveryFile", back_populates="order", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="order", cascade="all, delete-orphan")
    settlement = relationship("Settlement", back_populates="order", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_order_brand_id", "brand_id"),
        Index("idx_order_creator_id", "creator_id"),
        Index("idx_order_model_id", "model_id"),
        Index("idx_order_status", "status"),
        Index("idx_order_created_at", "created_at"),
    )


class Payment(Base):
    """Payment table - payment information for orders."""
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    payment_provider: Mapped[str] = mapped_column(String(50), nullable=False)  # portone
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False)  # card, transfer
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False
        # pending, completed, failed, refunded
    )
    transaction_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    order = relationship("Order", back_populates="payment")

    __table_args__ = (
        Index("idx_payment_order_id", "order_id"),
        Index("idx_payment_status", "status"),
    )
