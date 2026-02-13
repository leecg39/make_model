"""Add missing indexes for query performance.

Revision ID: 002
Revises: 001
Create Date: 2026-02-13 00:00:00.000000
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index('idx_orders_brand_status', 'orders', ['brand_id', 'status'])
    op.create_index('idx_orders_creator_status', 'orders', ['creator_id', 'status'])
    op.create_index('idx_chat_unread', 'chat_messages', ['order_id', 'sender_id', 'is_read'])
    op.create_index('idx_model_images_model_id', 'model_images', ['model_id'])
    op.create_index('idx_favorites_user_model', 'favorites', ['user_id', 'model_id'])


def downgrade() -> None:
    op.drop_index('idx_favorites_user_model')
    op.drop_index('idx_model_images_model_id')
    op.drop_index('idx_chat_unread')
    op.drop_index('idx_orders_creator_status')
    op.drop_index('idx_orders_brand_status')
