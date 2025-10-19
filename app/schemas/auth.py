from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class SystemResponse(BaseModel):
    id: str
    name: str
    slug: str

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    profileType: str = Field(..., alias="profileType")
    journeyType: str = Field(..., alias="journeyType")
    systemSlug: str = Field(..., alias="systemSlug")

    class Config:
        populate_by_name = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refreshToken: str = Field(..., alias="refreshToken")

    class Config:
        populate_by_name = True


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    profileType: str = Field(..., alias="profile_type")
    journeyType: str = Field(..., alias="journey_type")
    system: SystemResponse

    class Config:
        from_attributes = True
        populate_by_name = True


class AuthResponse(BaseModel):
    user: UserResponse
    accessToken: str = Field(..., alias="accessToken")
    refreshToken: str = Field(..., alias="refreshToken")

    class Config:
        populate_by_name = True
