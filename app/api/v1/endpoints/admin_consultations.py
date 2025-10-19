from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_admin, CurrentUser
from app.schemas.consultation import (
    DoctorCreate,
    DoctorUpdate,
    DoctorResponse,
    AvailabilitySlotCreate,
    AvailabilitySlotResponse,
    UpdateConsultationRequest,
    ConsultationResponse
)
from app.services.consultations_service import ConsultationsService
from app.services.doctors_service import DoctorsService

router = APIRouter()


@router.post("/doctors", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    doctor_data: DoctorCreate,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await DoctorsService.create(db, current_user.systemId, doctor_data)


@router.get("/doctors", response_model=List[DoctorResponse])
async def get_all_doctors(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await DoctorsService.find_all(db, current_user.systemId, include_inactive=True)


@router.get("/doctors/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(
    doctor_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await DoctorsService.find_one(db, doctor_id, current_user.systemId)


@router.put("/doctors/{doctor_id}", response_model=DoctorResponse)
async def update_doctor(
    doctor_id: str,
    doctor_data: DoctorUpdate,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await DoctorsService.update(db, doctor_id, current_user.systemId, doctor_data)


@router.delete("/doctors/{doctor_id}")
async def delete_doctor(
    doctor_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await DoctorsService.remove(db, doctor_id, current_user.systemId)


@router.put("/doctors/{doctor_id}/toggle", response_model=DoctorResponse)
async def toggle_doctor(
    doctor_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await DoctorsService.toggle(db, doctor_id, current_user.systemId)


@router.post("/doctors/{doctor_id}/availability", response_model=List[AvailabilitySlotResponse])
async def set_doctor_availability(
    doctor_id: str,
    availability: List[AvailabilitySlotCreate],
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await DoctorsService.set_availability(db, doctor_id, current_user.systemId, availability)


@router.get("/consultations", response_model=List[ConsultationResponse])
async def get_all_consultations(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await ConsultationsService.find_all_for_admin(db, current_user.systemId)


@router.get("/consultations/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(
    consultation_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await ConsultationsService.find_one(db, consultation_id)


@router.put("/consultations/{consultation_id}", response_model=ConsultationResponse)
async def update_consultation(
    consultation_id: str,
    update_data: UpdateConsultationRequest,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await ConsultationsService.update_status(db, consultation_id, update_data)
