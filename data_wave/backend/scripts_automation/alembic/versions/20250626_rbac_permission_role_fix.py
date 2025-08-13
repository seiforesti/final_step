"""fix permission/role relationship (RBAC)

Revision ID: 20250626_rbac_permission_role_fix
Revises: 20250626_merge_rbac_advanced_conditions
Create Date: 2025-06-26

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250626_rbac_permission_role_fix'
down_revision = '20250626_merge_rbac_advanced_conditions'
branch_labels = None
depends_on = None

def upgrade():
    # No schema changes required. This migration documents the fix:
    # - The Permission.roles relationship is now defined inside the Permission class.
    # - The line 'Permission.roles = Relationship(...)' after the class was removed.
    # - This ensures correct ORM mapping for RBAC.
    pass

def downgrade():
    # No schema changes to revert.
    pass
