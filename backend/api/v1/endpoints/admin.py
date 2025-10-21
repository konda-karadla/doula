from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import require_admin, CurrentUser
from schemas.admin import (
    CreateUserRequest,
    UpdateUserRequest,
    AdminUserResponse,
    SystemConfigUpdate,
    SystemConfigResponse,
    UserAnalytics,
    LabAnalytics,
    ActionPlanAnalytics
)
from schemas.staff import (
    StaffRegistration, StaffRegistrationResponse, StaffUpdate, StaffFullDetails,
    StaffListFilter, StaffListResponse, DepartmentCreate, DepartmentUpdate,
    DepartmentResponse
)
from schemas.lab import LabResultResponse
from schemas.action_plan import ActionPlanResponse, ActionItemResponse
from schemas.enums import UserRole, StaffType
from services.admin_service import AdminService

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


@router.get("/users/search", response_model=List[AdminUserResponse])
async def search_users(
    q: str = Query(..., description="Search query"),
    limit: int = Query(50, ge=1, le=100, description="Number of results to return"),
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Search users by email, username, or name"""
    admin_service = AdminService(db)
    return await admin_service.search_users(q, current_user.systemId, limit)


@router.get("/users/role/{role}", response_model=List[AdminUserResponse])
async def get_users_by_role(
    role: UserRole,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all users with a specific role"""
    admin_service = AdminService(db)
    return await admin_service.get_users_by_role(role, current_user.systemId)


@router.post("/users/{user_id}/activate", response_model=AdminUserResponse)
async def activate_user(
    user_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Activate a user account"""
    admin_service = AdminService(db)
    return await admin_service.activate_user(user_id, current_user.systemId)


@router.post("/users/{user_id}/deactivate", response_model=AdminUserResponse)
async def deactivate_user(
    user_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Deactivate a user account"""
    admin_service = AdminService(db)
    return await admin_service.deactivate_user(user_id, current_user.systemId)


# ============================================================================
# Staff Management Endpoints
# ============================================================================

@router.post("/staff/register", response_model=StaffRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_staff(
    registration_data: StaffRegistration,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Register a new staff member (creates both User and Staff)"""
    admin_service = AdminService(db)
    return await admin_service.register_staff(registration_data)


@router.get("/staff", response_model=List[StaffFullDetails])
async def get_all_staff(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all staff members with full details"""
    admin_service = AdminService(db)
    return await admin_service.get_all_staff(current_user.systemId)


@router.get("/staff/{staff_id}", response_model=StaffFullDetails)
async def get_staff_by_id(
    staff_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific staff member by ID"""
    admin_service = AdminService(db)
    return await admin_service.get_staff_by_id(staff_id, current_user.systemId)


@router.put("/staff/{staff_id}", response_model=StaffFullDetails)
async def update_staff(
    staff_id: str,
    update_data: StaffUpdate,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update staff member information"""
    admin_service = AdminService(db)
    return await admin_service.update_staff(staff_id, update_data, current_user.systemId)


@router.delete("/staff/{staff_id}")
async def delete_staff(
    staff_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Delete a staff member"""
    admin_service = AdminService(db)
    return await admin_service.delete_staff(staff_id, current_user.systemId)


@router.get("/staff/list", response_model=StaffListResponse)
async def list_staff(
    staff_type: Optional[StaffType] = Query(None, description="Filter by staff type"),
    department_id: Optional[str] = Query(None, description="Filter by department"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by credentials, specialization, or license"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List staff members with filtering and pagination"""
    filters = StaffListFilter(
        staff_type=staff_type,
        department_id=department_id,
        is_active=is_active,
        search=search,
        skip=skip,
        limit=limit
    )
    
    admin_service = AdminService(db)
    return await admin_service.list_staff(filters, current_user.systemId)


# ============================================================================
# Department Management Endpoints
# ============================================================================

@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    department_data: DepartmentCreate,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Create a new department"""
    admin_service = AdminService(db)
    return await admin_service.create_department(department_data)


@router.get("/departments", response_model=List[DepartmentResponse])
async def get_all_departments(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all departments in the system"""
    admin_service = AdminService(db)
    return await admin_service.get_all_departments(current_user.systemId)


@router.get("/departments/{department_id}", response_model=DepartmentResponse)
async def get_department_by_id(
    department_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific department by ID"""
    admin_service = AdminService(db)
    return await admin_service.get_department_by_id(department_id, current_user.systemId)


@router.put("/departments/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: str,
    update_data: DepartmentUpdate,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update department information"""
    admin_service = AdminService(db)
    return await admin_service.update_department(department_id, update_data, current_user.systemId)


@router.delete("/departments/{department_id}")
async def delete_department(
    department_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Delete a department"""
    admin_service = AdminService(db)
    return await admin_service.delete_department(department_id, current_user.systemId)


# ============================================================================
# System Configuration Endpoints
# ============================================================================

@router.get("/configs", response_model=List[SystemConfigResponse])
async def get_system_configs(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all system configurations"""
    admin_service = AdminService(db)
    return await admin_service.get_system_configs(current_user.systemId)


@router.get("/configs/{config_key}", response_model=SystemConfigResponse)
async def get_system_config(
    config_key: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific system configuration"""
    admin_service = AdminService(db)
    return await admin_service.get_system_config(config_key, current_user.systemId)


@router.put("/configs/{config_key}", response_model=SystemConfigResponse)
async def set_system_config(
    config_key: str,
    config_value: str = Query(..., description="Configuration value"),
    data_type: str = Query("string", description="Data type of the value"),
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Set or update a system configuration"""
    admin_service = AdminService(db)
    return await admin_service.set_system_config(config_key, config_value, data_type, current_user.systemId)


@router.delete("/configs/{config_key}")
async def delete_system_config(
    config_key: str,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Delete a system configuration"""
    admin_service = AdminService(db)
    return await admin_service.delete_system_config(config_key, current_user.systemId)


# ============================================================================
# Feature Flag Management Endpoints
# ============================================================================

@router.get("/feature-flags", response_model=List[Dict[str, Any]])
async def get_feature_flags(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all feature flags for the system"""
    admin_service = AdminService(db)
    return await admin_service.get_feature_flags(current_user.systemId)


@router.put("/feature-flags/{flag_name}", response_model=Dict[str, Any])
async def set_feature_flag(
    flag_name: str,
    is_enabled: bool = Query(..., description="Whether the flag is enabled"),
    rollout_percentage: int = Query(0, ge=0, le=100, description="Rollout percentage (0-100)"),
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Set or update a feature flag"""
    admin_service = AdminService(db)
    return await admin_service.set_feature_flag(flag_name, is_enabled, rollout_percentage, current_user.systemId)


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


# ============================================================================
# Legacy System Config Endpoints (for backward compatibility)
# ============================================================================

@router.get("/system-config", response_model=List[SystemConfigResponse])
async def get_system_config_legacy(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get system configuration (legacy endpoint)"""
    admin_service = AdminService(db)
    return await admin_service.get_system_configs(current_user.systemId)


@router.put("/system-config", response_model=SystemConfigResponse)
async def update_system_config_legacy(
    config_data: SystemConfigUpdate,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update system configuration (legacy endpoint)"""
    admin_service = AdminService(db)
    return await admin_service.set_system_config(
        config_data.config_key, 
        config_data.config_value, 
        config_data.data_type, 
        current_user.systemId
    )
