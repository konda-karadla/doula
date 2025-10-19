"""Add consultation tables

Revision ID: 002_consultation_tables
Revises: 001_initial_schema
Create Date: 2025-01-19 00:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '002_consultation_tables'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'doctors',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('system_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('specialization', sa.String(), nullable=False),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('qualifications', sa.Text(), nullable=True),
        sa.Column('experience', sa.Integer(), nullable=False),
        sa.Column('consultation_fee', sa.Numeric(10, 2), nullable=False),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['system_id'], ['systems.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_doctors_system_id', 'doctors', ['system_id'])
    op.create_index('ix_doctors_specialization', 'doctors', ['specialization'])
    op.create_index('ix_doctors_is_active', 'doctors', ['is_active'])

    op.create_table(
        'availability_slots',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('doctor_id', sa.String(), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.String(), nullable=False),
        sa.Column('end_time', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_availability_slots_doctor_id', 'availability_slots', ['doctor_id'])
    op.create_index('ix_availability_slots_day_of_week', 'availability_slots', ['day_of_week'])

    op.execute("""
        CREATE TYPE consultationtype AS ENUM ('VIDEO', 'PHONE', 'IN_PERSON')
    """)

    op.execute("""
        CREATE TYPE consultationstatus AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
    """)

    op.create_table(
        'consultations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('doctor_id', sa.String(), nullable=False),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('duration', sa.Integer(), nullable=False, server_default='30'),
        sa.Column('type', postgresql.ENUM('VIDEO', 'PHONE', 'IN_PERSON', name='consultationtype'), nullable=False, server_default='VIDEO'),
        sa.Column('status', postgresql.ENUM('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', name='consultationstatus'), nullable=False, server_default='SCHEDULED'),
        sa.Column('meeting_link', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('prescription', sa.Text(), nullable=True),
        sa.Column('fee', sa.Numeric(10, 2), nullable=False),
        sa.Column('is_paid', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_consultations_user_id', 'consultations', ['user_id'])
    op.create_index('ix_consultations_doctor_id', 'consultations', ['doctor_id'])
    op.create_index('ix_consultations_scheduled_at', 'consultations', ['scheduled_at'])
    op.create_index('ix_consultations_status', 'consultations', ['status'])


def downgrade() -> None:
    op.drop_index('ix_consultations_status', 'consultations')
    op.drop_index('ix_consultations_scheduled_at', 'consultations')
    op.drop_index('ix_consultations_doctor_id', 'consultations')
    op.drop_index('ix_consultations_user_id', 'consultations')
    op.drop_table('consultations')

    op.execute('DROP TYPE consultationstatus')
    op.execute('DROP TYPE consultationtype')

    op.drop_index('ix_availability_slots_day_of_week', 'availability_slots')
    op.drop_index('ix_availability_slots_doctor_id', 'availability_slots')
    op.drop_table('availability_slots')

    op.drop_index('ix_doctors_is_active', 'doctors')
    op.drop_index('ix_doctors_specialization', 'doctors')
    op.drop_index('ix_doctors_system_id', 'doctors')
    op.drop_table('doctors')
