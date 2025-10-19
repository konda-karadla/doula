from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from fastapi import HTTPException, status

from app.models.consultation import Doctor, AvailabilitySlot, Consultation, ConsultationStatus
from app.schemas.consultation import DoctorCreate, DoctorUpdate, AvailabilitySlotCreate


class DoctorsService:
    @staticmethod
    async def create(
        db: AsyncSession,
        system_id: str,
        doctor_data: DoctorCreate
    ) -> Doctor:
        qualifications_str = ",".join(doctor_data.qualifications) if doctor_data.qualifications else None

        doctor = Doctor(
            system_id=system_id,
            name=doctor_data.name,
            specialization=doctor_data.specialization,
            bio=doctor_data.bio,
            qualifications=qualifications_str,
            experience=doctor_data.experience,
            consultation_fee=doctor_data.consultation_fee,
            image_url=doctor_data.image_url,
            is_active=True
        )

        db.add(doctor)
        await db.commit()
        await db.refresh(doctor)

        return doctor

    @staticmethod
    async def find_all(
        db: AsyncSession,
        system_id: str,
        include_inactive: bool = False
    ) -> List[Doctor]:
        stmt = select(Doctor).where(Doctor.system_id == system_id)

        if not include_inactive:
            stmt = stmt.where(Doctor.is_active == True)

        stmt = stmt.order_by(Doctor.name)

        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def find_one(
        db: AsyncSession,
        doctor_id: str,
        system_id: str
    ) -> Doctor:
        stmt = select(Doctor).where(
            and_(
                Doctor.id == doctor_id,
                Doctor.system_id == system_id
            )
        )

        result = await db.execute(stmt)
        doctor = result.scalar_one_or_none()

        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        return doctor

    @staticmethod
    async def update(
        db: AsyncSession,
        doctor_id: str,
        system_id: str,
        update_data: DoctorUpdate
    ) -> Doctor:
        doctor = await DoctorsService.find_one(db, doctor_id, system_id)

        update_dict = update_data.model_dump(exclude_unset=True)

        if "qualifications" in update_dict and update_dict["qualifications"]:
            update_dict["qualifications"] = ",".join(update_dict["qualifications"])

        for field, value in update_dict.items():
            setattr(doctor, field, value)

        await db.commit()
        await db.refresh(doctor)

        return doctor

    @staticmethod
    async def remove(
        db: AsyncSession,
        doctor_id: str,
        system_id: str
    ) -> dict:
        doctor = await DoctorsService.find_one(db, doctor_id, system_id)

        upcoming_stmt = select(Consultation).where(
            and_(
                Consultation.doctor_id == doctor_id,
                Consultation.status.in_([
                    ConsultationStatus.SCHEDULED,
                    ConsultationStatus.CONFIRMED
                ])
            )
        )
        upcoming_result = await db.execute(upcoming_stmt)
        if upcoming_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete doctor with upcoming consultations"
            )

        await db.delete(doctor)
        await db.commit()

        return {"message": "Doctor deleted successfully"}

    @staticmethod
    async def toggle(
        db: AsyncSession,
        doctor_id: str,
        system_id: str
    ) -> Doctor:
        doctor = await DoctorsService.find_one(db, doctor_id, system_id)

        doctor.is_active = not doctor.is_active

        await db.commit()
        await db.refresh(doctor)

        return doctor

    @staticmethod
    async def set_availability(
        db: AsyncSession,
        doctor_id: str,
        system_id: str,
        availability_slots: List[AvailabilitySlotCreate]
    ) -> List[AvailabilitySlot]:
        doctor = await DoctorsService.find_one(db, doctor_id, system_id)

        delete_stmt = delete(AvailabilitySlot).where(
            AvailabilitySlot.doctor_id == doctor_id
        )
        await db.execute(delete_stmt)

        new_slots = []
        for slot_data in availability_slots:
            slot = AvailabilitySlot(
                doctor_id=doctor_id,
                day_of_week=slot_data.day_of_week,
                start_time=slot_data.start_time,
                end_time=slot_data.end_time,
                is_active=True
            )
            new_slots.append(slot)
            db.add(slot)

        await db.commit()

        for slot in new_slots:
            await db.refresh(slot)

        return new_slots
