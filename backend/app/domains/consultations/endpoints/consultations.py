from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, CurrentUser
from app.shared.schemas.consultation import (
    DoctorResponse,
    BookConsultationRequest,
    ConsultationResponse,
    RescheduleConsultationRequest,
    AvailableSlot
)
from app.domains.consultations.services.consultations_service import ConsultationsService
from app.domains.consultations.services.doctors_service import DoctorsService

router = APIRouter()


@router.get("/doctors", response_model=List[DoctorResponse])
async def get_doctors(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = DoctorsService(db)
    return await service.get_doctors(current_user.systemId)


@router.get("/doctors/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(
    doctor_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await DoctorsService.find_one(db, doctor_id, current_user.systemId)


@router.get("/doctors/{doctor_id}/availability", response_model=List[AvailableSlot])
async def get_doctor_availability(
    doctor_id: str,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ConsultationsService(db)
    return await service.get_available_slots(doctor_id, date)


@router.post("/book", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
async def book_consultation(
    booking_data: BookConsultationRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ConsultationsService(db)
    return await service.book_consultation(booking_data, current_user.userId, current_user.systemId)


@router.get("/my-consultations", response_model=List[ConsultationResponse])
async def get_my_consultations(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ConsultationsService(db)
    return await service.get_user_consultations(current_user.userId, current_user.systemId)


@router.put("/{consultation_id}/reschedule", response_model=ConsultationResponse)
async def reschedule_consultation(
    consultation_id: str,
    reschedule_data: RescheduleConsultationRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ConsultationsService(db)
    return await service.reschedule_consultation(consultation_id, reschedule_data, current_user.userId, current_user.systemId)


@router.put("/{consultation_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_consultation(
    consultation_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ConsultationsService(db)
    await service.cancel_consultation(consultation_id, current_user.userId, current_user.systemId)
    return {"message": "Consultation cancelled successfully"}
