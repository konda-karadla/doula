"""
Pydantic schemas for SOAP Notes (Physician clinical documentation)
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

from schemas.enums import SOAPNoteStatus, AttachmentType


# ============================================================================
# SOAP Note Attachment Schemas
# ============================================================================

class SOAPNoteAttachmentBase(BaseModel):
    """Base schema for SOAP note attachments"""
    file_type: AttachmentType = Field(..., description="Type of attachment")
    file_url: str = Field(..., description="S3 URL or path to file")
    file_name: str = Field(..., max_length=255, description="Original file name")
    description: Optional[str] = Field(None, max_length=500, description="Description of attachment")


class SOAPNoteAttachmentCreate(SOAPNoteAttachmentBase):
    """Schema for creating an attachment"""
    soap_note_id: str = Field(..., description="SOAP note ID this attachment belongs to")


class SOAPNoteAttachmentResponse(SOAPNoteAttachmentBase):
    """Schema for attachment response"""
    id: str
    soap_note_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# SOAP Note Schemas
# ============================================================================

class SOAPNoteBase(BaseModel):
    """Base schema for SOAP notes"""
    visit_date: datetime = Field(..., description="Date and time of visit")
    chief_complaint: str = Field(..., min_length=1, max_length=500, description="Patient's chief complaint")
    
    # SOAP sections
    subjective: str = Field(..., description="Subjective section - patient's description of symptoms")
    objective: str = Field(..., description="Objective section - physician's observations and exam findings")
    assessment: str = Field(..., description="Assessment section - diagnosis and clinical impressions")
    plan: str = Field(..., description="Plan section - treatment plan and recommendations")
    
    follow_up_date: Optional[datetime] = Field(None, description="Next follow-up appointment date")
    notes: Optional[str] = Field(None, description="Additional notes")


class SOAPNoteCreate(SOAPNoteBase):
    """Schema for creating a SOAP note"""
    patient_id: str = Field(..., description="Patient ID (User ID)")
    physician_id: str = Field(..., description="Physician ID (Staff ID)")
    consultation_id: Optional[str] = Field(None, description="Link to consultation if applicable")


class SOAPNoteUpdate(BaseModel):
    """Schema for updating a SOAP note"""
    visit_date: Optional[datetime] = None
    chief_complaint: Optional[str] = Field(None, min_length=1, max_length=500)
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None
    status: Optional[SOAPNoteStatus] = None


class SOAPNoteSign(BaseModel):
    """Schema for signing a SOAP note"""
    digital_signature: str = Field(..., description="Physician's digital signature")
    signed_by: str = Field(..., description="Physician name")


class SOAPNoteResponse(SOAPNoteBase):
    """Schema for SOAP note response"""
    id: str
    patient_id: str
    physician_id: str
    consultation_id: Optional[str]
    status: SOAPNoteStatus
    
    # Signature info
    digital_signature: Optional[str]
    signed_at: Optional[datetime]
    signed_by: Optional[str]
    
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SOAPNoteWithAttachments(SOAPNoteResponse):
    """Schema for SOAP note with attachments"""
    attachments: list[SOAPNoteAttachmentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class SOAPNoteWithDetails(SOAPNoteResponse):
    """Schema for SOAP note with patient and physician details"""
    patient_name: str
    patient_email: str
    physician_name: str
    physician_credentials: Optional[str]
    attachments: list[SOAPNoteAttachmentResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# List/Filter Schemas
# ============================================================================

class SOAPNoteListFilter(BaseModel):
    """Schema for filtering SOAP notes"""
    patient_id: Optional[str] = Field(None, description="Filter by patient")
    physician_id: Optional[str] = Field(None, description="Filter by physician")
    status: Optional[SOAPNoteStatus] = Field(None, description="Filter by status")
    consultation_id: Optional[str] = Field(None, description="Filter by consultation")
    
    start_date: Optional[datetime] = Field(None, description="Filter by visit date (start)")
    end_date: Optional[datetime] = Field(None, description="Filter by visit date (end)")
    
    search: Optional[str] = Field(None, description="Search in chief complaint or notes")
    
    skip: int = Field(0, ge=0, description="Number of records to skip")
    limit: int = Field(100, ge=1, le=1000, description="Number of records to return")


class SOAPNoteListResponse(BaseModel):
    """Schema for paginated SOAP note list"""
    items: list[SOAPNoteWithDetails]
    total: int
    skip: int
    limit: int
    has_more: bool

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Statistics/Summary Schemas
# ============================================================================

class SOAPNoteStats(BaseModel):
    """Statistics for SOAP notes"""
    total_notes: int
    draft_notes: int
    completed_notes: int
    signed_notes: int
    notes_this_month: int
    notes_this_week: int


class PatientSOAPNoteSummary(BaseModel):
    """Summary of SOAP notes for a patient"""
    patient_id: str
    patient_name: str
    total_notes: int
    last_visit_date: Optional[datetime]
    last_physician: Optional[str]
    recent_notes: list[SOAPNoteResponse] = []

