"""enhance data source model

Revision ID: 20250623_enhance_data_source
Revises: 20250622_merge_completed_date_and_labelstatus
Create Date: 2025-06-23 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision = '20250623_enhance_data_source'
down_revision = '20250622_merge_completed_date_and_labelstatus'
branch_labels = None
depends_on = None


def upgrade():
    # Add new enum types
    op.execute("""
        CREATE TYPE datasourcestatus AS ENUM (
            'active', 'inactive', 'error', 'pending', 'syncing', 'maintenance'
        );
        CREATE TYPE environment AS ENUM (
            'production', 'staging', 'development', 'test'
        );
        CREATE TYPE criticality AS ENUM (
            'critical', 'high', 'medium', 'low'
        );
        CREATE TYPE dataclassification AS ENUM (
            'public', 'internal', 'confidential', 'restricted'
        );
        CREATE TYPE scanfrequency AS ENUM (
            'hourly', 'daily', 'weekly', 'monthly'
        );
    """)

    # Add new columns to datasource table
    op.add_column('datasource', sa.Column('status', sa.Enum('active', 'inactive', 'error', 'pending', 'syncing', 'maintenance', name='datasourcestatus'), nullable=False, server_default='pending'))
    op.add_column('datasource', sa.Column('environment', sa.Enum('production', 'staging', 'development', 'test', name='environment'), nullable=True))
    op.add_column('datasource', sa.Column('criticality', sa.Enum('critical', 'high', 'medium', 'low', name='criticality'), nullable=True, server_default='medium'))
    op.add_column('datasource', sa.Column('data_classification', sa.Enum('public', 'internal', 'confidential', 'restricted', name='dataclassification'), nullable=True, server_default='internal'))
    op.add_column('datasource', sa.Column('tags', postgresql.JSONB, nullable=True))
    op.add_column('datasource', sa.Column('owner', sa.String(), nullable=True))
    op.add_column('datasource', sa.Column('team', sa.String(), nullable=True))
    
    # Operational fields
    op.add_column('datasource', sa.Column('backup_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('datasource', sa.Column('monitoring_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('datasource', sa.Column('encryption_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('datasource', sa.Column('scan_frequency', sa.Enum('hourly', 'daily', 'weekly', 'monthly', name='scanfrequency'), nullable=True, server_default='weekly'))
    
    # Performance metrics
    op.add_column('datasource', sa.Column('health_score', sa.Integer(), nullable=True))
    op.add_column('datasource', sa.Column('compliance_score', sa.Integer(), nullable=True))
    op.add_column('datasource', sa.Column('entity_count', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('datasource', sa.Column('size_gb', sa.Float(), nullable=True, server_default='0'))
    op.add_column('datasource', sa.Column('avg_response_time', sa.Integer(), nullable=True))
    op.add_column('datasource', sa.Column('error_rate', sa.Float(), nullable=True, server_default='0'))
    op.add_column('datasource', sa.Column('uptime_percentage', sa.Float(), nullable=True, server_default='100'))
    op.add_column('datasource', sa.Column('connection_pool_size', sa.Integer(), nullable=True, server_default='10'))
    op.add_column('datasource', sa.Column('active_connections', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('datasource', sa.Column('queries_per_second', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('datasource', sa.Column('storage_used_percentage', sa.Float(), nullable=True, server_default='0'))
    op.add_column('datasource', sa.Column('cost_per_month', sa.Float(), nullable=True, server_default='0'))
    
    # Timestamp fields
    op.add_column('datasource', sa.Column('last_scan', sa.DateTime(), nullable=True))
    op.add_column('datasource', sa.Column('next_scan', sa.DateTime(), nullable=True))
    op.add_column('datasource', sa.Column('last_backup', sa.DateTime(), nullable=True))
    op.add_column('datasource', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')))
    op.add_column('datasource', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')))

    # Add new data source types
    op.execute("""
        ALTER TYPE datasourcetype ADD VALUE IF NOT EXISTS 'snowflake';
        ALTER TYPE datasourcetype ADD VALUE IF NOT EXISTS 's3';
        ALTER TYPE datasourcetype ADD VALUE IF NOT EXISTS 'redis';
    """)

    # Update location enum
    op.execute("""
        ALTER TYPE datasourcelocation ADD VALUE IF NOT EXISTS 'hybrid';
        UPDATE datasource SET location = 'on_prem' WHERE location = 'on-prem';
    """)


def downgrade():
    # Drop new columns from datasource table
    op.drop_column('datasource', 'status')
    op.drop_column('datasource', 'environment')
    op.drop_column('datasource', 'criticality')
    op.drop_column('datasource', 'data_classification')
    op.drop_column('datasource', 'tags')
    op.drop_column('datasource', 'owner')
    op.drop_column('datasource', 'team')
    op.drop_column('datasource', 'backup_enabled')
    op.drop_column('datasource', 'monitoring_enabled')
    op.drop_column('datasource', 'encryption_enabled')
    op.drop_column('datasource', 'scan_frequency')
    op.drop_column('datasource', 'health_score')
    op.drop_column('datasource', 'compliance_score')
    op.drop_column('datasource', 'entity_count')
    op.drop_column('datasource', 'size_gb')
    op.drop_column('datasource', 'avg_response_time')
    op.drop_column('datasource', 'error_rate')
    op.drop_column('datasource', 'uptime_percentage')
    op.drop_column('datasource', 'connection_pool_size')
    op.drop_column('datasource', 'active_connections')
    op.drop_column('datasource', 'queries_per_second')
    op.drop_column('datasource', 'storage_used_percentage')
    op.drop_column('datasource', 'cost_per_month')
    op.drop_column('datasource', 'last_scan')
    op.drop_column('datasource', 'next_scan')
    op.drop_column('datasource', 'last_backup')
    op.drop_column('datasource', 'created_at')
    op.drop_column('datasource', 'updated_at')

    # Drop enum types
    op.execute("""
        DROP TYPE IF EXISTS datasourcestatus;
        DROP TYPE IF EXISTS environment;
        DROP TYPE IF EXISTS criticality;
        DROP TYPE IF EXISTS dataclassification;
        DROP TYPE IF EXISTS scanfrequency;
    """)

    # Note: We can't remove values from existing enums in PostgreSQL
    # So we leave the new datasourcetype and datasourcelocation values 