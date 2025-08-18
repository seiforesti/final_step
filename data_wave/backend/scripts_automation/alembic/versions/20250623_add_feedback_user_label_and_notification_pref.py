"""
Add label_id and user_id to ml_feedback, create notification_preferences table
"""
from alembic import op
import sqlalchemy as sa

revision = '20250623_add_feedback_user_label_and_notification_pref'
down_revision = '20250622_merge_completed_date_and_labelstatus'
branch_labels = None
depends_on = None

def upgrade():
    # Add columns to ml_feedback
    op.add_column('ml_feedback', sa.Column('label_id', sa.Integer(), nullable=True))
    op.add_column('ml_feedback', sa.Column('user_id', sa.Integer(), nullable=True))
    # Create notification_preferences table
    op.create_table(
        'notification_preferences',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_email', sa.String(), nullable=False, unique=True),
        sa.Column('preferences', sa.JSON(), nullable=False)
    )

def downgrade():
    # Drop columns from ml_feedback
    op.drop_column('ml_feedback', 'label_id')
    op.drop_column('ml_feedback', 'user_id')
    # Drop notification_preferences table
    op.drop_table('notification_preferences')
