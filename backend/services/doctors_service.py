from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta

from models.consultation import Doctor, Consultation, ConsultationStatus
from schemas.consultation import DoctorResponse, AvailableSlot


class DoctorsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_doctors(self, system_id: str) -> List[DoctorResponse]:
        result = await self.db.execute(
            select(Doctor)
            .where(Doctor.system_id == system_id)
            .order_by(Doctor.name)
        )
        doctors = result.scalars().all()
        return [self._doctor_to_response(doctor) for doctor in doctors]

    async def get_doctor_availability(self, doctor_id: str, system_id: str, date: datetime) -> List[AvailableSlot]:
        # Verify doctor exists
        doctor_result = await self.db.execute(
            select(Doctor)
            .where(Doctor.id == doctor_id)
            .where(Doctor.system_id == system_id)
        )
        doctor = doctor_result.scalar_one_or_none()
        
        if not doctor:
            return []

        # Get existing consultations for the date
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        result = await self.db.execute(
            select(Consultation)
            .where(Consultation.doctor_id == doctor_id)
            .where(Consultation.scheduled_at >= start_of_day)
            .where(Consultation.scheduled_at < end_of_day)
            .where(Consultation.status.in_([ConsultationStatus.SCHEDULED, ConsultationStatus.CONFIRMED]))
        )
        existing_consultations = result.scalars().all()
        
        # Generate available slots (simplified - 30-minute slots from 9 AM to 5 PM)
        available_slots = []
        current_time = start_of_day.replace(hour=9, minute=0)
        end_time = start_of_day.replace(hour=17, minute=0)
        
        while current_time < end_time:
            # Check if this slot is available
            slot_available = True
            for consultation in existing_consultations:
                consultation_start = consultation.scheduled_at
                consultation_end = consultation_start + timedelta(minutes=consultation.duration_minutes)
                
                if (current_time < consultation_end and 
                    current_time + timedelta(minutes=30) > consultation_start):
                    slot_available = False
                    break
            
            if slot_available:
                available_slots.append(AvailableSlot(
                    startTime=current_time,
                    endTime=current_time + timedelta(minutes=30),
                    durationMinutes=30
                ))
            
            current_time += timedelta(minutes=30)
        
        return available_slots

    def _doctor_to_response(self, doctor: Doctor) -> DoctorResponse:
        return DoctorResponse(
            id=doctor.id,
            name=doctor.name,
            specialty=doctor.specialty,
            bio=doctor.bio,
            experienceYears=doctor.experience_years,
            rating=doctor.rating,
            consultationFee=doctor.consultation_fee,
            availableForVideo=doctor.available_for_video,
            availableForPhone=doctor.available_for_phone,
            availableForInPerson=doctor.available_for_in_person,
            createdAt=doctor.created_at,
            updatedAt=doctor.updated_at
        )
