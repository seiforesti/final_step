"""
Alembic merge migration for RBAC advanced conditions and feedback/notification changes
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250626_merge_rbac_advanced_conditions'
down_revision = ('20250623_add_feedback_user_label_and_notification_pref', '20250626_rbac_advanced_conditions')
branch_labels = None
depends_on = None

def upgrade():
    # Create permissions table if not exists
    op.create_table(
        'permissions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('action', sa.String(), nullable=False, index=True),
        sa.Column('resource', sa.String(), nullable=False, index=True),
        sa.Column('conditions', sa.Text(), nullable=True),
    )
    # Create role_permissions table if not exists
    op.create_table(
        'role_permissions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('role_id', sa.Integer(), sa.ForeignKey('roles.id'), nullable=False),
        sa.Column('permission_id', sa.Integer(), sa.ForeignKey('permissions.id'), nullable=False),
    )
    # No need to add description to roles (already exists)
    # Add/modify audit log table if needed (example shown)
    # with op.batch_alter_table('label_audit') as batch_op:
    #     batch_op.add_column(sa.Column('note', sa.Text(), nullable=True))
    pass

def downgrade():
    op.drop_table('role_permissions')
    op.drop_table('permissions')
    # Do NOT drop description from roles
    # with op.batch_alter_table('label_audit') as batch_op:
    #     batch_op.drop_column('note')
