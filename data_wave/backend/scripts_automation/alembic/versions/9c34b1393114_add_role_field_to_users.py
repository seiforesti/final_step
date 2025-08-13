"""Add role field to users

Revision ID: 9c34b1393114
Revises: bb1fda53b016
Create Date: 2025-06-19 19:59:47.953914

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '9c34b1393114'
down_revision: Union[str, None] = 'bb1fda53b016'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('role', sa.String(), nullable=False, server_default='user'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'role')