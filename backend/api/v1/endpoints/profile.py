from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import verify_tenant_access, CurrentUser
from schemas.profile import UserProfileResponse, HealthStatsResponse
from services.profile_service import ProfileService

router = APIRouter()


@router.get("", response_model=UserProfileResponse)
async def get_profile(
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ProfileService(db)
    return await service.get_profile(current_user.userId, current_user.systemId)


@router.get("/stats", response_model=HealthStatsResponse)
async def get_health_stats(
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ProfileService(db)
    return await service.get_health_stats(current_user.userId, current_user.systemId)
