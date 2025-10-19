"""Initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2025-01-19 00:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create systems table
    op.create_table(
        'systems',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False, server_default='user'),
        sa.Column('profile_type', sa.String(), nullable=False),
        sa.Column('journey_type', sa.String(), nullable=False),
        sa.Column('system_id', sa.String(), nullable=False),
        sa.Column('first_name', sa.String(), nullable=True),
        sa.Column('last_name', sa.String(), nullable=True),
        sa.Column('phone_number', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['system_id'], ['systems.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username'),
    )
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_system_id', 'users', ['system_id'])
    op.create_index('ix_users_role', 'users', ['role'])
    op.create_index('ix_users_is_active', 'users', ['is_active'])

    # Create lab_results table
    op.create_table(
        'lab_results',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('system_id', sa.String(), nullable=False),
        sa.Column('lab_name', sa.String(), nullable=False),
        sa.Column('test_date', sa.Date(), nullable=False),
        sa.Column('file_url', sa.String(), nullable=False),
        sa.Column('processing_status', sa.String(), nullable=False, server_default='pending'),
        sa.Column('extracted_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['system_id'], ['systems.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_lab_results_user_id', 'lab_results', ['user_id'])
    op.create_index('ix_lab_results_system_id', 'lab_results', ['system_id'])
    op.create_index('ix_lab_results_test_date', 'lab_results', ['test_date'])
    op.create_index('ix_lab_results_processing_status', 'lab_results', ['processing_status'])

    # Create action_plans table
    op.create_table(
        'action_plans',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('system_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='active'),
        sa.Column('priority', sa.String(), nullable=False, server_default='medium'),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['system_id'], ['systems.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_action_plans_user_id', 'action_plans', ['user_id'])
    op.create_index('ix_action_plans_system_id', 'action_plans', ['system_id'])
    op.create_index('ix_action_plans_status', 'action_plans', ['status'])
    op.create_index('ix_action_plans_priority', 'action_plans', ['priority'])

    # Create system_configs table
    op.create_table(
        'system_configs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('system_id', sa.String(), nullable=False),
        sa.Column('config_key', sa.String(), nullable=False),
        sa.Column('config_value', sa.String(), nullable=False),
        sa.Column('data_type', sa.String(), nullable=False, server_default='string'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['system_id'], ['systems.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('system_id', 'config_key'),
    )
    op.create_index('ix_system_configs_system_id', 'system_configs', ['system_id'])


def downgrade() -> None:
    op.drop_index('ix_system_configs_system_id', 'system_configs')
    op.drop_table('system_configs')
    
    op.drop_index('ix_action_plans_priority', 'action_plans')
    op.drop_index('ix_action_plans_status', 'action_plans')
    op.drop_index('ix_action_plans_system_id', 'action_plans')
    op.drop_index('ix_action_plans_user_id', 'action_plans')
    op.drop_table('action_plans')
    
    op.drop_index('ix_lab_results_processing_status', 'lab_results')
    op.drop_index('ix_lab_results_test_date', 'lab_results')
    op.drop_index('ix_lab_results_system_id', 'lab_results')
    op.drop_index('ix_lab_results_user_id', 'lab_results')
    op.drop_table('lab_results')
    
    op.drop_index('ix_users_is_active', 'users')
    op.drop_index('ix_users_role', 'users')
    op.drop_index('ix_users_system_id', 'users')
    op.drop_index('ix_users_email', 'users')
    op.drop_table('users')
    
    op.drop_table('systems')
