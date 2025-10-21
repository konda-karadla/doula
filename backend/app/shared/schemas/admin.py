from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

from .enums import UserRole, ProfileType, JourneyType


class CreateUserRequest(BaseModel):
    """Request model for creating a new user (admin only)"""
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    password: str = Field(..., min_length=8, description="User's password")
    role: UserRole = Field(default=UserRole.USER, description="User's role in the system")
    profile_type: ProfileType = Field(..., description="Type of user profile")
    journey_type: JourneyType = Field(..., description="User's journey type")
    system_id: str = Field(..., description="ID of the system the user belongs to")
    first_name: Optional[str] = Field(None, max_length=100, description="User's first name")
    last_name: Optional[str] = Field(None, max_length=100, description="User's last name")
    phone_number: Optional[str] = Field(None, max_length=20, description="User's phone number")


class UpdateUserRequest(BaseModel):
    """Request model for updating user information (admin only)"""
    email: Optional[EmailStr] = Field(None, description="Updated email address")
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="Updated username")
    role: Optional[UserRole] = Field(None, description="Updated user role")
    first_name: Optional[str] = Field(None, max_length=100, description="Updated first name")
    last_name: Optional[str] = Field(None, max_length=100, description="Updated last name")
    phone_number: Optional[str] = Field(None, max_length=20, description="Updated phone number")
    is_active: Optional[bool] = Field(None, description="User's active status")


class UserResponse(BaseModel):
    """Response model for user data"""
    id: str = Field(..., description="Unique identifier of the user")
    email: str = Field(..., description="User's email address")
    username: str = Field(..., description="User's username")
    role: UserRole = Field(..., description="User's role in the system")
    profile_type: ProfileType = Field(..., description="Type of user profile")
    journey_type: JourneyType = Field(..., description="User's journey type")
    system_id: str = Field(..., description="ID of the system the user belongs to")
    first_name: Optional[str] = Field(None, description="User's first name")
    last_name: Optional[str] = Field(None, description="User's last name")
    phone_number: Optional[str] = Field(None, description="User's phone number")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class AdminUserResponse(BaseModel):
    """Response model for admin user data (includes sensitive fields)"""
    id: str = Field(..., description="Unique identifier of the user")
    email: str = Field(..., description="User's email address")
    username: str = Field(..., description="User's username")
    role: UserRole = Field(..., description="User's role in the system")
    profile_type: ProfileType = Field(..., description="Type of user profile")
    journey_type: JourneyType = Field(..., description="User's journey type")
    system_id: str = Field(..., description="ID of the system the user belongs to")
    first_name: Optional[str] = Field(None, description="User's first name")
    last_name: Optional[str] = Field(None, description="User's last name")
    phone_number: Optional[str] = Field(None, description="User's phone number")
    is_active: bool = Field(..., description="User's active status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class SystemConfigUpdate(BaseModel):
    """Request model for updating system configuration"""
    config_key: str = Field(..., min_length=1, max_length=100, description="Configuration key")
    config_value: str = Field(..., max_length=1000, description="Configuration value")
    data_type: str = Field(default="string", description="Data type of the configuration value")


class SystemConfigResponse(BaseModel):
    """Response model for system configuration data"""
    id: str = Field(..., description="Unique identifier of the configuration")
    system_id: str = Field(..., description="ID of the system this configuration belongs to")
    config_key: str = Field(..., description="Configuration key")
    config_value: str = Field(..., description="Configuration value")
    data_type: str = Field(..., description="Data type of the configuration value")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class UserAnalytics(BaseModel):
    """Analytics data for users"""
    total_users: int = Field(..., ge=0, description="Total number of users")
    active_users: int = Field(..., ge=0, description="Number of active users")
    new_users_this_month: int = Field(..., ge=0, description="New users registered this month")
    users_by_role: Dict[str, int] = Field(..., description="User count by role")
    users_by_profile_type: Dict[str, int] = Field(..., description="User count by profile type")


class LabAnalytics(BaseModel):
    """Analytics data for lab results"""
    total_labs: int = Field(..., ge=0, description="Total number of lab results")
    pending_labs: int = Field(..., ge=0, description="Number of pending lab results")
    processed_labs: int = Field(..., ge=0, description="Number of processed lab results")
    labs_this_month: int = Field(..., ge=0, description="Lab results uploaded this month")
    processing_rate: float = Field(..., ge=0, le=100, description="Lab processing success rate percentage")


class ActionPlanAnalytics(BaseModel):
    """Analytics data for action plans"""
    total_plans: int = Field(..., ge=0, description="Total number of action plans")
    active_plans: int = Field(..., ge=0, description="Number of active action plans")
    completed_plans: int = Field(..., ge=0, description="Number of completed action plans")
    plans_this_month: int = Field(..., ge=0, description="Action plans created this month")
    completion_rate: float = Field(..., ge=0, le=100, description="Action plan completion rate percentage")


class AdminDashboard(BaseModel):
    """Response model for admin dashboard data"""
    user_analytics: UserAnalytics = Field(..., description="User analytics data")
    lab_analytics: LabAnalytics = Field(..., description="Lab analytics data")
    action_plan_analytics: ActionPlanAnalytics = Field(..., description="Action plan analytics data")
    system_health: Dict[str, Any] = Field(..., description="System health metrics")
