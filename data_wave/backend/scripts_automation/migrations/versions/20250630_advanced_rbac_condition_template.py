"""
Migration: Add hierarchical Resource model, advanced RBAC audit fields, and ConditionTemplate table
Revision ID: 20250630_advanced_rbac_condition_template
Revises: <previous_revision_id>
Create Date: 2025-06-30
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250630_advanced_rbac_condition_template'
down_revision = '<previous_revision_id>'
branch_labels = None
depends_on = None

def upgrade():
    # --- Hierarchical Resource Model ---
    op.create_table(
        'resources',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False, index=True),
        sa.Column('type', sa.String(), nullable=False, index=True),
        sa.Column('parent_id', sa.Integer(), sa.ForeignKey('resources.id'), nullable=True),
        sa.Column('engine', sa.String(), nullable=True),
        sa.Column('details', sa.Text(), nullable=True),
    )

    # --- Advanced RBAC Audit Fields ---
    op.add_column('rbac_audit_logs', sa.Column('entity_type', sa.String(), index=True, nullable=True))
    op.add_column('rbac_audit_logs', sa.Column('entity_id', sa.String(), index=True, nullable=True))
    op.add_column('rbac_audit_logs', sa.Column('before_state', sa.Text(), nullable=True))
    op.add_column('rbac_audit_logs', sa.Column('after_state', sa.Text(), nullable=True))
    op.add_column('rbac_audit_logs', sa.Column('correlation_id', sa.String(), index=True, nullable=True))
    op.add_column('rbac_audit_logs', sa.Column('actor_ip', sa.String(), nullable=True))
    op.add_column('rbac_audit_logs', sa.Column('actor_device', sa.String(), nullable=True))
    op.add_column('rbac_audit_logs', sa.Column('api_client', sa.String(), nullable=True))
    op.add_column('rbac_audit_logs', sa.Column('extra_metadata', sa.Text(), nullable=True))

    # --- Condition Template Model ---
    op.create_table(
        'condition_templates',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('label', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )

def downgrade():
    op.drop_table('condition_templates')
    op.drop_column('rbac_audit_logs', 'extra_metadata')
    op.drop_column('rbac_audit_logs', 'api_client')
    op.drop_column('rbac_audit_logs', 'actor_device')
    op.drop_column('rbac_audit_logs', 'actor_ip')
    op.drop_column('rbac_audit_logs', 'correlation_id')
    op.drop_column('rbac_audit_logs', 'after_state')
    op.drop_column('rbac_audit_logs', 'before_state')
    op.drop_column('rbac_audit_logs', 'entity_id')
    op.drop_column('rbac_audit_logs', 'entity_type')
    op.drop_table('resources')
