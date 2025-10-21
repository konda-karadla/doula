from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from core.database import get_db
from core.dependencies import verify_tenant_access, CurrentUser
from schemas.insights import HealthInsightResponse, InsightsSummaryResponse, BiomarkerTrendResponse
from services.insights_service import InsightsService

router = APIRouter()


@router.get("/summary", response_model=InsightsSummaryResponse)
async def get_insights_summary(
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = InsightsService(db)
    return await service.get_insights_summary(current_user.userId, current_user.systemId)


@router.get("/lab-result/{labResultId}", response_model=List[HealthInsightResponse])
async def get_insights_for_lab_result(
    labResultId: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = InsightsService(db)
    return await service.generate_insights_for_lab_result(labResultId, current_user.userId, current_user.systemId)


@router.get("/trends/{testName}", response_model=BiomarkerTrendResponse)
async def get_biomarker_trends(
    testName: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = InsightsService(db)
    return await service.get_biomarker_trends(testName, current_user.userId, current_user.systemId)
