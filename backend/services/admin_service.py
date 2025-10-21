from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, or_, asc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import hashlib

from models.user import User
from models.staff import Staff, Department
from models.system import System
from models.system_config import SystemConfig, FeatureFlag
from models.lab_result import LabResult
from models.action_plan import ActionPlan, ActionItem
from schemas.admin import (
    CreateUserRequest, UpdateUserRequest, AdminUserResponse,
    SystemConfigUpdate, SystemConfigResponse, UserAnalytics,
    LabAnalytics, ActionPlanAnalytics
)
from schemas.staff import (
    StaffRegistration, StaffRegistrationResponse, StaffUpdate, StaffFullDetails,
    StaffListFilter, StaffListResponse, DepartmentCreate, DepartmentUpdate,
    DepartmentResponse
)
from schemas.enums import UserRole, StaffType


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

    # ============================================================================
    # Enhanced User Management
    # ============================================================================

    async def get_user_by_id(self, user_id: str, system_id: str) -> AdminUserResponse:
        """Get a specific user by ID"""
        result = await self.db.execute(
            select(User).where(
                and_(
                    User.id == user_id,
                    User.system_id == system_id
                )
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return self._user_to_admin_response(user)

    async def search_users(self, query: str, system_id: str, limit: int = 50) -> List[AdminUserResponse]:
        """Search users by email, username, or name"""
        search_filter = or_(
            User.email.ilike(f"%{query}%"),
            User.username.ilike(f"%{query}%"),
            User.first_name.ilike(f"%{query}%"),
            User.last_name.ilike(f"%{query}%")
        )
        
        result = await self.db.execute(
            select(User)
            .where(and_(User.system_id == system_id, search_filter))
            .order_by(User.created_at.desc())
            .limit(limit)
        )
        users = result.scalars().all()
        return [self._user_to_admin_response(user) for user in users]

    async def get_users_by_role(self, role: UserRole, system_id: str) -> List[AdminUserResponse]:
        """Get all users with a specific role"""
        result = await self.db.execute(
            select(User)
            .where(and_(User.system_id == system_id, User.role == role))
            .order_by(User.created_at.desc())
        )
        users = result.scalars().all()
        return [self._user_to_admin_response(user) for user in users]

    async def activate_user(self, user_id: str, system_id: str) -> AdminUserResponse:
        """Activate a user account"""
        result = await self.db.execute(
            select(User).where(
                and_(
                    User.id == user_id,
                    User.system_id == system_id
                )
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.is_active = True
        user.updated_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(user)
        
        return self._user_to_admin_response(user)

    async def deactivate_user(self, user_id: str, system_id: str) -> AdminUserResponse:
        """Deactivate a user account"""
        result = await self.db.execute(
            select(User).where(
                and_(
                    User.id == user_id,
                    User.system_id == system_id
                )
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.is_active = False
        user.updated_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(user)
        
        return self._user_to_admin_response(user)

    # ============================================================================
    # Staff Management
    # ============================================================================

    async def register_staff(self, registration_data: StaffRegistration) -> StaffRegistrationResponse:
        """Register a new staff member (creates both User and Staff)"""
        # Check if user already exists
        result = await self.db.execute(
            select(User).where(User.email == registration_data.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create user first
        user = User(
            email=registration_data.email,
            username=registration_data.username,
            password=hashlib.sha256(registration_data.password.encode()).hexdigest(),  # Hash password
            role=UserRole.PHYSICIAN if registration_data.staff_type == StaffType.PHYSICIAN else UserRole.USER,
            profile_type="doctor" if registration_data.staff_type == StaffType.PHYSICIAN else "admin",
            journey_type="general",
            system_id=registration_data.system_id,
            is_active=True
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        # Create staff profile
        staff = Staff(
            user_id=user.id,
            system_id=registration_data.system_id,
            department_id=registration_data.department_id,
            staff_type=registration_data.staff_type,
            license_number=registration_data.license_number,
            credentials=registration_data.credentials,
            specialization=registration_data.specialization,
            hire_date=registration_data.hire_date,
            is_active=True
        )

        self.db.add(staff)
        await self.db.commit()
        await self.db.refresh(staff)

        return StaffRegistrationResponse(
            user_id=user.id,
            staff_id=staff.id,
            email=user.email,
            username=user.username,
            staff_type=staff.staff_type
        )

    async def get_all_staff(self, system_id: str) -> List[StaffFullDetails]:
        """Get all staff members with full details"""
        result = await self.db.execute(
            select(Staff)
            .options(
                selectinload(Staff.user),
                selectinload(Staff.department)
            )
            .where(Staff.system_id == system_id)
            .order_by(Staff.created_at.desc())
        )
        staff_members = result.scalars().all()
        
        return [self._staff_to_full_details(staff) for staff in staff_members]

    async def get_staff_by_id(self, staff_id: str, system_id: str) -> StaffFullDetails:
        """Get a specific staff member by ID"""
        result = await self.db.execute(
            select(Staff)
            .options(
                selectinload(Staff.user),
                selectinload(Staff.department)
            )
            .where(
                and_(
                    Staff.id == staff_id,
                    Staff.system_id == system_id
                )
            )
        )
        staff = result.scalar_one_or_none()
        
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff member not found"
            )
        
        return self._staff_to_full_details(staff)

    async def update_staff(self, staff_id: str, update_data: StaffUpdate, system_id: str) -> StaffFullDetails:
        """Update staff member information"""
        result = await self.db.execute(
            select(Staff).where(
                and_(
                    Staff.id == staff_id,
                    Staff.system_id == system_id
                )
            )
        )
        staff = result.scalar_one_or_none()
        
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff member not found"
            )

        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(staff, field, value)

        staff.updated_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(staff)

        # Get updated staff with relationships
        result = await self.db.execute(
            select(Staff)
            .options(
                selectinload(Staff.user),
                selectinload(Staff.department)
            )
            .where(Staff.id == staff_id)
        )
        updated_staff = result.scalar_one()
        
        return self._staff_to_full_details(updated_staff)

    async def delete_staff(self, staff_id: str, system_id: str) -> dict:
        """Delete a staff member (also deletes associated user)"""
        result = await self.db.execute(
            select(Staff).where(
                and_(
                    Staff.id == staff_id,
                    Staff.system_id == system_id
                )
            )
        )
        staff = result.scalar_one_or_none()
        
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff member not found"
            )

        # Delete staff (user will be deleted via cascade)
        await self.db.delete(staff)
        await self.db.commit()

        return {"message": "Staff member deleted successfully"}

    async def list_staff(self, filters: StaffListFilter, system_id: str) -> StaffListResponse:
        """List staff members with filtering and pagination"""
        query = select(Staff).options(
            selectinload(Staff.user),
            selectinload(Staff.department)
        ).where(Staff.system_id == system_id)

        # Apply filters
        if filters.staff_type:
            query = query.where(Staff.staff_type == filters.staff_type)
        if filters.department_id:
            query = query.where(Staff.department_id == filters.department_id)
        if filters.is_active is not None:
            query = query.where(Staff.is_active == filters.is_active)
        if filters.search:
            search_filter = or_(
                Staff.credentials.ilike(f"%{filters.search}%"),
                Staff.specialization.ilike(f"%{filters.search}%"),
                Staff.license_number.ilike(f"%{filters.search}%")
            )
            query = query.join(User).where(search_filter)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination and ordering
        query = query.order_by(desc(Staff.created_at)).offset(filters.skip).limit(filters.limit)

        result = await self.db.execute(query)
        staff_members = result.scalars().all()

        # Convert to response format
        items = [self._staff_to_full_details(staff) for staff in staff_members]

        return StaffListResponse(
            items=items,
            total=total,
            skip=filters.skip,
            limit=filters.limit,
            has_more=(filters.skip + len(items)) < total
        )

    # ============================================================================
    # Department Management
    # ============================================================================

    async def create_department(self, department_data: DepartmentCreate) -> DepartmentResponse:
        """Create a new department"""
        # Check if department name already exists in system
        result = await self.db.execute(
            select(Department).where(
                and_(
                    Department.system_id == department_data.system_id,
                    Department.name == department_data.name
                )
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department name already exists in this system"
            )

        department = Department(
            system_id=department_data.system_id,
            name=department_data.name,
            description=department_data.description,
            is_active=department_data.is_active
        )

        self.db.add(department)
        await self.db.commit()
        await self.db.refresh(department)

        return DepartmentResponse.model_validate(department)

    async def get_all_departments(self, system_id: str) -> List[DepartmentResponse]:
        """Get all departments in a system"""
        result = await self.db.execute(
            select(Department)
            .where(Department.system_id == system_id)
            .order_by(Department.name)
        )
        departments = result.scalars().all()
        return [DepartmentResponse.model_validate(dept) for dept in departments]

    async def get_department_by_id(self, department_id: str, system_id: str) -> DepartmentResponse:
        """Get a specific department by ID"""
        result = await self.db.execute(
            select(Department).where(
                and_(
                    Department.id == department_id,
                    Department.system_id == system_id
                )
            )
        )
        department = result.scalar_one_or_none()
        
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        return DepartmentResponse.model_validate(department)

    async def update_department(self, department_id: str, update_data: DepartmentUpdate, system_id: str) -> DepartmentResponse:
        """Update department information"""
        result = await self.db.execute(
            select(Department).where(
                and_(
                    Department.id == department_id,
                    Department.system_id == system_id
                )
            )
        )
        department = result.scalar_one_or_none()
        
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )

        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(department, field, value)

        department.updated_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(department)

        return DepartmentResponse.model_validate(department)

    async def delete_department(self, department_id: str, system_id: str) -> dict:
        """Delete a department"""
        result = await self.db.execute(
            select(Department).where(
                and_(
                    Department.id == department_id,
                    Department.system_id == system_id
                )
            )
        )
        department = result.scalar_one_or_none()
        
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )

        # Check if department has staff members
        staff_count_result = await self.db.execute(
            select(func.count(Staff.id)).where(Staff.department_id == department_id)
        )
        staff_count = staff_count_result.scalar()
        
        if staff_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete department with {staff_count} staff members. Reassign staff first."
            )

        await self.db.delete(department)
        await self.db.commit()

        return {"message": "Department deleted successfully"}

    # ============================================================================
    # System Configuration Management
    # ============================================================================

    async def get_system_configs(self, system_id: str) -> List[SystemConfigResponse]:
        """Get all system configurations"""
        result = await self.db.execute(
            select(SystemConfig)
            .where(SystemConfig.system_id == system_id)
            .order_by(SystemConfig.config_key)
        )
        configs = result.scalars().all()
        return [SystemConfigResponse.model_validate(config) for config in configs]

    async def get_system_config(self, config_key: str, system_id: str) -> SystemConfigResponse:
        """Get a specific system configuration"""
        result = await self.db.execute(
            select(SystemConfig).where(
                and_(
                    SystemConfig.system_id == system_id,
                    SystemConfig.config_key == config_key
                )
            )
        )
        config = result.scalar_one_or_none()
        
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuration not found"
            )
        
        return SystemConfigResponse.model_validate(config)

    async def set_system_config(self, config_key: str, config_value: str, data_type: str, system_id: str) -> SystemConfigResponse:
        """Set or update a system configuration"""
        result = await self.db.execute(
            select(SystemConfig).where(
                and_(
                    SystemConfig.system_id == system_id,
                    SystemConfig.config_key == config_key
                )
            )
        )
        config = result.scalar_one_or_none()
        
        if config:
            # Update existing config
            config.config_value = config_value
            config.data_type = data_type
            config.updated_at = datetime.now()
        else:
            # Create new config
            config = SystemConfig(
                system_id=system_id,
                config_key=config_key,
                config_value=config_value,
                data_type=data_type
            )
            self.db.add(config)
        
        await self.db.commit()
        await self.db.refresh(config)
        
        return SystemConfigResponse.model_validate(config)

    async def delete_system_config(self, config_key: str, system_id: str) -> dict:
        """Delete a system configuration"""
        result = await self.db.execute(
            select(SystemConfig).where(
                and_(
                    SystemConfig.system_id == system_id,
                    SystemConfig.config_key == config_key
                )
            )
        )
        config = result.scalar_one_or_none()
        
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuration not found"
            )

        await self.db.delete(config)
        await self.db.commit()

        return {"message": "Configuration deleted successfully"}

    # ============================================================================
    # Feature Flag Management
    # ============================================================================

    async def get_feature_flags(self, system_id: str) -> List[Dict[str, Any]]:
        """Get all feature flags for a system"""
        result = await self.db.execute(
            select(FeatureFlag)
            .where(FeatureFlag.system_id == system_id)
            .order_by(FeatureFlag.flag_name)
        )
        flags = result.scalars().all()
        
        return [
            {
                "id": flag.id,
                "flag_name": flag.flag_name,
                "is_enabled": flag.is_enabled,
                "rollout_percentage": flag.rollout_percentage,
                "created_at": flag.created_at,
                "updated_at": flag.updated_at
            }
            for flag in flags
        ]

    async def set_feature_flag(self, flag_name: str, is_enabled: bool, rollout_percentage: int, system_id: str) -> Dict[str, Any]:
        """Set or update a feature flag"""
        result = await self.db.execute(
            select(FeatureFlag).where(
                and_(
                    FeatureFlag.system_id == system_id,
                    FeatureFlag.flag_name == flag_name
                )
            )
        )
        flag = result.scalar_one_or_none()
        
        if flag:
            # Update existing flag
            flag.is_enabled = is_enabled
            flag.rollout_percentage = rollout_percentage
            flag.updated_at = datetime.now()
        else:
            # Create new flag
            flag = FeatureFlag(
                system_id=system_id,
                flag_name=flag_name,
                is_enabled=is_enabled,
                rollout_percentage=rollout_percentage
            )
            self.db.add(flag)
        
        await self.db.commit()
        await self.db.refresh(flag)
        
        return {
            "id": flag.id,
            "flag_name": flag.flag_name,
            "is_enabled": flag.is_enabled,
            "rollout_percentage": flag.rollout_percentage,
            "created_at": flag.created_at,
            "updated_at": flag.updated_at
        }

    # ============================================================================
    # Enhanced Analytics
    # ============================================================================

    async def get_comprehensive_analytics(self, system_id: str) -> Dict[str, Any]:
        """Get comprehensive system analytics"""
        # User analytics
        user_analytics = await self.get_user_analytics(system_id)
        
        # Staff analytics
        total_staff_result = await self.db.execute(
            select(func.count(Staff.id)).where(Staff.system_id == system_id)
        )
        total_staff = total_staff_result.scalar() or 0

        active_staff_result = await self.db.execute(
            select(func.count(Staff.id))
            .where(and_(Staff.system_id == system_id, Staff.is_active == True))
        )
        active_staff = active_staff_result.scalar() or 0

        # Department analytics
        total_departments_result = await self.db.execute(
            select(func.count(Department.id)).where(Department.system_id == system_id)
        )
        total_departments = total_departments_result.scalar() or 0

        # Lab analytics
        lab_analytics = await self.get_lab_analytics(system_id)
        
        # Action plan analytics
        action_plan_analytics = await self.get_action_plan_analytics(system_id)

        return {
            "users": {
                "total": user_analytics.totalUsers,
                "active": user_analytics.activeUsers,
                "new_this_month": user_analytics.newUsersThisMonth
            },
            "staff": {
                "total": total_staff,
                "active": active_staff
            },
            "departments": {
                "total": total_departments
            },
            "labs": {
                "total": lab_analytics.totalLabResults,
                "pending": lab_analytics.pendingProcessing,
                "completed": lab_analytics.completedProcessing
            },
            "action_plans": {
                "total": action_plan_analytics.totalActionPlans,
                "active": action_plan_analytics.activeActionPlans
            }
        }

    # ============================================================================
    # Helper Methods
    # ============================================================================

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

    def _staff_to_full_details(self, staff: Staff) -> StaffFullDetails:
        return StaffFullDetails(
            id=staff.id,
            user_id=staff.user_id,
            system_id=staff.system_id,
            department_id=staff.department_id,
            staff_type=staff.staff_type,
            license_number=staff.license_number,
            credentials=staff.credentials,
            specialization=staff.specialization,
            hire_date=staff.hire_date,
            is_active=staff.is_active,
            created_at=staff.created_at,
            updated_at=staff.updated_at,
            user_email=staff.user.email,
            user_username=staff.user.username,
            user_role=staff.user.role,
            department=DepartmentResponse.model_validate(staff.department) if staff.department else None
        )
