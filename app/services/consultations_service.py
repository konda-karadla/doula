from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import joinedload
from fastapi import HTTPException, status

from app.models.consultation import Consultation, ConsultationStatus, ConsultationType
from app.schemas.consultation import (
    BookConsultationRequest,
    RescheduleConsultationRequest,
    UpdateConsultationRequest,
    ConsultationResponse,
    AvailableSlot
)


class ConsultationsService:
    @staticmethod
    async def book(
        db: AsyncSession,
        user_id: str,
        system_id: str,
        booking_data: BookConsultationRequest
    ) -> Consultation:
        from app.models.consultation import Doctor

        doctor_stmt = select(Doctor).where(
            and_(
                Doctor.id == booking_data.doctor_id,
                Doctor.system_id == system_id,
                Doctor.is_active == True
            )
        )
        result = await db.execute(doctor_stmt)
        doctor = result.scalar_one_or_none()

        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found or inactive"
            )

        conflict_stmt = select(Consultation).where(
            and_(
                Consultation.doctor_id == booking_data.doctor_id,
                Consultation.scheduled_at == booking_data.scheduled_at,
                Consultation.status.in_([
                    ConsultationStatus.SCHEDULED,
                    ConsultationStatus.CONFIRMED,
                    ConsultationStatus.IN_PROGRESS
                ])
            )
        )
        conflict_result = await db.execute(conflict_stmt)
        if conflict_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This time slot is not available"
            )

        consultation = Consultation(
            user_id=user_id,
            doctor_id=booking_data.doctor_id,
            scheduled_at=booking_data.scheduled_at,
            duration=booking_data.duration,
            type=booking_data.type,
            fee=doctor.consultation_fee,
            status=ConsultationStatus.SCHEDULED
        )

        db.add(consultation)
        await db.commit()
        await db.refresh(consultation)

        return consultation

    @staticmethod
    async def find_all_for_user(
        db: AsyncSession,
        user_id: str
    ) -> List[Consultation]:
        stmt = (
            select(Consultation)
            .where(Consultation.user_id == user_id)
            .options(joinedload(Consultation.doctor))
            .order_by(Consultation.scheduled_at.desc())
        )
        result = await db.execute(stmt)
        return result.scalars().unique().all()

    @staticmethod
    async def find_all_for_admin(
        db: AsyncSession,
        system_id: str
    ) -> List[Consultation]:
        from app.models.consultation import Doctor

        stmt = (
            select(Consultation)
            .join(Doctor, Consultation.doctor_id == Doctor.id)
            .where(Doctor.system_id == system_id)
            .options(joinedload(Consultation.doctor))
            .order_by(Consultation.scheduled_at.desc())
        )
        result = await db.execute(stmt)
        return result.scalars().unique().all()

    @staticmethod
    async def find_one(
        db: AsyncSession,
        consultation_id: str,
        user_id: Optional[str] = None
    ) -> Consultation:
        stmt = (
            select(Consultation)
            .where(Consultation.id == consultation_id)
            .options(joinedload(Consultation.doctor))
        )

        if user_id:
            stmt = stmt.where(Consultation.user_id == user_id)

        result = await db.execute(stmt)
        consultation = result.scalar_one_or_none()

        if not consultation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consultation not found"
            )

        return consultation

    @staticmethod
    async def reschedule(
        db: AsyncSession,
        consultation_id: str,
        user_id: str,
        reschedule_data: RescheduleConsultationRequest
    ) -> Consultation:
        consultation = await ConsultationsService.find_one(db, consultation_id, user_id)

        if consultation.status not in [ConsultationStatus.SCHEDULED, ConsultationStatus.CONFIRMED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot reschedule consultation with current status"
            )

        conflict_stmt = select(Consultation).where(
            and_(
                Consultation.doctor_id == consultation.doctor_id,
                Consultation.scheduled_at == reschedule_data.scheduled_at,
                Consultation.id != consultation_id,
                Consultation.status.in_([
                    ConsultationStatus.SCHEDULED,
                    ConsultationStatus.CONFIRMED,
                    ConsultationStatus.IN_PROGRESS
                ])
            )
        )
        conflict_result = await db.execute(conflict_stmt)
        if conflict_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This time slot is not available"
            )

        consultation.scheduled_at = reschedule_data.scheduled_at
        await db.commit()
        await db.refresh(consultation)

        return consultation

    @staticmethod
    async def cancel(
        db: AsyncSession,
        consultation_id: str,
        user_id: str
    ) -> Consultation:
        consultation = await ConsultationsService.find_one(db, consultation_id, user_id)

        if consultation.status in [ConsultationStatus.COMPLETED, ConsultationStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel consultation with current status"
            )

        consultation.status = ConsultationStatus.CANCELLED
        await db.commit()
        await db.refresh(consultation)

        return consultation

    @staticmethod
    async def update_status(
        db: AsyncSession,
        consultation_id: str,
        update_data: UpdateConsultationRequest
    ) -> Consultation:
        consultation = await ConsultationsService.find_one(db, consultation_id)

        if update_data.status:
            consultation.status = update_data.status
        if update_data.notes is not None:
            consultation.notes = update_data.notes
        if update_data.prescription is not None:
            consultation.prescription = update_data.prescription
        if update_data.meeting_link is not None:
            consultation.meeting_link = update_data.meeting_link

        await db.commit()
        await db.refresh(consultation)

        return consultation

    @staticmethod
    async def get_available_slots(
        db: AsyncSession,
        doctor_id: str,
        date_str: str
    ) -> List[AvailableSlot]:
        from app.models.consultation import Doctor, AvailabilitySlot

        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )

        day_of_week = target_date.weekday()
        if day_of_week == 6:
            day_of_week = 0
        else:
            day_of_week += 1

        slots_stmt = select(AvailabilitySlot).where(
            and_(
                AvailabilitySlot.doctor_id == doctor_id,
                AvailabilitySlot.day_of_week == day_of_week,
                AvailabilitySlot.is_active == True
            )
        )
        result = await db.execute(slots_stmt)
        availability_slots = result.scalars().all()

        if not availability_slots:
            return []

        booked_stmt = select(Consultation).where(
            and_(
                Consultation.doctor_id == doctor_id,
                Consultation.scheduled_at >= datetime.combine(target_date, datetime.min.time()),
                Consultation.scheduled_at < datetime.combine(target_date + timedelta(days=1), datetime.min.time()),
                Consultation.status.in_([
                    ConsultationStatus.SCHEDULED,
                    ConsultationStatus.CONFIRMED,
                    ConsultationStatus.IN_PROGRESS
                ])
            )
        )
        booked_result = await db.execute(booked_stmt)
        booked_consultations = booked_result.scalars().all()

        booked_times = set(c.scheduled_at.time().strftime("%H:%M") for c in booked_consultations)

        available_slots = []
        for slot in availability_slots:
            available_slots.append(AvailableSlot(
                start_time=slot.start_time,
                end_time=slot.end_time,
                is_available=slot.start_time not in booked_times
            ))

        return available_slots
