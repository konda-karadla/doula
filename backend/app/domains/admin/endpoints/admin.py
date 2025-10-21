from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_admin, CurrentUser
from app.domains.admin.schemas.admin import (
    CreateUserRequest,
    UpdateUserRequest,
    AdminUserResponse,
    SystemConfigUpdate,
    SystemConfigResponse,
    UserAnalytics,
    LabAnalytics,
    ActionPlanAnalytics
)
from app.shared.schemas.enums import UserRole
from app.domains.admin.services.admin_service import AdminService

router = APIRouter()


# ============================================================================
# User Management Endpoints
# ============================================================================

@router.get("/users", response_model=List[AdminUserResponse])
async def get_all_users(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all users in the system"""
    admin_service = AdminService(db)
    return await admin_service.get_all_users(current_user.systemId)


@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def get_user_by_id(
    user_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific user by ID"""
    admin_service = AdminService(db)
    return await admin_service.get_user_by_id(user_id, current_user.systemId)


@router.post("/users", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: CreateUserRequest,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Create a new user"""
    admin_service = AdminService(db)
    return await admin_service.create_user(user_data, current_user.systemId)


@router.put("/users/{user_id}", response_model=AdminUserResponse)
async def update_user(
    user_id: str,
    update_data: UpdateUserRequest,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update user information"""
    admin_service = AdminService(db)
    return await admin_service.update_user(user_id, update_data, current_user.systemId)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Delete a user"""
    admin_service = AdminService(db)
    return await admin_service.delete_user(user_id, current_user.systemId)


# ============================================================================
# Analytics and Dashboard Endpoints
# ============================================================================

@router.get("/analytics/users", response_model=UserAnalytics)
async def get_user_analytics(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get user analytics for the system"""
    admin_service = AdminService(db)
    return await admin_service.get_user_analytics(current_user.systemId)


@router.get("/analytics/labs", response_model=LabAnalytics)
async def get_lab_analytics(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get lab analytics for the system"""
    admin_service = AdminService(db)
    return await admin_service.get_lab_analytics(current_user.systemId)


@router.get("/analytics/action-plans", response_model=ActionPlanAnalytics)
async def get_action_plan_analytics(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get action plan analytics for the system"""
    admin_service = AdminService(db)
    return await admin_service.get_action_plan_analytics(current_user.systemId)


@router.get("/analytics/comprehensive", response_model=Dict[str, Any])
async def get_comprehensive_analytics(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive system analytics for admin dashboard"""
    admin_service = AdminService(db)
    return await admin_service.get_comprehensive_analytics(current_user.systemId)
