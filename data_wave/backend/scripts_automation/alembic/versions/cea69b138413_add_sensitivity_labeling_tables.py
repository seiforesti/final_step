"""add sensitivity labeling tables

Revision ID: cea69b138413
Revises: 9c34b1393114
Create Date: 2025-06-19 22:24:03.598990

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import enum

# revision identifiers, used by Alembic.
revision: str = 'cea69b138413'
down_revision: Union[str, None] = '9c34b1393114'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### Create sensitivity labeling tables ###
    op.create_table(
        'sensitivity_labels',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('color', sa.String, default="#cccccc"),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('is_conditional', sa.Boolean, default=False),
        sa.Column('condition_expression', sa.Text, nullable=True),
        sa.Column('applies_to', sa.String, default="column"),
    )
    op.create_table(
        'label_proposals',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('label_id', sa.Integer, sa.ForeignKey('sensitivity_labels.id')),
        sa.Column('object_type', sa.String, nullable=False),
        sa.Column('object_id', sa.String, nullable=False),
        sa.Column('proposed_by', sa.String, nullable=False),
        sa.Column('justification', sa.Text),
        sa.Column('status', sa.Enum('PROPOSED', 'APPROVED', 'REJECTED', 'EXPIRED', name='labelstatus'), default='PROPOSED'),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('expiry_date', sa.DateTime, nullable=True),
        sa.Column('review_cycle_days', sa.Integer, nullable=True),
    )
    op.create_table(
        'label_audits',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('proposal_id', sa.Integer, sa.ForeignKey('label_proposals.id')),
        sa.Column('action', sa.String, nullable=False),
        sa.Column('performed_by', sa.String, nullable=False),
        sa.Column('note', sa.Text),
        sa.Column('timestamp', sa.DateTime, nullable=False),
    )
    op.create_table(
        'label_reviews',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('proposal_id', sa.Integer, sa.ForeignKey('label_proposals.id')),
        sa.Column('reviewer', sa.String, nullable=False),
        sa.Column('review_status', sa.Enum('PROPOSED', 'APPROVED', 'REJECTED', 'EXPIRED', name='labelstatus_review'), default='PROPOSED'),
        sa.Column('review_note', sa.Text),
        sa.Column('review_date', sa.DateTime, nullable=False),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### Drop sensitivity labeling tables ###
    op.drop_table('label_reviews')
    op.drop_table('label_audits')
    op.drop_table('label_proposals')
    op.drop_table('sensitivity_labels')
    # ### end Alembic commands ###
