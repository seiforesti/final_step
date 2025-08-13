"""
Alembic migration to add is_active field to ml_model_versions.
"""
from alembic import op
import sqlalchemy as sa

revision = 'ml_model_version_active_field'
down_revision = '50b16a3b15d9'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('ml_model_versions', sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.false()))

def downgrade():
    op.drop_column('ml_model_versions', 'is_active')
