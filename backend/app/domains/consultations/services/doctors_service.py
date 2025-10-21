from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta

from app.shared.models import Doctor, Consultation, ConsultationStatus
from app.shared.schemas.consultation import DoctorResponse, AvailableSlot


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
        
        booked_times = {c.scheduled_at for c in existing_consultations}
        
        while current_time < end_time:
            if current_time not in booked_times:
                available_slots.append(AvailableSlot(
                    startTime=current_time,
                    endTime=current_time + timedelta(minutes=30),
                    isAvailable=True
                ))
            current_time += timedelta(minutes=30)
        
        return available_slots

    @staticmethod
    async def find_one(db: AsyncSession, doctor_id: str, system_id: str) -> DoctorResponse:
        result = await db.execute(
            select(Doctor)
            .where(Doctor.id == doctor_id)
            .where(Doctor.system_id == system_id)
        )
        doctor = result.scalar_one_or_none()
        
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )
        
        return DoctorsService._doctor_to_response(doctor)

    @staticmethod
    def _doctor_to_response(doctor: Doctor) -> DoctorResponse:
        return DoctorResponse(
            id=doctor.id,
            name=doctor.name,
            specialization=doctor.specialization,
            email=doctor.email,
            phone=doctor.phone,
            bio=doctor.bio,
            experience=doctor.experience,
            qualifications=doctor.qualifications,
            consultationFee=doctor.consultation_fee,
            isAvailable=doctor.is_available,
            createdAt=doctor.created_at,
            updatedAt=doctor.updated_at
        )
