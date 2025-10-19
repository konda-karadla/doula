from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_tenant_access, CurrentUser
from app.schemas.lab import LabResultResponse, BiomarkerResponse
from app.services.labs_service import LabsService

router = APIRouter()


@router.post("/upload", response_model=LabResultResponse, status_code=status.HTTP_201_CREATED)
async def upload_lab(
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    labs_service = LabsService(db)
    return await labs_service.upload_lab(file, current_user.userId, current_user.systemId, notes)


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
