"""Initial schema creation for AI influencer marketplace.

@TASK P0-T0.2 - DB 스키마 및 마이그레이션
@SPEC docs/planning/04-database-design.md

Revision ID: 001
Revises: None
Create Date: 2026-02-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create all initial tables."""
    # Create USERS table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=True),
        sa.Column('nickname', sa.String(50), nullable=False),
        sa.Column('role', sa.String(20), nullable=False, server_default='creator'),
        sa.Column('profile_image', sa.String(500), nullable=True),
        sa.Column('company_name', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('idx_user_email', 'users', ['email'])
    op.create_index('idx_user_role', 'users', ['role'])

    # Create AUTH_TOKENS table
    op.create_table(
        'auth_tokens',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('refresh_token', sa.String(255), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('refresh_token')
    )
    op.create_index('idx_auth_token_user_id', 'auth_tokens', ['user_id'])

    # Create AI_MODELS table
    op.create_table(
        'ai_models',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('creator_id', sa.String(36), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('style', sa.String(50), nullable=False),
        sa.Column('gender', sa.String(20), nullable=False),
        sa.Column('age_range', sa.String(10), nullable=False),
        sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('rating', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('status', sa.String(20), nullable=False, server_default='draft'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_model_creator_id', 'ai_models', ['creator_id'])
    op.create_index('idx_model_status', 'ai_models', ['status'])
    op.create_index('idx_model_style', 'ai_models', ['style'])
    op.create_index('idx_model_rating', 'ai_models', ['rating'])
    op.create_index('idx_model_created_at', 'ai_models', ['created_at'])

    # Create MODEL_IMAGES table
    op.create_table(
        'model_images',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('model_id', sa.String(36), nullable=False),
        sa.Column('image_url', sa.String(500), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.Column('is_thumbnail', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['model_id'], ['ai_models.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create MODEL_TAGS table
    op.create_table(
        'model_tags',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('model_id', sa.String(36), nullable=False),
        sa.Column('tag', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['model_id'], ['ai_models.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create FAVORITES table
    op.create_table(
        'favorites',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('model_id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['model_id'], ['ai_models.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'model_id')
    )
    op.create_index('idx_favorite_user_id', 'favorites', ['user_id'])
    op.create_index('idx_favorite_model_id', 'favorites', ['model_id'])

    # Create ORDERS table
    op.create_table(
        'orders',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('brand_id', sa.String(36), nullable=False),
        sa.Column('creator_id', sa.String(36), nullable=False),
        sa.Column('model_id', sa.String(36), nullable=False),
        sa.Column('order_number', sa.String(50), nullable=False),
        sa.Column('concept_description', sa.Text(), nullable=False),
        sa.Column('package_type', sa.String(20), nullable=False),
        sa.Column('image_count', sa.Integer(), nullable=False),
        sa.Column('is_exclusive', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('exclusive_months', sa.Integer(), nullable=True),
        sa.Column('total_price', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(30), nullable=False, server_default='pending'),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['brand_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['model_id'], ['ai_models.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('order_number')
    )
    op.create_index('idx_order_brand_id', 'orders', ['brand_id'])
    op.create_index('idx_order_creator_id', 'orders', ['creator_id'])
    op.create_index('idx_order_model_id', 'orders', ['model_id'])
    op.create_index('idx_order_status', 'orders', ['status'])
    op.create_index('idx_order_created_at', 'orders', ['created_at'])

    # Create PAYMENTS table
    op.create_table(
        'payments',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('order_id', sa.String(36), nullable=False),
        sa.Column('payment_provider', sa.String(50), nullable=False),
        sa.Column('payment_method', sa.String(50), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('transaction_id', sa.String(100), nullable=True),
        sa.Column('paid_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('order_id')
    )
    op.create_index('idx_payment_order_id', 'payments', ['order_id'])
    op.create_index('idx_payment_status', 'payments', ['status'])

    # Create DELIVERY_FILES table
    op.create_table(
        'delivery_files',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('order_id', sa.String(36), nullable=False),
        sa.Column('file_url', sa.String(500), nullable=False),
        sa.Column('file_name', sa.String(255), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_delivery_order_id', 'delivery_files', ['order_id'])

    # Create CHAT_MESSAGES table
    op.create_table(
        'chat_messages',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('order_id', sa.String(36), nullable=False),
        sa.Column('sender_id', sa.String(36), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('attachment_url', sa.String(500), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_chat_order_id', 'chat_messages', ['order_id'])
    op.create_index('idx_chat_created_at', 'chat_messages', ['created_at'])

    # Create SETTLEMENTS table
    op.create_table(
        'settlements',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('creator_id', sa.String(36), nullable=False),
        sa.Column('order_id', sa.String(36), nullable=False),
        sa.Column('total_amount', sa.Integer(), nullable=False),
        sa.Column('platform_fee', sa.Integer(), nullable=False),
        sa.Column('settlement_amount', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('requested_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('order_id')
    )
    op.create_index('idx_settlement_creator_id', 'settlements', ['creator_id'])
    op.create_index('idx_settlement_order_id', 'settlements', ['order_id'])


def downgrade() -> None:
    """Drop all tables in reverse order."""
    # Drop tables in reverse order of creation
    op.drop_index('idx_settlement_order_id', 'settlements')
    op.drop_index('idx_settlement_creator_id', 'settlements')
    op.drop_table('settlements')

    op.drop_index('idx_chat_created_at', 'chat_messages')
    op.drop_index('idx_chat_order_id', 'chat_messages')
    op.drop_table('chat_messages')

    op.drop_index('idx_delivery_order_id', 'delivery_files')
    op.drop_table('delivery_files')

    op.drop_index('idx_payment_status', 'payments')
    op.drop_index('idx_payment_order_id', 'payments')
    op.drop_table('payments')

    op.drop_index('idx_order_created_at', 'orders')
    op.drop_index('idx_order_status', 'orders')
    op.drop_index('idx_order_model_id', 'orders')
    op.drop_index('idx_order_creator_id', 'orders')
    op.drop_index('idx_order_brand_id', 'orders')
    op.drop_table('orders')

    op.drop_index('idx_favorite_model_id', 'favorites')
    op.drop_index('idx_favorite_user_id', 'favorites')
    op.drop_table('favorites')

    op.drop_table('model_tags')
    op.drop_table('model_images')

    op.drop_index('idx_model_created_at', 'ai_models')
    op.drop_index('idx_model_rating', 'ai_models')
    op.drop_index('idx_model_style', 'ai_models')
    op.drop_index('idx_model_status', 'ai_models')
    op.drop_index('idx_model_creator_id', 'ai_models')
    op.drop_table('ai_models')

    op.drop_index('idx_auth_token_user_id', 'auth_tokens')
    op.drop_table('auth_tokens')

    op.drop_index('idx_user_role', 'users')
    op.drop_index('idx_user_email', 'users')
    op.drop_table('users')
