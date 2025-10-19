from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_admin, CurrentUser
from app.schemas.admin import (
    CreateUserRequest,
    UpdateUserRequest,
    AdminUserResponse,
    SystemConfigUpdate,
    SystemConfigResponse,
    UserAnalytics,
    LabAnalytics,
    ActionPlanAnalytics
)
from app.schemas.lab import LabResultResponse
from app.schemas.action_plan import ActionPlanResponse, ActionItemResponse
from app.services.admin_service import AdminService

router = APIRouter()


@router.get("/users", response_model=List[AdminUserResponse])
async def get_all_users(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.get_all_users(db, current_user.systemId)


@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def get_user_by_id(
    user_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.get_user_by_id(db, user_id)


@router.post("/users", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: CreateUserRequest,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.create_user(db, user_data)


@router.put("/users/{user_id}", response_model=AdminUserResponse)
async def update_user(
    user_id: str,
    update_data: UpdateUserRequest,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.update_user(db, user_id, update_data)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.delete_user(db, user_id)


@router.get("/systems")
async def get_systems(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.get_systems(db)


@router.get("/system-config", response_model=List[SystemConfigResponse])
async def get_system_config(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.get_system_config(db, current_user.systemId)


@router.put("/system-config", response_model=SystemConfigResponse)
async def update_system_config(
    config_data: SystemConfigUpdate,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.update_system_config(db, current_user.systemId, config_data)


@router.get("/analytics/users", response_model=UserAnalytics)
async def get_user_analytics(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.get_user_analytics(db, current_user.systemId)


@router.get("/analytics/labs", response_model=LabAnalytics)
async def get_lab_analytics(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.get_lab_analytics(db, current_user.systemId)


@router.get("/analytics/action-plans", response_model=ActionPlanAnalytics)
async def get_action_plan_analytics(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.get_action_plan_analytics(db, current_user.systemId)


@router.get("/lab-results", response_model=List[LabResultResponse])
async def get_all_lab_results(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.get_all_lab_results(db, current_user.systemId)


@router.get("/action-plans", response_model=List[ActionPlanResponse])
async def get_all_action_plans(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.get_all_action_plans(db, current_user.systemId)


@router.get("/action-plans/{action_plan_id}", response_model=ActionPlanResponse)
async def get_action_plan_by_id(
    action_plan_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.get_action_plan_by_id(db, action_plan_id)


@router.get("/action-plans/{action_plan_id}/items", response_model=List[ActionItemResponse])
async def get_action_plan_items(
    action_plan_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await AdminService.get_action_plan_items(db, action_plan_id)
