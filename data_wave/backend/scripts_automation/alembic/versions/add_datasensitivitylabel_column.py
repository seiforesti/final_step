"""Add datasensitivitylabel column to DataTableSchema

Revision ID: add_datasensitivitylabel_column
Revises: f44b0471379d
Create Date: 2025-06-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_datasensitivitylabel_column'
down_revision = 'f44b0471379d'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('datatableschema', sa.Column('datasensitivitylabel', sa.String(length=255), nullable=True))

def downgrade():
    op.drop_column('datatableschema', 'datasensitivitylabel')
