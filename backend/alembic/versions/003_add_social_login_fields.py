"""Add social login fields to users table.

Revision ID: 003
Revises: 002
Create Date: 2026-02-13 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('social_provider', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('social_id', sa.String(255), nullable=True))
    op.create_index('idx_user_social', 'users', ['social_provider', 'social_id'])


def downgrade() -> None:
    op.drop_index('idx_user_social', table_name='users')
    op.drop_column('users', 'social_id')
    op.drop_column('users', 'social_provider')
