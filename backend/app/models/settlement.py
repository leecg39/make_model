"""Settlement model for creator payment settlements.

@TASK P0-T0.2 - DB 스키마 및 마이그레이션
@SPEC docs/planning/04-database-design.md#settlement
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import uuid


class Settlement(Base):
    """Settlement table - creator payment settlements after order completion."""
    __tablename__ = "settlements"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    creator_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    total_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    platform_fee: Mapped[int] = mapped_column(Integer, nullable=False)
    settlement_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False
        # pending, completed
    )
    requested_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    creator = relationship("User", back_populates="settlements")
    order = relationship("Order", back_populates="settlement")

    __table_args__ = (
        Index("idx_settlement_creator_id", "creator_id"),
        Index("idx_settlement_order_id", "order_id"),
    )
