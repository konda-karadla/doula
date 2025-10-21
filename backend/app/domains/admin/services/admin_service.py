from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, or_, asc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import hashlib

from app.domains.user.models.user import User
from app.domains.staff.models.staff import Staff, Department
from app.domains.system.models.system import System
from app.domains.system.models.system_config import SystemConfig, FeatureFlag
from app.domains.lab.models.lab_result import LabResult
from app.domains.action_plans.models.action_plan import ActionPlan, ActionItem
from app.domains.admin.schemas.admin import (
    CreateUserRequest, UpdateUserRequest, AdminUserResponse,
    SystemConfigUpdate, SystemConfigResponse, UserAnalytics,
    LabAnalytics, ActionPlanAnalytics
)
from app.shared.schemas.enums import UserRole, StaffType


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
            profile_type=data.profile_type,
            journey_type=data.journey_type,
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
        if data.first_name is not None:
            user.first_name = data.first_name
        if data.last_name is not None:
            user.last_name = data.last_name
        if data.phone_number is not None:
            user.phone_number = data.phone_number
        if data.is_active is not None:
            user.is_active = data.is_active

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

    async def get_user_analytics(self, system_id: str) -> UserAnalytics:
        # Total users
        total_users_result = await self.db.execute(
            select(func.count(User.id)).where(User.system_id == system_id)
        )
        total_users = total_users_result.scalar() or 0

        # New users this month
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_users_result = await self.db.execute(
            select(func.count(User.id))
            .where(User.system_id == system_id)
            .where(User.created_at >= month_start)
        )
        new_users_this_month = new_users_result.scalar() or 0

        # Active users (users with activity in last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        active_users_result = await self.db.execute(
            select(func.count(func.distinct(User.id)))
            .where(User.system_id == system_id)
            .where(User.updated_at >= thirty_days_ago)
        )
        active_users = active_users_result.scalar() or 0

        return UserAnalytics(
            total_users=total_users,
            new_users_this_month=new_users_this_month,
            active_users=active_users,
            users_by_role={},  # Simplified for now
            users_by_profile_type={}  # Simplified for now
        )

    async def get_lab_analytics(self, system_id: str) -> LabAnalytics:
        # Total lab results
        total_labs_result = await self.db.execute(
            select(func.count(LabResult.id)).where(LabResult.system_id == system_id)
        )
        total_labs = total_labs_result.scalar() or 0

        # Lab results this month
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
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
            total_labs=total_labs,
            pending_labs=pending_labs,
            processed_labs=completed_labs,
            labs_this_month=labs_this_month,
            processing_rate=100.0 if total_labs == 0 else (completed_labs / total_labs) * 100
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

        # Completed action plans
        completed_plans_result = await self.db.execute(
            select(func.count(ActionPlan.id))
            .where(ActionPlan.system_id == system_id)
            .where(ActionPlan.status == "completed")
        )
        completed_plans = completed_plans_result.scalar() or 0

        # Plans this month
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        plans_this_month_result = await self.db.execute(
            select(func.count(ActionPlan.id))
            .where(ActionPlan.system_id == system_id)
            .where(ActionPlan.created_at >= month_start)
        )
        plans_this_month = plans_this_month_result.scalar() or 0

        return ActionPlanAnalytics(
            total_plans=total_plans,
            active_plans=active_plans,
            completed_plans=completed_plans,
            plans_this_month=plans_this_month,
            completion_rate=100.0 if total_plans == 0 else (completed_plans / total_plans) * 100
        )

    async def get_comprehensive_analytics(self, system_id: str) -> Dict[str, Any]:
        """Get comprehensive system analytics"""
        # User analytics
        user_analytics = await self.get_user_analytics(system_id)
        
        # Lab analytics
        lab_analytics = await self.get_lab_analytics(system_id)
        
        # Action plan analytics
        action_plan_analytics = await self.get_action_plan_analytics(system_id)

        return {
            "users": {
                "total": user_analytics.total_users,
                "active": user_analytics.active_users,
                "new_this_month": user_analytics.new_users_this_month
            },
            "labs": {
                "total": lab_analytics.total_labs,
                "pending": lab_analytics.pending_labs,
                "completed": lab_analytics.processed_labs
            },
            "action_plans": {
                "total": action_plan_analytics.total_plans,
                "active": action_plan_analytics.active_plans,
                "completed": action_plan_analytics.completed_plans
            }
        }

    # Helper methods
    
    def _user_to_admin_response(self, user: User) -> AdminUserResponse:
        return AdminUserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            role=user.role,
            profile_type=user.profile_type,
            journey_type=user.journey_type,
            system_id=user.system_id,
            first_name=getattr(user, 'first_name', None),
            last_name=getattr(user, 'last_name', None),
            phone_number=getattr(user, 'phone_number', None),
            is_active=getattr(user, 'is_active', True),
            created_at=user.created_at,
            updated_at=user.updated_at
        )
