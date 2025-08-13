"""update scan result model

Revision ID: 20250626_update_scan_result
Revises: 20250625_add_metrics_and_favorites
Create Date: 2025-06-26 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250626_update_scan_result'
down_revision = '20250625_add_metrics_and_favorites'
branch_labels = None
depends_on = None

def upgrade():
    # Drop old columns
    op.drop_column('scanresult', 'data_type')
    op.drop_column('scanresult', 'nullable')
    op.drop_column('scanresult', 'scan_metadata')

    # Add new columns
    op.add_column('scanresult', sa.Column('object_type', sa.String(), nullable=False, server_default='table'))
    op.add_column('scanresult', sa.Column('classification_labels', postgresql.JSON(), nullable=True))
    op.add_column('scanresult', sa.Column('sensitivity_level', sa.String(), nullable=True))
    op.add_column('scanresult', sa.Column('compliance_issues', postgresql.JSON(), nullable=True))
    op.add_column('scanresult', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')))

    # Make schema_name not nullable
    op.alter_column('scanresult', 'schema_name',
                    existing_type=sa.String(),
                    nullable=False)

    # Add index on scan_id
    op.create_index(op.f('ix_scanresult_scan_id'), 'scanresult', ['scan_id'], unique=False)

def downgrade():
    # Remove new columns
    op.drop_column('scanresult', 'object_type')
    op.drop_column('scanresult', 'classification_labels')
    op.drop_column('scanresult', 'sensitivity_level')
    op.drop_column('scanresult', 'compliance_issues')
    op.drop_column('scanresult', 'updated_at')

    # Add back old columns
    op.add_column('scanresult', sa.Column('data_type', sa.String(), nullable=True))
    op.add_column('scanresult', sa.Column('nullable', sa.Boolean(), nullable=True))
    op.add_column('scanresult', sa.Column('scan_metadata', postgresql.JSON(), nullable=True))

    # Make schema_name nullable
    op.alter_column('scanresult', 'schema_name',
                    existing_type=sa.String(),
                    nullable=True)

    # Remove index on scan_id
    op.drop_index(op.f('ix_scanresult_scan_id'), table_name='scanresult') 