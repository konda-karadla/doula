from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from fastapi import HTTPException, status
from datetime import datetime, timedelta

from models.consultation import Consultation, Doctor, ConsultationType, ConsultationStatus
from schemas.consultation import (
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
            system_id=system_id,
            doctor_id=data.doctorId,
            consultation_type=ConsultationType(data.consultationType),
            scheduled_at=data.scheduledAt,
            duration_minutes=data.durationMinutes,
            notes=data.notes,
            status=ConsultationStatus.SCHEDULED
        )
        
        self.db.add(consultation)
        await self.db.commit()
        await self.db.refresh(consultation)
        
        return self._consultation_to_response(consultation)

    async def reschedule_consultation(self, consultation_id: str, data: RescheduleConsultationRequest, user_id: str, system_id: str) -> ConsultationResponse:
        # Get consultation
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
            .where(Consultation.scheduled_at == data.scheduledAt)
            .where(Consultation.id != consultation_id)
            .where(Consultation.status.in_([ConsultationStatus.SCHEDULED, ConsultationStatus.CONFIRMED]))
        )
        
        if existing_consultation.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Time slot is not available"
            )

        # Update consultation
        consultation.scheduled_at = data.scheduledAt
        consultation.duration_minutes = data.durationMinutes
        consultation.status = ConsultationStatus.SCHEDULED
        
        await self.db.commit()
        await self.db.refresh(consultation)
        
        return self._consultation_to_response(consultation)

    async def cancel_consultation(self, consultation_id: str, user_id: str, system_id: str) -> dict:
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
        await self.db.commit()
        
        return {"message": "Consultation cancelled successfully"}

    async def get_consultation(self, consultation_id: str, user_id: str, system_id: str) -> ConsultationResponse:
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
        
        return self._consultation_to_response(consultation)

    def _consultation_to_response(self, consultation: Consultation) -> ConsultationResponse:
        return ConsultationResponse(
            id=consultation.id,
            doctorId=consultation.doctor_id,
            consultationType=consultation.consultation_type.value,
            scheduledAt=consultation.scheduled_at,
            durationMinutes=consultation.duration_minutes,
            status=consultation.status.value,
            notes=consultation.notes,
            createdAt=consultation.created_at,
            updatedAt=consultation.updated_at
        )
