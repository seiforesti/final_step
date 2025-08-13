"""merge heads

Revision ID: 50b16a3b15d9
Revises: 5aef4f8b2ecd
Create Date: 2025-06-20 02:32:11.391725

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50b16a3b15d9'
down_revision: Union[str, None] = '5aef4f8b2ecd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'ml_feedback',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('user_email', sa.String, nullable=True),
        sa.Column('features', sa.JSON, nullable=False),
        sa.Column('actual_label', sa.String, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        'ml_model_versions',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('version', sa.String, nullable=False),
        sa.Column('trained_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('accuracy', sa.Float, nullable=True),
        sa.Column('precision', sa.Float, nullable=True),
        sa.Column('recall', sa.Float, nullable=True),
        sa.Column('notes', sa.String, nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('ml_feedback')
    op.drop_table('ml_model_versions')
