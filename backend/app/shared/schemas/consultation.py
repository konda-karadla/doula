from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

from models.consultation import ConsultationType, ConsultationStatus


class DoctorBase(BaseModel):
    """Base model for doctor information"""
    name: str = Field(..., min_length=1, max_length=100, description="Doctor's full name")
    specialization: str = Field(..., min_length=1, max_length=100, description="Medical specialization")
    bio: Optional[str] = Field(None, max_length=1000, description="Doctor's biography")
    qualifications: Optional[List[str]] = Field(None, description="List of doctor's qualifications")
    experience: int = Field(..., ge=0, le=50, description="Years of experience")
    consultation_fee: Decimal = Field(..., decimal_places=2, ge=0, description="Consultation fee in local currency")
    image_url: Optional[str] = Field(None, max_length=500, description="URL to doctor's profile image")


class DoctorCreate(DoctorBase):
    """Request model for creating a new doctor"""
    pass


class DoctorUpdate(BaseModel):
    """Request model for updating doctor information"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Updated doctor's name")
    specialization: Optional[str] = Field(None, min_length=1, max_length=100, description="Updated specialization")
    bio: Optional[str] = Field(None, max_length=1000, description="Updated biography")
    qualifications: Optional[List[str]] = Field(None, description="Updated qualifications list")
    experience: Optional[int] = Field(None, ge=0, le=50, description="Updated years of experience")
    consultation_fee: Optional[Decimal] = Field(None, decimal_places=2, ge=0, description="Updated consultation fee")
    image_url: Optional[str] = Field(None, max_length=500, description="Updated profile image URL")
    is_active: Optional[bool] = Field(None, description="Doctor's active status")


class DoctorResponse(DoctorBase):
    """Response model for doctor data"""
    id: str = Field(..., description="Unique identifier of the doctor")
    system_id: str = Field(..., description="ID of the system the doctor belongs to")
    is_active: bool = Field(..., description="Doctor's active status")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class AvailabilitySlotBase(BaseModel):
    """Base model for doctor availability slots"""
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)")
    start_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", description="Start time in HH:MM format")
    end_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", description="End time in HH:MM format")

    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v, info):
        if 'start_time' in info.data and v <= info.data['start_time']:
            raise ValueError('End time must be after start time')
        return v


class AvailabilitySlotCreate(AvailabilitySlotBase):
    """Request model for creating availability slots"""
    pass


class AvailabilitySlotResponse(AvailabilitySlotBase):
    """Response model for availability slot data"""
    id: str = Field(..., description="Unique identifier of the availability slot")
    doctor_id: str = Field(..., description="ID of the doctor")
    is_active: bool = Field(..., description="Slot's active status")
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        from_attributes = True


class BookConsultationRequest(BaseModel):
    """Request model for booking a consultation"""
    doctor_id: str = Field(..., description="ID of the doctor to book with")
    scheduled_at: datetime = Field(..., description="Preferred consultation date and time")
    type: ConsultationType = Field(default=ConsultationType.VIDEO, description="Type of consultation")
    duration: int = Field(default=30, ge=15, le=120, description="Consultation duration in minutes")

    @field_validator('scheduled_at')
    @classmethod
    def validate_scheduled_at(cls, v):
        if v < datetime.now():
            raise ValueError('Consultation cannot be scheduled in the past')
        return v


class RescheduleConsultationRequest(BaseModel):
    """Request model for rescheduling a consultation"""
    scheduled_at: datetime = Field(..., description="New consultation date and time")

    @field_validator('scheduled_at')
    @classmethod
    def validate_scheduled_at(cls, v):
        if v < datetime.now():
            raise ValueError('Consultation cannot be scheduled in the past')
        return v


class UpdateConsultationRequest(BaseModel):
    """Request model for updating consultation details"""
    status: Optional[ConsultationStatus] = Field(None, description="Updated consultation status")
    notes: Optional[str] = Field(None, max_length=2000, description="Consultation notes")
    prescription: Optional[str] = Field(None, max_length=2000, description="Prescription details")
    meeting_link: Optional[str] = Field(None, max_length=500, description="Meeting link for video consultations")


class ConsultationResponse(BaseModel):
    """Response model for consultation data"""
    id: str = Field(..., description="Unique identifier of the consultation")
    user_id: str = Field(..., description="ID of the user who booked the consultation")
    doctor_id: str = Field(..., description="ID of the doctor")
    scheduled_at: datetime = Field(..., description="Scheduled date and time")
    duration: int = Field(..., description="Consultation duration in minutes")
    type: ConsultationType = Field(..., description="Type of consultation")
    status: ConsultationStatus = Field(..., description="Current consultation status")
    meeting_link: Optional[str] = Field(None, description="Meeting link for video consultations")
    notes: Optional[str] = Field(None, description="Consultation notes")
    prescription: Optional[str] = Field(None, description="Prescription details")
    fee: Decimal = Field(..., description="Consultation fee")
    is_paid: bool = Field(..., description="Payment status")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    doctor: Optional[DoctorResponse] = Field(None, description="Doctor information")

    class Config:
        from_attributes = True


class AvailableSlot(BaseModel):
    """Response model for available consultation slots"""
    start_time: str = Field(..., description="Available start time")
    end_time: str = Field(..., description="Available end time")
    is_available: bool = Field(..., description="Whether the slot is available for booking")
