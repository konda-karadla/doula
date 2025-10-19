from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Boolean, Enum as SQLEnum, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
import enum

from app.core.database import Base


class ConsultationType(str, enum.Enum):
    VIDEO = "VIDEO"
    PHONE = "PHONE"
    IN_PERSON = "IN_PERSON"


class ConsultationStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    CONFIRMED = "CONFIRMED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    system_id = Column(String, ForeignKey("systems.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False, index=True)
    bio = Column(Text, nullable=True)
    qualifications = Column(Text, nullable=True)
    experience = Column(Integer, nullable=False)
    consultation_fee = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    system = relationship("System", back_populates="doctors")
    availability_slots = relationship("AvailabilitySlot", back_populates="doctor", cascade="all, delete-orphan")
    consultations = relationship("Consultation", back_populates="doctor", cascade="all, delete-orphan")


class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    doctor_id = Column(String, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False, index=True)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    doctor = relationship("Doctor", back_populates="availability_slots")


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False, index=True)
    duration = Column(Integer, default=30, nullable=False)
    type = Column(SQLEnum(ConsultationType), default=ConsultationType.VIDEO, nullable=False)
    status = Column(SQLEnum(ConsultationStatus), default=ConsultationStatus.SCHEDULED, nullable=False, index=True)
    meeting_link = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    prescription = Column(Text, nullable=True)
    fee = Column(Numeric(10, 2), nullable=False)
    is_paid = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="consultations")
    doctor = relationship("Doctor", back_populates="consultations")
