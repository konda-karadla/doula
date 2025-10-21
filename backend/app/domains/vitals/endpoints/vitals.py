"""
API endpoints for Vitals Recording (Nurse data capture)
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, CurrentUser
from app.shared.schemas.vitals import (
    VitalsRecordCreate,
    VitalsRecordUpdate,
    VitalsAlertAcknowledge,
    VitalsRecordResponse,
    VitalsRecordWithDetails,
    VitalsAlertResponse,
    VitalsRecordListFilter,
    VitalsRecordListResponse,
    VitalsStats,
    PatientVitalsTrends
)
from app.domains.vitals.services.vitals_service import VitalsService

router = APIRouter()


@router.get("/", response_model=VitalsRecordListResponse)
async def list_vitals_records(
    filters: VitalsRecordListFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    List vitals records with filters and pagination
    
    **Permissions:** Nurses and Admins can view all records. Patients see only their own.
    """
    service = VitalsService(db)
    
    # Check if user is staff
    is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
    
    try:
        records, total = await service.list_vitals_records(filters, current_user.userId, is_staff)
        
        return VitalsRecordListResponse(
            items=records,
            total=total,
            skip=filters.skip or 0,
            limit=filters.limit or 100,
            has_more=(filters.skip or 0) + len(records) < total
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/", response_model=VitalsRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_vitals_record(
    vitals_data: VitalsRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Create a new vitals record
    
    **Permissions:** Nurses and Admins can create records for any patient.
    """
    service = VitalsService(db)
    
    try:
        return await service.create_vitals_record(vitals_data, current_user.userId)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{record_id}", response_model=VitalsRecordWithDetails)
async def get_vitals_record(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get a vitals record with details
    
    **Permissions:** Nurses and Admins can view any record. Patients see only their own.
    """
    service = VitalsService(db)
    
    try:
        return await service.get_vitals_record(record_id, current_user.systemId)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{record_id}", response_model=VitalsRecordResponse)
async def update_vitals_record(
    record_id: str,
    update_data: VitalsRecordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update a vitals record
    
    **Permissions:** Nurses and Admins can update any record.
    """
    service = VitalsService(db)
    
    try:
        return await service.update_vitals_record(record_id, update_data, current_user.systemId)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/patients/{patient_id}/trends", response_model=PatientVitalsTrends)
async def get_patient_vitals_trends(
    patient_id: str,
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get vitals trends for a specific patient
    
    **Permissions:** Nurses and Admins can view trends for any patient. Patients see only their own.
    """
    service = VitalsService(db)
    
    # Check if user is staff
    is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
    
    if not is_staff and current_user.userId != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only view your own vitals trends"
        )
    
    try:
        return await service.get_patient_vitals_trends(patient_id, days, current_user.systemId)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/stats", response_model=VitalsStats)
async def get_vitals_stats(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get vitals statistics for the system
    
    **Permissions:** Nurses and Admins only.
    """
    # Check if user is staff
    is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
    
    if not is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Only staff members can view system statistics"
        )
    
    service = VitalsService(db)
    
    try:
        return await service.get_vitals_stats(current_user.systemId)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/alerts/{alert_id}/acknowledge", response_model=VitalsAlertResponse)
async def acknowledge_vitals_alert(
    alert_id: str,
    acknowledge_data: VitalsAlertAcknowledge,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Acknowledge a vitals alert
    
    **Permissions:** Nurses and Admins only.
    """
    # Check if user is staff
    is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
    
    if not is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Only staff members can acknowledge alerts"
        )
    
    service = VitalsService(db)
    
    try:
        return await service.acknowledge_vitals_alert(alert_id, acknowledge_data, current_user.systemId)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
