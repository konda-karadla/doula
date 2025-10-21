from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Enum as SQLEnum, Integer, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base
from schemas.enums import StaffType


class Staff(Base):
    """Healthcare staff members (physicians, nutritionists, nurses, admins)"""
    __tablename__ = "staff"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    system_id = Column(String, ForeignKey("systems.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(String, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    
    staff_type = Column(SQLEnum(StaffType), nullable=False, index=True)
    license_number = Column(String, nullable=True)
    credentials = Column(String, nullable=True)  # e.g., "MD, FACP" or "RD, CDE"
    specialization = Column(String, nullable=True)  # e.g., "Cardiology", "Clinical Nutrition"
    
    hire_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="staff_profile")
    system = relationship("System", back_populates="staff_members")
    department = relationship("Department", back_populates="staff_members")
    
    # Clinical documentation relationships
    soap_notes = relationship("SOAPNote", back_populates="physician", cascade="all, delete-orphan")
    nutrition_assessments = relationship("NutritionAssessment", back_populates="nutritionist", cascade="all, delete-orphan")
    vitals_records = relationship("VitalsRecord", back_populates="nurse", cascade="all, delete-orphan")
    lab_orders = relationship("LabTestOrder", back_populates="ordering_physician", foreign_keys="LabTestOrder.ordering_physician_id", cascade="all, delete-orphan")
    lab_reviews = relationship("LabResult", back_populates="reviewed_by_staff", foreign_keys="LabResult.reviewed_by")


class Department(Base):
    """Organizational departments within a healthcare system"""
    __tablename__ = "departments"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    system_id = Column(String, ForeignKey("systems.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    system = relationship("System", back_populates="departments")
    staff_members = relationship("Staff", back_populates="department")

