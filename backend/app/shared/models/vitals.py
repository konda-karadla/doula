from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Integer, Text, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base
from schemas.enums import VitalsLocation, VitalsStatus, VitalsAlertType, AlertSeverity


class VitalsRecord(Base):
    """Vital signs recorded by nurses"""
    __tablename__ = "vitals_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    patient_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    nurse_id = Column(String, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)
    
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    location = Column(SQLEnum(VitalsLocation), default=VitalsLocation.CLINIC, nullable=False)
    
    # Vital signs measurements
    blood_pressure_systolic = Column(Integer, nullable=True)   # mmHg
    blood_pressure_diastolic = Column(Integer, nullable=True)  # mmHg
    heart_rate = Column(Integer, nullable=True)                # bpm
    temperature = Column(Numeric(4, 1), nullable=True)         # Celsius
    respiratory_rate = Column(Integer, nullable=True)          # breaths per minute
    oxygen_saturation = Column(Integer, nullable=True)         # SpO2 %
    weight = Column(Numeric(5, 2), nullable=True)              # kg
    height = Column(Numeric(5, 2), nullable=True)              # cm
    bmi = Column(Numeric(4, 2), nullable=True)                 # calculated
    blood_glucose = Column(Integer, nullable=True)             # mg/dL
    pain_level = Column(Integer, nullable=True)                # 0-10 scale
    
    notes = Column(Text, nullable=True)
    status = Column(SQLEnum(VitalsStatus), default=VitalsStatus.NORMAL, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("User", back_populates="vitals_records", foreign_keys=[patient_id])
    nurse = relationship("Staff", back_populates="vitals_records")
    alerts = relationship("VitalsAlert", back_populates="vitals_record", cascade="all, delete-orphan")


class VitalsAlert(Base):
    """Alerts for abnormal vital signs"""
    __tablename__ = "vitals_alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    vitals_record_id = Column(String, ForeignKey("vitals_records.id", ondelete="CASCADE"), nullable=False, index=True)
    
    alert_type = Column(SQLEnum(VitalsAlertType), nullable=False, index=True)
    severity = Column(SQLEnum(AlertSeverity), nullable=False, index=True)
    message = Column(Text, nullable=False)
    
    # Alert acknowledgment
    is_acknowledged = Column(Boolean, default=False, nullable=False)
    acknowledged_by = Column(String, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    vitals_record = relationship("VitalsRecord", back_populates="alerts")
    acknowledging_staff = relationship("Staff", foreign_keys=[acknowledged_by])

