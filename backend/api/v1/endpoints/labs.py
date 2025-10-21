from fastapi import APIRouter, Depends, UploadFile, File, Form, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from core.database import get_db
from core.dependencies import get_current_user, verify_tenant_access, CurrentUser
from schemas.lab import LabResultResponse, BiomarkerResponse
from schemas.lab_order import (
    LabResultWithBiomarkers, LabResultWithDetails, LabResultListFilter,
    LabResultListResponse, LabResultReview, BiomarkerCreate, BiomarkerUpdate
)
from services.labs_service import LabsService

router = APIRouter()


@router.post("/upload", response_model=LabResultResponse, status_code=status.HTTP_201_CREATED)
async def upload_lab(
    file: UploadFile = File(...),
    ordered_by: Optional[str] = Form(None, description="Physician who ordered the test"),
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    labs_service = LabsService(db)
    return await labs_service.upload_lab(file, current_user.userId, current_user.systemId, ordered_by)


@router.get("", response_model=List[LabResultResponse])
async def get_lab_results(
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    labs_service = LabsService(db)
    return await labs_service.get_lab_results(current_user.userId, current_user.systemId)


@router.get("/{id}", response_model=LabResultResponse)
async def get_lab_result(
    id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    labs_service = LabsService(db)
    return await labs_service.get_lab_result(id, current_user.userId, current_user.systemId)


@router.get("/{id}/biomarkers", response_model=List[BiomarkerResponse])
async def get_biomarkers(
    id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    labs_service = LabsService(db)
    return await labs_service.get_biomarkers(id, current_user.userId, current_user.systemId)


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_lab_result(
    id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    labs_service = LabsService(db)
    await labs_service.delete_lab_result(id, current_user.userId, current_user.systemId)
    return {"message": "Lab result deleted successfully"}


# ============================================================================
# Enhanced Lab Result Management with Review Workflow
# ============================================================================

@router.get("/list", response_model=LabResultListResponse)
async def list_lab_results(
    user_id: Optional[str] = Query(None, description="Filter by patient ID"),
    ordered_by: Optional[str] = Query(None, description="Filter by ordering physician"),
    reviewed_by: Optional[str] = Query(None, description="Filter by reviewing physician"),
    test_category: Optional[str] = Query(None, description="Filter by test category"),
    is_reviewed: Optional[bool] = Query(None, description="Filter by review status"),
    start_date: Optional[str] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (ISO format)"),
    has_critical: Optional[bool] = Query(None, description="Filter results with critical biomarkers"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """List lab results with filtering and pagination"""
    from datetime import date
    
    # Parse dates if provided
    parsed_start_date = None
    parsed_end_date = None
    if start_date:
        try:
            parsed_start_date = date.fromisoformat(start_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use ISO date format (YYYY-MM-DD)."
            )
    if end_date:
        try:
            parsed_end_date = date.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use ISO date format (YYYY-MM-DD)."
            )

    filters = LabResultListFilter(
        user_id=user_id,
        ordered_by=ordered_by,
        reviewed_by=reviewed_by,
        test_category=test_category,
        is_reviewed=is_reviewed,
        start_date=parsed_start_date,
        end_date=parsed_end_date,
        has_critical=has_critical,
        skip=skip,
        limit=limit
    )

    labs_service = LabsService(db)
    return await labs_service.list_lab_results(filters, current_user.systemId)


@router.get("/{id}/detailed", response_model=LabResultWithBiomarkers)
async def get_lab_result_detailed(
    id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Get lab result with all biomarkers and details"""
    labs_service = LabsService(db)
    return await labs_service.get_lab_result_with_biomarkers(id, current_user.systemId)


@router.post("/{id}/review", response_model=LabResultResponse)
async def review_lab_result(
    id: str,
    review_data: LabResultReview,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Physician review and sign-off on lab result"""
    labs_service = LabsService(db)
    return await labs_service.review_lab_result(id, review_data, current_user.systemId)


@router.post("/{id}/biomarkers", response_model=BiomarkerResponse, status_code=status.HTTP_201_CREATED)
async def create_biomarker(
    id: str,
    biomarker_data: BiomarkerCreate,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Create a new biomarker for a lab result"""
    # Set the lab_result_id from the URL parameter
    biomarker_data.lab_result_id = id
    
    labs_service = LabsService(db)
    return await labs_service.create_biomarker(biomarker_data, current_user.systemId)


@router.put("/biomarkers/{biomarker_id}", response_model=BiomarkerResponse)
async def update_biomarker(
    biomarker_id: str,
    update_data: BiomarkerUpdate,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Update a biomarker"""
    labs_service = LabsService(db)
    return await labs_service.update_biomarker(biomarker_id, update_data, current_user.systemId)


@router.get("/unreviewed", response_model=List[LabResultWithBiomarkers])
async def get_unreviewed_results(
    limit: int = Query(50, ge=1, le=100, description="Number of results to return"),
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Get unreviewed lab results for physician dashboard"""
    labs_service = LabsService(db)
    return await labs_service.get_unreviewed_results(current_user.systemId, limit)


@router.get("/critical", response_model=List[LabResultWithBiomarkers])
async def get_critical_results(
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Get lab results with critical biomarkers"""
    labs_service = LabsService(db)
    return await labs_service.get_critical_results(current_user.systemId, limit)
