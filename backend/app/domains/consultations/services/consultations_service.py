from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from fastapi import HTTPException, status
from datetime import datetime, timedelta

from app.shared.models import Consultation, Doctor, ConsultationType, ConsultationStatus
from app.shared.schemas.consultation import (
    DoctorResponse, BookConsultationRequest, ConsultationResponse, 
    RescheduleConsultationRequest, AvailableSlot
)


class ConsultationsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_consultations(self, user_id: str, system_id: str) -> List[ConsultationResponse]:
        result = await self.db.execute(
            select(Consultation)
            .where(Consultation.user_id == user_id)
            .where(Consultation.system_id == system_id)
            .order_by(Consultation.scheduled_at.desc())
        )
        consultations = result.scalars().all()
        return [self._consultation_to_response(consultation) for consultation in consultations]

    async def book_consultation(self, data: BookConsultationRequest, user_id: str, system_id: str) -> ConsultationResponse:
        # Verify doctor exists and belongs to system
        doctor_result = await self.db.execute(
            select(Doctor)
            .where(Doctor.id == data.doctorId)
            .where(Doctor.system_id == system_id)
        )
        doctor = doctor_result.scalar_one_or_none()
        
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        # Check if time slot is available
        existing_consultation = await self.db.execute(
            select(Consultation)
            .where(Consultation.doctor_id == data.doctorId)
            .where(Consultation.scheduled_at == data.scheduledAt)
            .where(Consultation.status.in_([ConsultationStatus.SCHEDULED, ConsultationStatus.CONFIRMED]))
        )
        
        if existing_consultation.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Time slot is not available"
            )

        # Create consultation
        consultation = Consultation(
            user_id=user_id,
            doctor_id=data.doctorId,
            system_id=system_id,
            consultation_type=data.consultationType,
            scheduled_at=data.scheduledAt,
            status=ConsultationStatus.SCHEDULED,
            notes=data.notes,
            symptoms=data.symptoms
        )

        self.db.add(consultation)
        await self.db.commit()
        await self.db.refresh(consultation)

        return self._consultation_to_response(consultation)

    async def reschedule_consultation(self, consultation_id: str, data: RescheduleConsultationRequest, user_id: str, system_id: str) -> ConsultationResponse:
        # Get existing consultation
        result = await self.db.execute(
            select(Consultation)
            .where(Consultation.id == consultation_id)
            .where(Consultation.user_id == user_id)
            .where(Consultation.system_id == system_id)
        )
        consultation = result.scalar_one_or_none()
        
        if not consultation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consultation not found"
            )

        if consultation.status not in [ConsultationStatus.SCHEDULED, ConsultationStatus.CONFIRMED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot reschedule consultation in current status"
            )

        # Check if new time slot is available
        existing_consultation = await self.db.execute(
            select(Consultation)
            .where(Consultation.doctor_id == consultation.doctor_id)
            .where(Consultation.scheduled_at == data.newScheduledAt)
            .where(Consultation.id != consultation_id)
            .where(Consultation.status.in_([ConsultationStatus.SCHEDULED, ConsultationStatus.CONFIRMED]))
        )
        
        if existing_consultation.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New time slot is not available"
            )

        # Update consultation
        consultation.scheduled_at = data.newScheduledAt
        consultation.updated_at = datetime.now()

        await self.db.commit()
        await self.db.refresh(consultation)

        return self._consultation_to_response(consultation)

    async def cancel_consultation(self, consultation_id: str, user_id: str, system_id: str) -> None:
        result = await self.db.execute(
            select(Consultation)
            .where(Consultation.id == consultation_id)
            .where(Consultation.user_id == user_id)
            .where(Consultation.system_id == system_id)
        )
        consultation = result.scalar_one_or_none()
        
        if not consultation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consultation not found"
            )

        if consultation.status in [ConsultationStatus.COMPLETED, ConsultationStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel consultation in current status"
            )

        consultation.status = ConsultationStatus.CANCELLED
        consultation.updated_at = datetime.now()

        await self.db.commit()

    async def get_available_slots(self, doctor_id: str, date: str) -> List[AvailableSlot]:
        # Parse date
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )

        # Verify doctor exists
        doctor_result = await self.db.execute(
            select(Doctor).where(Doctor.id == doctor_id)
        )
        doctor = doctor_result.scalar_one_or_none()
        
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        # Get existing consultations for the date
        start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        result = await self.db.execute(
            select(Consultation)
            .where(Consultation.doctor_id == doctor_id)
            .where(Consultation.scheduled_at >= start_of_day)
            .where(Consultation.scheduled_at < end_of_day)
            .where(Consultation.status.in_([ConsultationStatus.SCHEDULED, ConsultationStatus.CONFIRMED]))
        )
        existing_consultations = result.scalars().all()
        
        # Generate available slots (30-minute slots from 9 AM to 5 PM)
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

    def _consultation_to_response(self, consultation: Consultation) -> ConsultationResponse:
        return ConsultationResponse(
            id=consultation.id,
            doctorId=consultation.doctor_id,
            consultationType=consultation.consultation_type,
            scheduledAt=consultation.scheduled_at,
            status=consultation.status,
            notes=consultation.notes,
            symptoms=consultation.symptoms,
            createdAt=consultation.created_at,
            updatedAt=consultation.updated_at
        )
