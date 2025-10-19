from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CreateActionItemRequest(BaseModel):
    title: str
    description: Optional[str] = None
    dueDate: Optional[datetime] = None
    priority: str = "medium"

    class Config:
        populate_by_name = True


class UpdateActionItemRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    dueDate: Optional[datetime] = None
    priority: Optional[str] = None

    class Config:
        populate_by_name = True


class ActionItemResponse(BaseModel):
    id: str
    actionPlanId: str = ...
    title: str
    description: Optional[str] = None
    dueDate: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    priority: str
    createdAt: datetime = ...
    updatedAt: datetime = ...

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_camel(cls, obj):
        return cls(
            id=obj.id,
            actionPlanId=obj.action_plan_id,
            title=obj.title,
            description=obj.description,
            dueDate=obj.due_date,
            completedAt=obj.completed_at,
            priority=obj.priority,
            createdAt=obj.created_at,
            updatedAt=obj.updated_at,
        )


class CreateActionPlanRequest(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "active"


class UpdateActionPlanRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ActionPlanResponse(BaseModel):
    id: str
    userId: str = ...
    systemId: str = ...
    title: str
    description: Optional[str] = None
    status: str
    createdAt: datetime = ...
    updatedAt: datetime = ...
    actionItems: List[ActionItemResponse] = []

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_camel(cls, obj):
        return cls(
            id=obj.id,
            userId=obj.user_id,
            systemId=obj.system_id,
            title=obj.title,
            description=obj.description,
            status=obj.status,
            createdAt=obj.created_at,
            updatedAt=obj.updated_at,
            actionItems=[ActionItemResponse.from_orm_with_camel(item) for item in obj.action_items],
        )
