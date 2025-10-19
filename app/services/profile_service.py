import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.models.user import User
from app.models.lab_result import LabResult
from app.models.action_plan import ActionPlan, ActionItem
from app.schemas.profile import UserProfileResponse, HealthStatsResponse

logger = logging.getLogger(__name__)


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile(self, user_id: str, system_id: str) -> UserProfileResponse:
        result = await self.db.execute(
            select(User).where(
                User.id == user_id,
                User.system_id == system_id
            )
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )

        return UserProfileResponse.from_orm_with_camel(user)

    async def get_health_stats(self, user_id: str, system_id: str) -> HealthStatsResponse:
        result = await self.db.execute(
            select(User).where(
                User.id == user_id,
                User.system_id == system_id
            )
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )

        result = await self.db.execute(
            select(func.count(LabResult.id))
            .where(
                LabResult.user_id == user_id,
                LabResult.system_id == system_id
            )
        )
        total_labs = result.scalar_one()

        result = await self.db.execute(
            select(func.count(ActionPlan.id))
            .where(
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id
            )
        )
        total_plans = result.scalar_one()

        result = await self.db.execute(
            select(func.count(ActionItem.id))
            .join(ActionPlan, ActionItem.action_plan_id == ActionPlan.id)
            .where(
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id,
                ActionItem.completed_at.isnot(None)
            )
        )
        completed_items = result.scalar_one()

        result = await self.db.execute(
            select(func.count(ActionItem.id))
            .join(ActionPlan, ActionItem.action_plan_id == ActionPlan.id)
            .where(
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id,
                ActionItem.completed_at.is_(None)
            )
        )
        pending_items = result.scalar_one()

        result = await self.db.execute(
            select(LabResult.uploaded_at)
            .where(
                LabResult.user_id == user_id,
                LabResult.system_id == system_id
            )
            .order_by(LabResult.uploaded_at.desc())
            .limit(1)
        )
        last_upload = result.scalar_one_or_none()

        return HealthStatsResponse.create(
            total_labs=total_labs,
            total_plans=total_plans,
            completed_items=completed_items,
            pending_items=pending_items,
            last_upload=last_upload
        )
