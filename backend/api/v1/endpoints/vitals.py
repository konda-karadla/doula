"""
API endpoints for Vitals Recording (Nurse data capture)
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from core.database import get_db
from core.dependencies import get_current_user, CurrentUser
from core.permissions import require_permission
from services.vitals_service import VitalsService
from schemas.vitals import (
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
from schemas.enums import ModuleCategory
from core.exceptions import NotFoundError, AuthorizationError, ValidationError

router = APIRouter()


@router.get("/", response_model=VitalsRecordListResponse)
@require_permission(ModuleCategory.NURSE, "view")
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
            skip=filters.skip,
            limit=filters.limit,
            has_more=(filters.skip + filters.limit) < total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=VitalsStats)
@require_permission(ModuleCategory.NURSE, "view")
async def get_vitals_stats(
    nurse_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get vitals statistics
    
    **Permissions:** Nurses can view their own stats, Admins can view any.
    """
    service = VitalsService(db)
    
    # If nurse_id not provided, use current user's nurse profile
    if not nurse_id:
        from models.staff import Staff
        from sqlalchemy import select
        result = await db.execute(
            select(Staff).where(Staff.user_id == current_user.userId)
        )
        staff = result.scalar_one_or_none()
        if staff:
            nurse_id = staff.id
    
    try:
        stats = await service.get_stats(nurse_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patients/{patient_id}/trends", response_model=PatientVitalsTrends)
@require_permission(ModuleCategory.NURSE, "view")
async def get_patient_trends(
    patient_id: str,
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get vital signs trends for a specific patient
    
    **Permissions:** Staff can view patient trends. Patients can view their own.
    """
    service = VitalsService(db)
    
    # Check if user is patient and requesting their own data
    is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
    if not is_staff and patient_id != current_user.userId:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own vitals trends"
        )
    
    try:
        trends = await service.get_patient_trends(patient_id, days)
        return trends
    except NotFoundError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{record_id}", response_model=VitalsRecordWithDetails)
@require_permission(ModuleCategory.NURSE, "view")
async def get_vitals_record(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get a specific vitals record by ID
    
    **Permissions:** Staff can view any record. Patients can view their own records.
    """
    service = VitalsService(db)
    
    try:
        record = await service.get_vitals_record(record_id, include_alerts=True)
        
        if not record:
            raise NotFoundError("Vitals Record", record_id)
        
        # Check resource ownership if not staff
        is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
        if not is_staff:
            # Patient can only view their own records
            if record.patient_id != current_user.userId:
                raise AuthorizationError("You don't have permission to view this record")
        
        return record
    
    except (NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=VitalsRecordResponse, status_code=status.HTTP_201_CREATED)
@require_permission(ModuleCategory.NURSE, "create")
async def create_vitals_record(
    vitals_data: VitalsRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Create a new vitals record
    
    **Permissions:** Only Nurses and Admins can create vitals records.
    **Note:** Automatically calculates BMI and creates alerts for abnormal readings.
    """
    service = VitalsService(db)
    
    try:
        record = await service.create_vitals_record(vitals_data, current_user.userId)
        return record
    
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{record_id}", response_model=VitalsRecordResponse)
@require_permission(ModuleCategory.NURSE, "update")
async def update_vitals_record(
    record_id: str,
    vitals_data: VitalsRecordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update a vitals record
    
    **Permissions:** Only the creating Nurse or Admin can update a record.
    **Note:** BMI is automatically recalculated if weight or height changes.
    """
    service = VitalsService(db)
    
    try:
        record = await service.update_vitals_record(record_id, vitals_data, current_user.userId)
        return record
    
    except (NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alerts/{alert_id}/acknowledge", response_model=VitalsAlertResponse)
@require_permission(ModuleCategory.NURSE, "update")
async def acknowledge_alert(
    alert_id: str,
    ack_data: VitalsAlertAcknowledge,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Acknowledge a vitals alert
    
    **Permissions:** Any staff member can acknowledge alerts.
    **Note:** Records who acknowledged and when, plus resolution notes.
    """
    service = VitalsService(db)
    
    try:
        alert = await service.acknowledge_alert(alert_id, ack_data, current_user.userId)
        return alert
    
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
@require_permission(ModuleCategory.NURSE, "delete")
async def delete_vitals_record(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Delete a vitals record
    
    **Permissions:** Only Admins can delete vitals records.
    **Note:** This is for data integrity. Nurses cannot delete their own records.
    """
    service = VitalsService(db)
    
    try:
        await service.delete_vitals_record(record_id)
        return None
    
    except NotFoundError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

