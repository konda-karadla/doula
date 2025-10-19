from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field

from backend.models.consultation import ConsultationType, ConsultationStatus


class DoctorBase(BaseModel):
    name: str
    specialization: str
    bio: Optional[str] = None
    qualifications: Optional[List[str]] = None
    experience: int
    consultation_fee: Decimal = Field(..., decimal_places=2)
    image_url: Optional[str] = None


class DoctorCreate(DoctorBase):
    pass


class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    bio: Optional[str] = None
    qualifications: Optional[List[str]] = None
    experience: Optional[int] = None
    consultation_fee: Optional[Decimal] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class DoctorResponse(DoctorBase):
    id: str
    system_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AvailabilitySlotBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")


class AvailabilitySlotCreate(AvailabilitySlotBase):
    pass


class AvailabilitySlotResponse(AvailabilitySlotBase):
    id: str
    doctor_id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class BookConsultationRequest(BaseModel):
    doctor_id: str
    scheduled_at: datetime
    type: ConsultationType = ConsultationType.VIDEO
    duration: int = Field(default=30, ge=15, le=120)


class RescheduleConsultationRequest(BaseModel):
    scheduled_at: datetime


class UpdateConsultationRequest(BaseModel):
    status: Optional[ConsultationStatus] = None
    notes: Optional[str] = None
    prescription: Optional[str] = None
    meeting_link: Optional[str] = None


class ConsultationResponse(BaseModel):
    id: str
    user_id: str
    doctor_id: str
    scheduled_at: datetime
    duration: int
    type: ConsultationType
    status: ConsultationStatus
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    prescription: Optional[str] = None
    fee: Decimal
    is_paid: bool
    created_at: datetime
    updated_at: datetime
    doctor: Optional[DoctorResponse] = None

    class Config:
        from_attributes = True


class AvailableSlot(BaseModel):
    start_time: str
    end_time: str
    is_available: bool
