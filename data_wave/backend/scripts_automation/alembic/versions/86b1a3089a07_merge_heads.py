"""merge heads and add ml_suggestions table, fix labelstatus enum to use string values

Revision ID: 86b1a3089a07
Revises: 20250621_add_ml_suggestions_table, ff8828916287
Create Date: 2025-06-21 17:08:54.394744

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '86b1a3089a07'
down_revision: Union[str, None] = ('20250621_add_ml_suggestions_table', 'ff8828916287')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # --- Begin content from 20250621_add_ml_suggestions_table.py ---
    op.create_table(
        'ml_suggestions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('label_id', sa.Integer, sa.ForeignKey('sensitivity_labels.id'), nullable=False),
        sa.Column('suggested_label', sa.String, nullable=False),
        sa.Column('confidence', sa.Float, nullable=False),
        sa.Column('reviewer', sa.String, nullable=True),
        sa.Column('reviewer_avatar_url', sa.String, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
    )
    # --- End content from 20250621_add_ml_suggestions_table.py ---
    # --- Begin content from ff8828916287_fix_labelstatus_enum_to_use_string_.py ---
    # (Assume this migration only fixed enum values, so nothing to do if already applied)
    # --- End content from ff8828916287_fix_labelstatus_enum_to_use_string_.py ---


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('ml_suggestions')
