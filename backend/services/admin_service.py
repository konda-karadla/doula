from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from fastapi import HTTPException, status
from datetime import datetime, timedelta

from backend.models.user import User
from backend.models.system import System
from backend.models.lab_result import LabResult
from backend.models.action_plan import ActionPlan, ActionItem
from backend.schemas.admin import (
    CreateUserRequest, UpdateUserRequest, AdminUserResponse,
    SystemConfigUpdate, SystemConfigResponse, UserAnalytics,
    LabAnalytics, ActionPlanAnalytics
)


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_users(self, system_id: str) -> List[AdminUserResponse]:
        result = await self.db.execute(
            select(User)
            .where(User.system_id == system_id)
            .order_by(User.created_at.desc())
        )
        users = result.scalars().all()
        return [self._user_to_admin_response(user) for user in users]

    async def create_user(self, data: CreateUserRequest, system_id: str) -> AdminUserResponse:
        # Check if user already exists
        result = await self.db.execute(
            select(User).where(User.email == data.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create user
        user = User(
            email=data.email,
            username=data.username,
            password=data.password,  # In real implementation, hash this
            role=data.role,
            language=data.language,
            profile_type=data.profileType,
            journey_type=data.journeyType,
            system_id=system_id
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return self._user_to_admin_response(user)

    async def update_user(self, user_id: str, data: UpdateUserRequest, system_id: str) -> AdminUserResponse:
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

        if data.email is not None:
            user.email = data.email
        if data.username is not None:
            user.username = data.username
        if data.role is not None:
            user.role = data.role
        if data.language is not None:
            user.language = data.language
        if data.profileType is not None:
            user.profile_type = data.profileType
        if data.journeyType is not None:
            user.journey_type = data.journeyType

        await self.db.commit()
        await self.db.refresh(user)

        return self._user_to_admin_response(user)

    async def delete_user(self, user_id: str, system_id: str) -> dict:
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

        await self.db.delete(user)
        await self.db.commit()

        return {"message": "User deleted successfully"}

    async def get_system_config(self, system_id: str) -> SystemConfigResponse:
        result = await self.db.execute(
            select(System).where(System.id == system_id)
        )
        system = result.scalar_one_or_none()
        
        if not system:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="System not found"
            )

        return SystemConfigResponse(
            id=system.id,
            name=system.name,
            slug=system.slug,
            createdAt=system.created_at,
            updatedAt=system.updated_at
        )

    async def update_system_config(self, system_id: str, data: SystemConfigUpdate) -> SystemConfigResponse:
        result = await self.db.execute(
            select(System).where(System.id == system_id)
        )
        system = result.scalar_one_or_none()
        
        if not system:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="System not found"
            )

        if data.name is not None:
            system.name = data.name
        if data.slug is not None:
            system.slug = data.slug

        await self.db.commit()
        await self.db.refresh(system)

        return SystemConfigResponse(
            id=system.id,
            name=system.name,
            slug=system.slug,
            createdAt=system.created_at,
            updatedAt=system.updated_at
        )

    async def get_user_analytics(self, system_id: str) -> UserAnalytics:
        # Total users
        total_users_result = await self.db.execute(
            select(func.count(User.id)).where(User.system_id == system_id)
        )
        total_users = total_users_result.scalar() or 0

        # New users this month
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_users_result = await self.db.execute(
            select(func.count(User.id))
            .where(User.system_id == system_id)
            .where(User.created_at >= month_start)
        )
        new_users_this_month = new_users_result.scalar() or 0

        # Active users (users with activity in last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_users_result = await self.db.execute(
            select(func.count(func.distinct(User.id)))
            .where(User.system_id == system_id)
            .where(User.updated_at >= thirty_days_ago)
        )
        active_users = active_users_result.scalar() or 0

        return UserAnalytics(
            totalUsers=total_users,
            newUsersThisMonth=new_users_this_month,
            activeUsers=active_users
        )

    async def get_lab_analytics(self, system_id: str) -> LabAnalytics:
        # Total lab results
        total_labs_result = await self.db.execute(
            select(func.count(LabResult.id)).where(LabResult.system_id == system_id)
        )
        total_labs = total_labs_result.scalar() or 0

        # Lab results this month
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        labs_this_month_result = await self.db.execute(
            select(func.count(LabResult.id))
            .where(LabResult.system_id == system_id)
            .where(LabResult.uploaded_at >= month_start)
        )
        labs_this_month = labs_this_month_result.scalar() or 0

        # Processing status breakdown
        pending_result = await self.db.execute(
            select(func.count(LabResult.id))
            .where(LabResult.system_id == system_id)
            .where(LabResult.processing_status == "pending")
        )
        pending_labs = pending_result.scalar() or 0

        completed_result = await self.db.execute(
            select(func.count(LabResult.id))
            .where(LabResult.system_id == system_id)
            .where(LabResult.processing_status == "completed")
        )
        completed_labs = completed_result.scalar() or 0

        return LabAnalytics(
            totalLabResults=total_labs,
            labResultsThisMonth=labs_this_month,
            pendingProcessing=pending_labs,
            completedProcessing=completed_labs
        )

    async def get_action_plan_analytics(self, system_id: str) -> ActionPlanAnalytics:
        # Total action plans
        total_plans_result = await self.db.execute(
            select(func.count(ActionPlan.id)).where(ActionPlan.system_id == system_id)
        )
        total_plans = total_plans_result.scalar() or 0

        # Active action plans
        active_plans_result = await self.db.execute(
            select(func.count(ActionPlan.id))
            .where(ActionPlan.system_id == system_id)
            .where(ActionPlan.status == "active")
        )
        active_plans = active_plans_result.scalar() or 0

        # Total action items
        total_items_result = await self.db.execute(
            select(func.count(ActionItem.id))
            .join(ActionPlan, ActionItem.action_plan_id == ActionPlan.id)
            .where(ActionPlan.system_id == system_id)
        )
        total_items = total_items_result.scalar() or 0

        # Completed action items
        completed_items_result = await self.db.execute(
            select(func.count(ActionItem.id))
            .join(ActionPlan, ActionItem.action_plan_id == ActionPlan.id)
            .where(ActionPlan.system_id == system_id)
            .where(ActionItem.status == "completed")
        )
        completed_items = completed_items_result.scalar() or 0

        return ActionPlanAnalytics(
            totalActionPlans=total_plans,
            activeActionPlans=active_plans,
            totalActionItems=total_items,
            completedActionItems=completed_items
        )

    def _user_to_admin_response(self, user: User) -> AdminUserResponse:
        return AdminUserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            role=user.role,
            language=user.language,
            profileType=user.profile_type,
            journeyType=user.journey_type,
            createdAt=user.created_at,
            updatedAt=user.updated_at
        )
