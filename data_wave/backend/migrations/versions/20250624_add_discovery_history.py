"""add discovery history table

Revision ID: 20250624_add_discovery_history
Revises: 20250623_enhance_data_source
Create Date: 2025-06-24 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '20250624_add_discovery_history'
down_revision = '20250623_enhance_data_source'
branch_labels = None
depends_on = None


def upgrade():
    # Create discovery status enum
    op.execute("""
        CREATE TYPE discoverystatus AS ENUM (
            'pending', 'running', 'completed', 'failed', 'cancelled'
        );
    """)

    # Create discovery history table
    op.create_table(
        'discovery_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('discovery_id', sa.String(), nullable=False),
        sa.Column('data_source_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('pending', 'running', 'completed', 'failed', 'cancelled', name='discoverystatus'), nullable=False),
        sa.Column('discovery_time', sa.DateTime(), nullable=False),
        sa.Column('completed_time', sa.DateTime(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('tables_discovered', sa.Integer(), nullable=True),
        sa.Column('columns_discovered', sa.Integer(), nullable=True),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.Column('metadata', postgresql.JSONB, nullable=True),
        sa.Column('triggered_by', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['data_source_id'], ['datasource.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index(
        'ix_discovery_history_data_source_id',
        'discovery_history',
        ['data_source_id']
    )
    op.create_index(
        'ix_discovery_history_discovery_id',
        'discovery_history',
        ['discovery_id']
    )
    op.create_index(
        'ix_discovery_history_status',
        'discovery_history',
        ['status']
    )
    op.create_index(
        'ix_discovery_history_discovery_time',
        'discovery_history',
        ['discovery_time']
    )


def downgrade():
    # Drop indexes
    op.drop_index('ix_discovery_history_discovery_time')
    op.drop_index('ix_discovery_history_status')
    op.drop_index('ix_discovery_history_discovery_id')
    op.drop_index('ix_discovery_history_data_source_id')

    # Drop table
    op.drop_table('discovery_history')

    # Drop enum type
    op.execute('DROP TYPE discoverystatus;') 