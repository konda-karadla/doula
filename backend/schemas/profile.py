from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserProfileResponse(BaseModel):
    id: str
    email: str
    username: str
    profileType: str = ...
    journeyType: str = ...
    language: str
    createdAt: datetime = ...
    updatedAt: datetime = ...

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_camel(cls, obj):
        return cls(
            id=obj.id,
            email=obj.email,
            username=obj.username,
            profileType=obj.profile_type,
            journeyType=obj.journey_type,
            language=obj.language,
            createdAt=obj.created_at,
            updatedAt=obj.updated_at,
        )


class HealthStatsResponse(BaseModel):
    totalLabResults: int = ...
    totalActionPlans: int = ...
    completedActionItems: int = ...
    pendingActionItems: int = ...
    lastLabUpload: Optional[datetime] = None

    class Config:
        from_attributes = True

    @classmethod
    def create(cls, total_labs: int, total_plans: int, completed_items: int,
               pending_items: int, last_upload: Optional[datetime] = None):
        return cls(
            totalLabResults=total_labs,
            totalActionPlans=total_plans,
            completedActionItems=completed_items,
            pendingActionItems=pending_items,
            lastLabUpload=last_upload,
        )
