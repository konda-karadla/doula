from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import get_db
from backend.core.dependencies import get_current_user, CurrentUser
from backend.schemas.consultation import (
    DoctorResponse,
    BookConsultationRequest,
    ConsultationResponse,
    RescheduleConsultationRequest,
    AvailableSlot
)
from backend.services.consultations_service import ConsultationsService
from backend.services.doctors_service import DoctorsService

router = APIRouter()


@router.get("/doctors", response_model=List[DoctorResponse])
async def get_doctors(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await DoctorsService.find_all(db, current_user.systemId, include_inactive=False)


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
    return await ConsultationsService.get_available_slots(db, doctor_id, date)


@router.post("/book", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
async def book_consultation(
    booking_data: BookConsultationRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await ConsultationsService.book(db, current_user.userId, current_user.systemId, booking_data)


@router.get("/my-bookings", response_model=List[ConsultationResponse])
async def get_my_bookings(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await ConsultationsService.find_all_for_user(db, current_user.userId)


@router.get("/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(
    consultation_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await ConsultationsService.find_one(db, consultation_id, current_user.userId)


@router.put("/{consultation_id}/reschedule", response_model=ConsultationResponse)
async def reschedule_consultation(
    consultation_id: str,
    reschedule_data: RescheduleConsultationRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await ConsultationsService.reschedule(db, consultation_id, current_user.userId, reschedule_data)


@router.delete("/{consultation_id}/cancel", response_model=ConsultationResponse)
async def cancel_consultation(
    consultation_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await ConsultationsService.cancel(db, consultation_id, current_user.userId)
