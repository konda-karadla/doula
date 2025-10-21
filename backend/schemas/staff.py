"""
Pydantic schemas for Staff management
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import date, datetime

from schemas.enums import StaffType


# ============================================================================
# Department Schemas
# ============================================================================

class DepartmentBase(BaseModel):
    """Base schema for Department"""
    name: str = Field(..., min_length=1, max_length=200, description="Department name")
    description: Optional[str] = Field(None, max_length=500, description="Department description")
    is_active: bool = Field(True, description="Whether department is active")


class DepartmentCreate(DepartmentBase):
    """Schema for creating a department"""
    system_id: str = Field(..., description="System ID this department belongs to")


class DepartmentUpdate(BaseModel):
    """Schema for updating a department"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class DepartmentResponse(DepartmentBase):
    """Schema for department response"""
    id: str
    system_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Staff Schemas
# ============================================================================

class StaffBase(BaseModel):
    """Base schema for Staff"""
    staff_type: StaffType = Field(..., description="Type of staff member")
    license_number: Optional[str] = Field(None, max_length=100, description="Professional license number")
    credentials: Optional[str] = Field(None, max_length=200, description="e.g., 'MD, FACP' or 'RD, CDE'")
    specialization: Optional[str] = Field(None, max_length=200, description="e.g., 'Cardiology', 'Clinical Nutrition'")
    hire_date: Optional[date] = Field(None, description="Date of hire")
    is_active: bool = Field(True, description="Whether staff member is active")


class StaffCreate(StaffBase):
    """Schema for creating a staff member"""
    user_id: str = Field(..., description="User ID (must already exist)")
    system_id: str = Field(..., description="System ID")
    department_id: Optional[str] = Field(None, description="Department ID (optional)")


class StaffUpdate(BaseModel):
    """Schema for updating a staff member"""
    staff_type: Optional[StaffType] = None
    license_number: Optional[str] = Field(None, max_length=100)
    credentials: Optional[str] = Field(None, max_length=200)
    specialization: Optional[str] = Field(None, max_length=200)
    department_id: Optional[str] = None
    hire_date: Optional[date] = None
    is_active: Optional[bool] = None


class StaffResponse(StaffBase):
    """Schema for staff response"""
    id: str
    user_id: str
    system_id: str
    department_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StaffWithUser(StaffResponse):
    """Schema for staff response with user details"""
    user_email: str
    user_username: str
    user_role: str

    model_config = ConfigDict(from_attributes=True)


class StaffWithDepartment(StaffResponse):
    """Schema for staff response with department details"""
    department: Optional[DepartmentResponse] = None

    model_config = ConfigDict(from_attributes=True)


class StaffFullDetails(StaffResponse):
    """Schema for staff with all related details"""
    user_email: str
    user_username: str
    user_role: str
    department: Optional[DepartmentResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Staff Registration (creates both User and Staff)
# ============================================================================

class StaffRegistration(BaseModel):
    """Schema for registering a new staff member (creates user + staff profile)"""
    # User details
    email: EmailStr = Field(..., description="Staff member email")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    
    # Staff details
    staff_type: StaffType = Field(..., description="Type of staff member")
    license_number: Optional[str] = Field(None, max_length=100)
    credentials: Optional[str] = Field(None, max_length=200)
    specialization: Optional[str] = Field(None, max_length=200)
    department_id: Optional[str] = None
    hire_date: Optional[date] = None
    
    # System
    system_id: str = Field(..., description="System ID")


class StaffRegistrationResponse(BaseModel):
    """Response after staff registration"""
    user_id: str
    staff_id: str
    email: str
    username: str
    staff_type: StaffType
    message: str = "Staff member registered successfully"

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# List/Filter Schemas
# ============================================================================

class StaffListFilter(BaseModel):
    """Schema for filtering staff list"""
    staff_type: Optional[StaffType] = Field(None, description="Filter by staff type")
    department_id: Optional[str] = Field(None, description="Filter by department")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    search: Optional[str] = Field(None, description="Search by name, email, or credentials")
    
    skip: int = Field(0, ge=0, description="Number of records to skip")
    limit: int = Field(100, ge=1, le=1000, description="Number of records to return")


class StaffListResponse(BaseModel):
    """Schema for paginated staff list response"""
    items: list[StaffFullDetails]
    total: int
    skip: int
    limit: int
    has_more: bool

    model_config = ConfigDict(from_attributes=True)

