from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="patient", nullable=False, index=True)  # patient, admin, physician, nutritionist, nurse, system_admin
    
    # Application access control
    primary_application = Column(String, default="health_platform", nullable=False)  # "health_platform" or "admin_portal"
    
    # Patient-specific fields (only used if role = patient/user)
    language = Column(String, default="en", nullable=False)
    profile_type = Column(String, nullable=True)  # Only for patients
    journey_type = Column(String, nullable=True)  # Only for patients
    
    # Common fields
    system_id = Column(String, ForeignKey("systems.id", ondelete="CASCADE"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    system = relationship("System", back_populates="users")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    lab_results = relationship("LabResult", back_populates="user", cascade="all, delete-orphan")
    action_plans = relationship("ActionPlan", back_populates="user", cascade="all, delete-orphan")
    consultations = relationship("Consultation", back_populates="user", cascade="all, delete-orphan")
    
    # Staff profile (if user is a healthcare provider)
    staff_profile = relationship("Staff", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # Clinical records (patient perspective)
    soap_notes = relationship("SOAPNote", back_populates="patient", foreign_keys="SOAPNote.patient_id", cascade="all, delete-orphan")
    nutrition_assessments = relationship("NutritionAssessment", back_populates="patient", foreign_keys="NutritionAssessment.patient_id", cascade="all, delete-orphan")
    vitals_records = relationship("VitalsRecord", back_populates="patient", foreign_keys="VitalsRecord.patient_id", cascade="all, delete-orphan")
    lab_orders = relationship("LabTestOrder", back_populates="patient", foreign_keys="LabTestOrder.patient_id", cascade="all, delete-orphan")
    meal_plans = relationship("MealPlan", back_populates="patient", foreign_keys="MealPlan.patient_id", cascade="all, delete-orphan")
    nutrition_feedback = relationship("NutritionFeedback", back_populates="patient", foreign_keys="NutritionFeedback.patient_id", cascade="all, delete-orphan")
    medical_history = relationship("MedicalHistory", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="patient", foreign_keys="Medication.patient_id", cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="refresh_tokens")
