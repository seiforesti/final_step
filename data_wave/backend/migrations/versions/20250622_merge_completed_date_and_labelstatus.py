"""merge add_completed_date_and_missing_tables and ml_suggestions_and_labelstatus

Revision ID: 20250622_merge_completed_date_and_labelstatus
Revises: 20250621_merge_ml_suggestions_and_labelstatus, 86b1a3089a07
Create Date: 2025-06-22
"""
from alembic import op
import sqlalchemy as sa

revision = '20250622_merge_completed_date_and_labelstatus'
down_revision = ('20250621_merge_ml_suggestions_and_labelstatus', '86b1a3089a07')
branch_labels = None
depends_on = None

def upgrade():
    # 1. Add completed_date to label_reviews table (adjust table name if needed)
    op.add_column('label_reviews', sa.Column('completed_date', sa.DateTime(), nullable=True))

    # 2. Create lineage_edges table
    op.create_table(
        'lineage_edges',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('source_id', sa.String(), nullable=False),
        sa.Column('target_id', sa.String(), nullable=False),
        sa.Column('edge_type', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 3. Create roles table
    op.create_table(
        'roles',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('description', sa.String(), nullable=True),
    )

    # 4. Create user_roles table
    op.create_table(
        'user_roles',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('role_id', sa.Integer(), sa.ForeignKey('roles.id'), nullable=False),
    )

def downgrade():
    op.drop_column('label_reviews', 'completed_date')
    op.drop_table('user_roles')
    op.drop_table('roles')
    op.drop_table('lineage_edges')
