from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from backend.models.user import User
from backend.models.lab_result import LabResult
from backend.models.action_plan import ActionPlan, ActionItem
from backend.schemas.profile import UserProfileResponse, HealthStatsResponse


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile(self, user_id: str, system_id: str) -> UserProfileResponse:
        result = await self.db.execute(
            select(User)
            .where(User.id == user_id)
            .where(User.system_id == system_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserProfileResponse.from_orm_with_camel(user)

    async def get_health_stats(self, user_id: str, system_id: str) -> HealthStatsResponse:
        # Get total lab results
        lab_count_result = await self.db.execute(
            select(func.count(LabResult.id))
            .where(LabResult.user_id == user_id)
            .where(LabResult.system_id == system_id)
        )
        total_labs = lab_count_result.scalar() or 0

        # Get total action plans
        plan_count_result = await self.db.execute(
            select(func.count(ActionPlan.id))
            .where(ActionPlan.user_id == user_id)
            .where(ActionPlan.system_id == system_id)
        )
        total_plans = plan_count_result.scalar() or 0

        # Get completed action items
        completed_items_result = await self.db.execute(
            select(func.count(ActionItem.id))
            .join(ActionPlan, ActionItem.action_plan_id == ActionPlan.id)
            .where(ActionPlan.user_id == user_id)
            .where(ActionPlan.system_id == system_id)
            .where(ActionItem.status == "completed")
        )
        completed_items = completed_items_result.scalar() or 0

        # Get pending action items
        pending_items_result = await self.db.execute(
            select(func.count(ActionItem.id))
            .join(ActionPlan, ActionItem.action_plan_id == ActionPlan.id)
            .where(ActionPlan.user_id == user_id)
            .where(ActionPlan.system_id == system_id)
            .where(ActionItem.status == "pending")
        )
        pending_items = pending_items_result.scalar() or 0

        # Get last lab upload
        last_upload_result = await self.db.execute(
            select(LabResult.uploaded_at)
            .where(LabResult.user_id == user_id)
            .where(LabResult.system_id == system_id)
            .order_by(LabResult.uploaded_at.desc())
            .limit(1)
        )
        last_upload = last_upload_result.scalar_one_or_none()

        return HealthStatsResponse.create(
            total_labs=total_labs,
            total_plans=total_plans,
            completed_items=completed_items,
            pending_items=pending_items,
            last_upload=last_upload
        )
