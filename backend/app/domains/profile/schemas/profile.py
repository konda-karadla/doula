from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

from app.shared.schemas.enums import ProfileType, JourneyType


class UserProfileResponse(BaseModel):
    """Response model for user profile data"""
    id: str = Field(..., description="Unique identifier of the user")
    email: str = Field(..., description="User's email address")
    username: str = Field(..., description="User's username")
    profileType: ProfileType = Field(..., alias="profile_type", description="Type of user profile")
    journeyType: JourneyType = Field(..., alias="journey_type", description="User's journey type")
    language: str = Field(..., description="User's preferred language")
    createdAt: datetime = Field(..., alias="created_at", description="Account creation timestamp")
    updatedAt: datetime = Field(..., alias="updated_at", description="Last profile update timestamp")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class HealthStatsResponse(BaseModel):
    """Response model for user health statistics"""
    totalLabResults: int = Field(..., ge=0, description="Total number of lab results uploaded")
    totalActionPlans: int = Field(..., ge=0, description="Total number of action plans created")
    completedActionItems: int = Field(..., ge=0, description="Number of completed action items")
    pendingActionItems: int = Field(..., ge=0, description="Number of pending action items")
    lastLabUpload: Optional[datetime] = Field(None, description="Timestamp of the most recent lab upload")

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def create(cls, total_labs: int, total_plans: int, completed_items: int,
               pending_items: int, last_upload: Optional[datetime] = None):
        """Factory method for creating health statistics"""
        return cls(
            totalLabResults=total_labs,
            totalActionPlans=total_plans,
            completedActionItems=completed_items,
            pendingActionItems=pending_items,
            lastLabUpload=last_upload,
        )
