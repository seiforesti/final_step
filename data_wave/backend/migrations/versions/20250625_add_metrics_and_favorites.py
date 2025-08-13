"""add metrics and favorites tables

Revision ID: 20250625_add_metrics_and_favorites
Revises: 20250624_add_discovery_history
Create Date: 2025-06-25 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250625_add_metrics_and_favorites'
down_revision = '20250624_add_discovery_history'
branch_labels = None
depends_on = None

def upgrade():
    # Create user favorites table
    op.create_table(
        'userfavorite',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('data_source_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['data_source_id'], ['datasource.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_userfavorite_user_id'), 'userfavorite', ['user_id'], unique=False)
    op.create_index(op.f('ix_userfavorite_data_source_id'), 'userfavorite', ['data_source_id'], unique=False)

    # Create quality metrics table
    op.create_table(
        'qualitymetric',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('data_source_id', sa.Integer(), nullable=False),
        sa.Column('metric_type', sa.String(), nullable=False),
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('sample_size', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('details', postgresql.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['data_source_id'], ['datasource.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_qualitymetric_data_source_id'), 'qualitymetric', ['data_source_id'], unique=False)
    op.create_index(op.f('ix_qualitymetric_metric_type'), 'qualitymetric', ['metric_type'], unique=False)

    # Create growth metrics table
    op.create_table(
        'growthmetric',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('data_source_id', sa.Integer(), nullable=False),
        sa.Column('size_bytes', sa.BigInteger(), nullable=False),
        sa.Column('record_count', sa.BigInteger(), nullable=False),
        sa.Column('measured_at', sa.DateTime(), nullable=False),
        sa.Column('growth_rate_bytes', sa.Float(), nullable=True),
        sa.Column('growth_rate_records', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['data_source_id'], ['datasource.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_growthmetric_data_source_id'), 'growthmetric', ['data_source_id'], unique=False)
    op.create_index(op.f('ix_growthmetric_measured_at'), 'growthmetric', ['measured_at'], unique=False)

def downgrade():
    op.drop_table('growthmetric')
    op.drop_table('qualitymetric')
    op.drop_table('userfavorite') 