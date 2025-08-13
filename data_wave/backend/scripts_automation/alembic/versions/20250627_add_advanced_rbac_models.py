"""add advanced RBAC models: resource_roles, access_requests, rbac_audit_logs

Revision ID: 20250627_add_advanced_rbac_models
Revises: 20250626_rbac_permission_role_fix
Create Date: 2025-06-27
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250627_add_advanced_rbac_models'
down_revision = '20250626_rbac_permission_role_fix'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'resource_roles',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('role_id', sa.Integer(), sa.ForeignKey('roles.id'), nullable=False),
        sa.Column('resource_type', sa.String(), nullable=False),
        sa.Column('resource_id', sa.String(), nullable=False),
        sa.Column('assigned_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        'access_requests',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('resource_type', sa.String(), nullable=False),
        sa.Column('resource_id', sa.String(), nullable=False),
        sa.Column('requested_role', sa.String(), nullable=False),
        sa.Column('justification', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='pending'),
        sa.Column('review_note', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('reviewed_by', sa.String(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
    )
    op.create_table(
        'rbac_audit_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('performed_by', sa.String(), nullable=False),
        sa.Column('target_user', sa.String(), nullable=True),
        sa.Column('resource_type', sa.String(), nullable=True),
        sa.Column('resource_id', sa.String(), nullable=True),
        sa.Column('role', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('note', sa.String(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table('rbac_audit_logs')
    op.drop_table('access_requests')
    op.drop_table('resource_roles')
