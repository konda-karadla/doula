from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base
from schemas.enums import MedicationStatus


class MedicalHistory(Base):
    """Patient medical history"""
    __tablename__ = "medical_histories"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    patient_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    recorded_by = Column(String, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    
    # Medical history details
    chronic_conditions = Column(Text, nullable=True)  # JSON or formatted text
    past_surgeries = Column(Text, nullable=True)      # JSON or formatted text
    family_history = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    immunization_history = Column(Text, nullable=True)
    
    # Additional notes
    social_history = Column(Text, nullable=True)      # Lifestyle, occupation, etc.
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_reviewed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    patient = relationship("User", back_populates="medical_history", foreign_keys=[patient_id])
    recording_staff = relationship("Staff", foreign_keys=[recorded_by])


class Medication(Base):
    """Current and past medications"""
    __tablename__ = "medications"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    patient_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    prescribed_by = Column(String, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True, index=True)
    
    medication_name = Column(String, nullable=False)
    generic_name = Column(String, nullable=True)
    dosage = Column(String, nullable=False)  # e.g., "500mg"
    frequency = Column(String, nullable=False)  # e.g., "Twice daily", "Every 8 hours"
    route = Column(String, nullable=True)  # e.g., "Oral", "IV", "Topical"
    
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    
    indication = Column(Text, nullable=True)  # Reason for prescription
    instructions = Column(Text, nullable=True)  # Special instructions
    
    status = Column(SQLEnum(MedicationStatus), default=MedicationStatus.ACTIVE, nullable=False, index=True)
    discontinuation_reason = Column(Text, nullable=True)
    discontinuation_date = Column(Date, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("User", back_populates="medications", foreign_keys=[patient_id])
    prescribing_physician = relationship("Staff", foreign_keys=[prescribed_by])

