"""
Permission checking and enforcement for API endpoints
"""
from typing import Optional, List
from functools import wraps
from fastapi import HTTPException, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.permissions import ModulePermission
from models.user import User
from schemas.enums import UserRole, ModuleCategory


# ============================================================================
# Constants
# ============================================================================

NOT_AUTHENTICATED_MSG = "Not authenticated"


# ============================================================================
# Permission Checking Functions
# ============================================================================

async def check_module_permission(
    db: AsyncSession,
    user_role: UserRole,
    module_category: ModuleCategory,
    action: str  # "view", "create", "update", "delete"
) -> bool:
    """
    Check if a role has permission to perform an action on a module
    
    Args:
        db: Database session
        user_role: User's role (e.g., PHYSICIAN, NURSE, etc.)
        module_category: Module category (e.g., "physician", "nurse", etc.)
        action: Action to check ("view", "create", "update", "delete")
    
    Returns:
        bool: True if permission granted, False otherwise
    """
    # ADMIN has full access to everything
    if user_role == UserRole.ADMIN:
        return True
    
    # Query permission
    result = await db.execute(
        select(ModulePermission).where(
            ModulePermission.role == user_role,
            ModulePermission.module_category == module_category
        )
    )
    permission = result.scalar_one_or_none()
    
    if not permission:
        return False
    
    # Check specific action
    if action == "view" or action == "read":
        return permission.can_read
    elif action == "create":
        return permission.can_create
    elif action == "update":
        return permission.can_update
    elif action == "delete":
        return permission.can_delete
    else:
        return False


async def check_multiple_permissions(
    db: AsyncSession,
    user_role: UserRole,
    module_category: ModuleCategory,
    actions: List[str]
) -> dict[str, bool]:
    """
    Check multiple permissions at once
    
    Returns:
        dict: {action: bool} mapping
    """
    # ADMIN has all permissions
    if user_role == UserRole.ADMIN:
        return dict.fromkeys(actions, True)
    
    result = await db.execute(
        select(ModulePermission).where(
            ModulePermission.role == user_role,
            ModulePermission.module_category == module_category
        )
    )
    permission = result.scalar_one_or_none()
    
    if not permission:
        return dict.fromkeys(actions, False)
    
    permission_map = {
        "view": permission.can_read,
        "read": permission.can_read,
        "create": permission.can_create,
        "update": permission.can_update,
        "delete": permission.can_delete,
    }
    
    return {action: permission_map.get(action, False) for action in actions}


async def get_user_accessible_modules(
    db: AsyncSession,
    user_role: UserRole
) -> List[ModuleCategory]:
    """
    Get list of module categories a user can access
    
    Returns:
        List of ModuleCategory values
    """
    # ADMIN can access all modules
    if user_role == UserRole.ADMIN:
        return list(ModuleCategory)
    
    result = await db.execute(
        select(ModulePermission).where(
            ModulePermission.role == user_role,
            ModulePermission.can_read == True
        )
    )
    permissions = result.scalars().all()
    
    return [perm.module_category for perm in permissions]


async def has_any_permission(
    db: AsyncSession,
    user_role: UserRole,
    module_category: ModuleCategory
) -> bool:
    """
    Check if user has ANY permission on a module (view, create, update, or delete)
    """
    # ADMIN has all permissions
    if user_role == UserRole.ADMIN:
        return True
    
    result = await db.execute(
        select(ModulePermission).where(
            ModulePermission.role == user_role,
            ModulePermission.module_category == module_category
        )
    )
    permission = result.scalar_one_or_none()
    
    if not permission:
        return False
    
    return (
        permission.can_read or 
        permission.can_create or 
        permission.can_update or 
        permission.can_delete
    )


# ============================================================================
# Role-Based Access Helpers
# ============================================================================

def can_access_admin_portal(user_role: str) -> bool:
    """Check if user can access admin portal"""
    admin_roles = [
        UserRole.ADMIN.value,
        UserRole.PHYSICIAN.value,
        UserRole.NUTRITIONIST.value,
        UserRole.NURSE.value
    ]
    return user_role in admin_roles


def can_access_health_platform(user_role: str) -> bool:
    """Check if user can access health platform portal"""
    patient_roles = [UserRole.PATIENT.value, UserRole.USER.value]
    return user_role in patient_roles


def is_admin(user_role: str) -> bool:
    """Check if user is admin (full access)"""
    return user_role == UserRole.ADMIN.value


def is_staff(user_role: str) -> bool:
    """Check if user is any type of staff"""
    staff_roles = [
        UserRole.ADMIN.value,
        UserRole.PHYSICIAN.value,
        UserRole.NUTRITIONIST.value,
        UserRole.NURSE.value
    ]
    return user_role in staff_roles


def is_physician(user_role: str) -> bool:
    """Check if user is a physician"""
    return user_role == UserRole.PHYSICIAN.value


def is_nutritionist(user_role: str) -> bool:
    """Check if user is a nutritionist"""
    return user_role == UserRole.NUTRITIONIST.value


def is_nurse(user_role: str) -> bool:
    """Check if user is a nurse"""
    return user_role == UserRole.NURSE.value


def is_patient(user_role: str) -> bool:
    """Check if user is a patient"""
    return user_role in [UserRole.PATIENT.value, UserRole.USER.value]


# ============================================================================
# Dependency Injection Helpers (for FastAPI endpoints)
# ============================================================================

async def require_role(
    required_roles: List[str],
    current_user: User = Depends(lambda: None)  # This will be properly set up in endpoints
) -> User:
    """
    Dependency to require specific roles
    
    Usage:
        @router.get("/endpoint")
        async def endpoint(user: User = Depends(require_role(["admin", "physician"]))):
            ...
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=NOT_AUTHENTICATED_MSG
        )
    
    if current_user.role not in required_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required roles: {', '.join(required_roles)}"
        )
    
    return current_user


async def require_admin(current_user: User = Depends(lambda: None)) -> User:
    """Dependency to require admin role"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=NOT_AUTHENTICATED_MSG
        )
    
    if not is_admin(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user


async def require_staff(current_user: User = Depends(lambda: None)) -> User:
    """Dependency to require any staff role"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=NOT_AUTHENTICATED_MSG
        )
    
    if not is_staff(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff access required"
        )
    
    return current_user


# ============================================================================
# Permission Decorator for Endpoints
# ============================================================================

def require_permission(module_category: ModuleCategory, action: str):
    """
    Decorator to check module-level permissions on endpoints
    
    Usage:
        @router.post("/soap-notes")
        @require_permission(ModuleCategory.PHYSICIAN, "create")
        async def create_soap_note(...):
            ...
    
    Args:
        module_category: Module category to check
        action: Action to check ("view", "create", "update", "delete")
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract dependencies from kwargs
            current_user: Optional[User] = kwargs.get("current_user")
            db: Optional[AsyncSession] = kwargs.get("db")
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated"
                )
            
            if not db:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database session not available"
                )
            
            # Check permission
            try:
                user_role = UserRole(current_user.role)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Invalid user role: {current_user.role}"
                )
            
            has_permission = await check_module_permission(
                db=db,
                user_role=user_role,
                module_category=module_category,
                action=action
            )
            
            if not has_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied. Required: {action} access to {module_category.value} module"
                )
            
            # Call the original function
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


# ============================================================================
# Resource Ownership Checks
# ============================================================================

async def check_resource_ownership(
    current_user: User,
    resource_user_id: str,
    allow_staff_access: bool = True
) -> bool:
    """
    Check if user owns a resource or is staff (who can access any resource)
    
    Args:
        current_user: Current authenticated user
        resource_user_id: ID of user who owns the resource
        allow_staff_access: If True, staff can access any user's resources
    
    Returns:
        bool: True if access allowed
    """
    # User owns the resource
    if current_user.id == resource_user_id:
        return True
    
    # Staff can access any resource (if allowed)
    if allow_staff_access and is_staff(current_user.role):
        return True
    
    return False


async def require_resource_ownership(
    current_user: User,
    resource_user_id: str,
    allow_staff_access: bool = True
):
    """
    Require user to own resource or be staff
    Raises HTTPException if access denied
    """
    if not await check_resource_ownership(current_user, resource_user_id, allow_staff_access):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this resource"
        )


# ============================================================================
# Permission Summary (for frontend)
# ============================================================================

async def get_user_permissions_summary(
    db: AsyncSession,
    user_role: UserRole
) -> dict:
    """
    Get a summary of all permissions for a user (useful for frontend)
    
    Returns:
        dict: {
            "role": "physician",
            "is_admin": False,
            "is_staff": True,
            "modules": {
                "common": {"view": True, "create": True, "update": True, "delete": False},
                "physician": {"view": True, "create": True, "update": True, "delete": False},
                ...
            }
        }
    """
    # Get all permissions for this role
    result = await db.execute(
        select(ModulePermission).where(ModulePermission.role == user_role)
    )
    permissions = result.scalars().all()
    
    modules_permissions = {}
    for perm in permissions:
        modules_permissions[perm.module_category.value] = {
            "view": perm.can_read,
            "create": perm.can_create,
            "update": perm.can_update,
            "delete": perm.can_delete
        }
    
    return {
        "role": user_role.value,
        "is_admin": user_role == UserRole.ADMIN,
        "is_staff": user_role in [UserRole.ADMIN, UserRole.PHYSICIAN, UserRole.NUTRITIONIST, UserRole.NURSE],
        "can_access_admin_portal": can_access_admin_portal(user_role.value),
        "can_access_health_platform": can_access_health_platform(user_role.value),
        "modules": modules_permissions
    }


# ============================================================================
# Module-to-Category Mapping (helper for endpoint developers)
# ============================================================================

MODULE_CATEGORY_MAP = {
    # Common modules
    "dashboard": ModuleCategory.COMMON,
    "patients": ModuleCategory.COMMON,
    "reports": ModuleCategory.COMMON,
    "settings": ModuleCategory.COMMON,
    
    # Physician modules
    "soap_notes": ModuleCategory.PHYSICIAN,
    "lab_orders": ModuleCategory.PHYSICIAN,
    "lab_reviews": ModuleCategory.PHYSICIAN,
    "prescriptions": ModuleCategory.PHYSICIAN,
    "medical_history": ModuleCategory.PHYSICIAN,
    
    # Nutritionist modules
    "nutrition_assessments": ModuleCategory.NUTRITIONIST,
    "meal_plans": ModuleCategory.NUTRITIONIST,
    "nutrition_feedback": ModuleCategory.NUTRITIONIST,
    
    # Nurse modules
    "vitals": ModuleCategory.NURSE,
    "vitals_alerts": ModuleCategory.NURSE,
    
    # Admin modules
    "user_management": ModuleCategory.ADMIN,
    "staff_management": ModuleCategory.ADMIN,
    "department_management": ModuleCategory.ADMIN,
    "system_configuration": ModuleCategory.ADMIN,
    "audit_logs": ModuleCategory.ADMIN,
}


def get_module_category(module_name: str) -> Optional[ModuleCategory]:
    """Get module category by module name"""
    return MODULE_CATEGORY_MAP.get(module_name)

