from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


class CreateUserRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    role: str = Field(default="user")
    profile_type: str
    journey_type: str
    system_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None


class UpdateUserRequest(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    role: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    role: str
    profile_type: str
    journey_type: str
    system_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminUserResponse(BaseModel):
    id: str
    email: str
    username: str
    role: str
    profile_type: str
    journey_type: str
    system_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SystemConfigUpdate(BaseModel):
    config_key: str
    config_value: str
    data_type: str = Field(default="string")


class SystemConfigResponse(BaseModel):
    id: str
    system_id: str
    config_key: str
    config_value: str
    data_type: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserAnalytics(BaseModel):
    total_users: int
    active_users: int
    new_users_this_month: int
    users_by_role: Dict[str, int]
    users_by_profile_type: Dict[str, int]


class LabAnalytics(BaseModel):
    total_labs: int
    pending_labs: int
    processed_labs: int
    labs_this_month: int
    processing_rate: float


class ActionPlanAnalytics(BaseModel):
    total_plans: int
    active_plans: int
    completed_plans: int
    plans_this_month: int
    completion_rate: float


class AdminDashboard(BaseModel):
    user_analytics: UserAnalytics
    lab_analytics: LabAnalytics
    action_plan_analytics: ActionPlanAnalytics
    system_health: Dict[str, Any]
