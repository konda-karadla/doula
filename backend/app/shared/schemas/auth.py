from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

from .enums import ProfileType, JourneyType, UserRole


class SystemResponse(BaseModel):
    """Response model for system data"""
    id: str = Field(..., description="Unique identifier of the system")
    name: str = Field(..., description="Name of the system")
    slug: str = Field(..., description="URL-friendly slug for the system")

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    """Request model for user registration"""
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    password: str = Field(..., min_length=8, description="User's password")
    profileType: ProfileType = Field(..., alias="profileType", description="Type of user profile")
    journeyType: JourneyType = Field(..., alias="journeyType", description="User's journey type")
    systemSlug: str = Field(..., alias="systemSlug", description="Slug of the system to register with")

    class Config:
        populate_by_name = True


class LoginRequest(BaseModel):
    """Request model for user login"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class RefreshTokenRequest(BaseModel):
    """Request model for token refresh"""
    refreshToken: str = Field(..., alias="refreshToken", description="Valid refresh token")

    class Config:
        populate_by_name = True


class UserResponse(BaseModel):
    """Response model for user data in authentication context"""
    id: str = Field(..., description="Unique identifier of the user")
    email: str = Field(..., description="User's email address")
    username: str = Field(..., description="User's username")
    role: UserRole = Field(..., description="User's role in the system")
    profileType: ProfileType = Field(..., alias="profile_type", description="Type of user profile")
    journeyType: JourneyType = Field(..., alias="journey_type", description="User's journey type")
    system: SystemResponse = Field(..., description="System the user belongs to")

    class Config:
        from_attributes = True
        populate_by_name = True


class AuthResponse(BaseModel):
    """Response model for authentication operations"""
    user: UserResponse = Field(..., description="User information")
    accessToken: str = Field(..., alias="accessToken", description="JWT access token")
    refreshToken: str = Field(..., alias="refreshToken", description="JWT refresh token")

    class Config:
        populate_by_name = True
