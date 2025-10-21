from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from core.database import Base
from schemas.enums import LabTestCategory


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    system_id = Column(String, ForeignKey("systems.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # New fields for enhanced lab integration
    ordered_by = Column(String, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True, index=True)
    lab_name = Column(String, nullable=True)
    lab_test_type = Column(String, nullable=True)
    test_category = Column(SQLEnum(LabTestCategory), nullable=True, index=True)
    
    # File information
    file_name = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)
    s3_url = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    processing_status = Column(String, default="pending", nullable=False)
    raw_ocr_text = Column(Text, nullable=True)
    
    # Review and interpretation
    is_reviewed = Column(Boolean, default=False, nullable=False)
    reviewed_by = Column(String, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    physician_notes = Column(Text, nullable=True)
    interpretation = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="lab_results")
    system = relationship("System", back_populates="lab_results")
    biomarkers = relationship("Biomarker", back_populates="lab_result", cascade="all, delete-orphan")
    ordering_staff = relationship("Staff", foreign_keys=[ordered_by])
    reviewed_by_staff = relationship("Staff", back_populates="lab_reviews", foreign_keys=[reviewed_by])


class Biomarker(Base):
    __tablename__ = "biomarkers"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    lab_result_id = Column(String, ForeignKey("lab_results.id", ondelete="CASCADE"), nullable=False, index=True)
    test_name = Column(String, nullable=False, index=True)
    value = Column(String, nullable=False)
    unit = Column(String, nullable=True)
    reference_range_low = Column(String, nullable=True)
    reference_range_high = Column(String, nullable=True)
    test_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String, nullable=True)
    
    # Enhanced fields for better tracking
    is_critical = Column(Boolean, default=False, nullable=False)
    physician_comment = Column(Text, nullable=True)
    trend_direction = Column(String, nullable=True)  # "up", "down", "stable"
    previous_value = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    lab_result = relationship("LabResult", back_populates="biomarkers")
