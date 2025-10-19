from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_
from fastapi import HTTPException, status

from app.models.user import User
from app.models.system import System
from app.models.system_config import SystemConfig
from app.models.lab_result import LabResult
from app.models.action_plan import ActionPlan, ActionItem
from app.schemas.admin import (
    CreateUserRequest,
    UpdateUserRequest,
    SystemConfigUpdate,
    UserAnalytics,
    LabAnalytics,
    ActionPlanAnalytics
)
from app.core.security import get_password_hash


class AdminService:
    @staticmethod
    async def get_all_users(
        db: AsyncSession,
        system_id: Optional[str] = None
    ) -> List[User]:
        stmt = select(User)

        if system_id:
            stmt = stmt.where(User.system_id == system_id)

        stmt = stmt.order_by(User.created_at.desc())

        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_user_by_id(
        db: AsyncSession,
        user_id: str
    ) -> User:
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return user

    @staticmethod
    async def create_user(
        db: AsyncSession,
        user_data: CreateUserRequest
    ) -> User:
        existing_stmt = select(User).where(
            or_(
                User.email == user_data.email,
                User.username == user_data.username
            )
        )
        existing_result = await db.execute(existing_stmt)
        if existing_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email or username already exists"
            )

        hashed_password = get_password_hash(user_data.password)

        user = User(
            email=user_data.email,
            username=user_data.username,
            password=hashed_password,
            role=user_data.role,
            profile_type=user_data.profile_type,
            journey_type=user_data.journey_type,
            system_id=user_data.system_id
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

        return user

    @staticmethod
    async def update_user(
        db: AsyncSession,
        user_id: str,
        update_data: UpdateUserRequest
    ) -> User:
        user = await AdminService.get_user_by_id(db, user_id)

        update_dict = update_data.model_dump(exclude_unset=True)

        for field, value in update_dict.items():
            setattr(user, field, value)

        await db.commit()
        await db.refresh(user)

        return user

    @staticmethod
    async def delete_user(
        db: AsyncSession,
        user_id: str
    ) -> dict:
        user = await AdminService.get_user_by_id(db, user_id)

        if user.role == "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete admin users"
            )

        await db.delete(user)
        await db.commit()

        return {"message": "User deleted successfully"}

    @staticmethod
    async def get_systems(db: AsyncSession) -> List[System]:
        stmt = select(System).order_by(System.name)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_system_config(
        db: AsyncSession,
        system_id: str
    ) -> List[SystemConfig]:
        stmt = select(SystemConfig).where(
            SystemConfig.system_id == system_id
        ).order_by(SystemConfig.config_key)

        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def update_system_config(
        db: AsyncSession,
        system_id: str,
        config_data: SystemConfigUpdate
    ) -> SystemConfig:
        stmt = select(SystemConfig).where(
            and_(
                SystemConfig.system_id == system_id,
                SystemConfig.config_key == config_data.config_key
            )
        )
        result = await db.execute(stmt)
        config = result.scalar_one_or_none()

        if config:
            config.config_value = config_data.config_value
            config.data_type = config_data.data_type
        else:
            config = SystemConfig(
                system_id=system_id,
                config_key=config_data.config_key,
                config_value=config_data.config_value,
                data_type=config_data.data_type
            )
            db.add(config)

        await db.commit()
        await db.refresh(config)

        return config

    @staticmethod
    async def get_user_analytics(
        db: AsyncSession,
        system_id: Optional[str] = None
    ) -> UserAnalytics:
        stmt = select(func.count(User.id))
        if system_id:
            stmt = stmt.where(User.system_id == system_id)

        total_result = await db.execute(stmt)
        total_users = total_result.scalar() or 0

        one_month_ago = datetime.utcnow() - timedelta(days=30)
        new_users_stmt = select(func.count(User.id)).where(
            User.created_at >= one_month_ago
        )
        if system_id:
            new_users_stmt = new_users_stmt.where(User.system_id == system_id)

        new_users_result = await db.execute(new_users_stmt)
        new_users = new_users_result.scalar() or 0

        roles_stmt = select(User.role, func.count(User.id)).group_by(User.role)
        if system_id:
            roles_stmt = roles_stmt.where(User.system_id == system_id)

        roles_result = await db.execute(roles_stmt)
        users_by_role = {row[0]: row[1] for row in roles_result}

        profile_stmt = select(User.profile_type, func.count(User.id)).group_by(User.profile_type)
        if system_id:
            profile_stmt = profile_stmt.where(User.system_id == system_id)

        profile_result = await db.execute(profile_stmt)
        users_by_profile_type = {row[0]: row[1] for row in profile_result}

        return UserAnalytics(
            total_users=total_users,
            active_users=total_users,
            new_users_this_month=new_users,
            users_by_role=users_by_role,
            users_by_profile_type=users_by_profile_type
        )

    @staticmethod
    async def get_lab_analytics(
        db: AsyncSession,
        system_id: Optional[str] = None
    ) -> LabAnalytics:
        stmt = select(func.count(LabResult.id))
        if system_id:
            stmt = stmt.where(LabResult.system_id == system_id)

        total_result = await db.execute(stmt)
        total_labs = total_result.scalar() or 0

        pending_stmt = select(func.count(LabResult.id)).where(
            LabResult.processing_status == "pending"
        )
        if system_id:
            pending_stmt = pending_stmt.where(LabResult.system_id == system_id)

        pending_result = await db.execute(pending_stmt)
        pending_labs = pending_result.scalar() or 0

        processed_stmt = select(func.count(LabResult.id)).where(
            LabResult.processing_status == "completed"
        )
        if system_id:
            processed_stmt = processed_stmt.where(LabResult.system_id == system_id)

        processed_result = await db.execute(processed_stmt)
        processed_labs = processed_result.scalar() or 0

        one_month_ago = datetime.utcnow() - timedelta(days=30)
        month_stmt = select(func.count(LabResult.id)).where(
            LabResult.created_at >= one_month_ago
        )
        if system_id:
            month_stmt = month_stmt.where(LabResult.system_id == system_id)

        month_result = await db.execute(month_stmt)
        labs_this_month = month_result.scalar() or 0

        processing_rate = (processed_labs / total_labs * 100) if total_labs > 0 else 0.0

        return LabAnalytics(
            total_labs=total_labs,
            pending_labs=pending_labs,
            processed_labs=processed_labs,
            labs_this_month=labs_this_month,
            processing_rate=round(processing_rate, 2)
        )

    @staticmethod
    async def get_action_plan_analytics(
        db: AsyncSession,
        system_id: Optional[str] = None
    ) -> ActionPlanAnalytics:
        stmt = select(func.count(ActionPlan.id))
        if system_id:
            stmt = stmt.where(ActionPlan.system_id == system_id)

        total_result = await db.execute(stmt)
        total_plans = total_result.scalar() or 0

        active_stmt = select(func.count(ActionPlan.id)).where(
            ActionPlan.status == "active"
        )
        if system_id:
            active_stmt = active_stmt.where(ActionPlan.system_id == system_id)

        active_result = await db.execute(active_stmt)
        active_plans = active_result.scalar() or 0

        completed_stmt = select(func.count(ActionPlan.id)).where(
            ActionPlan.status == "completed"
        )
        if system_id:
            completed_stmt = completed_stmt.where(ActionPlan.system_id == system_id)

        completed_result = await db.execute(completed_stmt)
        completed_plans = completed_result.scalar() or 0

        one_month_ago = datetime.utcnow() - timedelta(days=30)
        month_stmt = select(func.count(ActionPlan.id)).where(
            ActionPlan.created_at >= one_month_ago
        )
        if system_id:
            month_stmt = month_stmt.where(ActionPlan.system_id == system_id)

        month_result = await db.execute(month_stmt)
        plans_this_month = month_result.scalar() or 0

        completion_rate = (completed_plans / total_plans * 100) if total_plans > 0 else 0.0

        return ActionPlanAnalytics(
            total_plans=total_plans,
            active_plans=active_plans,
            completed_plans=completed_plans,
            plans_this_month=plans_this_month,
            completion_rate=round(completion_rate, 2)
        )

    @staticmethod
    async def get_all_lab_results(
        db: AsyncSession,
        system_id: Optional[str] = None
    ) -> List[LabResult]:
        stmt = select(LabResult)

        if system_id:
            stmt = stmt.where(LabResult.system_id == system_id)

        stmt = stmt.order_by(LabResult.uploaded_at.desc())

        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_all_action_plans(
        db: AsyncSession,
        system_id: Optional[str] = None
    ) -> List[ActionPlan]:
        stmt = select(ActionPlan)

        if system_id:
            stmt = stmt.where(ActionPlan.system_id == system_id)

        stmt = stmt.order_by(ActionPlan.created_at.desc())

        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_action_plan_by_id(
        db: AsyncSession,
        action_plan_id: str
    ) -> ActionPlan:
        stmt = select(ActionPlan).where(ActionPlan.id == action_plan_id)
        result = await db.execute(stmt)
        plan = result.scalar_one_or_none()

        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action plan not found"
            )

        return plan

    @staticmethod
    async def get_action_plan_items(
        db: AsyncSession,
        action_plan_id: str
    ) -> List[ActionItem]:
        stmt = select(ActionItem).where(
            ActionItem.action_plan_id == action_plan_id
        ).order_by(ActionItem.created_at)

        result = await db.execute(stmt)
        return result.scalars().all()
