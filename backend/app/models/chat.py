"""Chat message model for order communication.

@TASK P0-T0.2 - DB 스키마 및 마이그레이션
@SPEC docs/planning/04-database-design.md#chatmessage-채팅-메시지---feat-3
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import uuid


class ChatMessage(Base):
    """Chat Message table - messages exchanged during order negotiation."""
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    sender_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    attachment_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    order = relationship("Order", back_populates="chat_messages")
    sender = relationship("User", back_populates="chat_messages")

    __table_args__ = (
        Index("idx_chat_order_id", "order_id"),
        Index("idx_chat_created_at", "created_at"),
    )
