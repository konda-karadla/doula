from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base
from schemas.enums import SOAPNoteStatus, AttachmentType


class SOAPNote(Base):
    """SOAP (Subjective, Objective, Assessment, Plan) clinical notes by physicians"""
    __tablename__ = "soap_notes"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    patient_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    physician_id = Column(String, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)
    consultation_id = Column(String, ForeignKey("consultations.id", ondelete="SET NULL"), nullable=True, index=True)
    
    visit_date = Column(DateTime(timezone=True), nullable=False, index=True)
    chief_complaint = Column(Text, nullable=True)
    
    # SOAP sections
    subjective = Column(Text, nullable=True)  # Patient's description of symptoms
    objective = Column(Text, nullable=True)   # Physician's observations and exam findings
    assessment = Column(Text, nullable=True)  # Diagnosis and clinical impressions
    plan = Column(Text, nullable=True)        # Treatment plan and recommendations
    
    follow_up_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(SQLEnum(SOAPNoteStatus), default=SOAPNoteStatus.DRAFT, nullable=False, index=True)
    
    # Digital signature
    signed_at = Column(DateTime(timezone=True), nullable=True)
    signature_data = Column(String, nullable=True)  # Could store signature image reference
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("User", back_populates="soap_notes", foreign_keys=[patient_id])
    physician = relationship("Staff", back_populates="soap_notes")
    consultation = relationship("Consultation", back_populates="soap_notes")
    attachments = relationship("SOAPNoteAttachment", back_populates="soap_note", cascade="all, delete-orphan")


class SOAPNoteAttachment(Base):
    """Attachments for SOAP notes (images, documents, audio recordings)"""
    __tablename__ = "soap_note_attachments"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    soap_note_id = Column(String, ForeignKey("soap_notes.id", ondelete="CASCADE"), nullable=False, index=True)
    
    file_type = Column(SQLEnum(AttachmentType), nullable=False)
    file_name = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)
    s3_url = Column(String, nullable=False)
    file_size = Column(String, nullable=True)  # e.g., "1.5 MB"
    description = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    soap_note = relationship("SOAPNote", back_populates="attachments")

