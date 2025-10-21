from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

from .enums import Priority, ActionPlanStatus


class CreateActionItemRequest(BaseModel):
    """Request model for creating a new action item"""
    title: str = Field(..., min_length=1, max_length=200, description="Title of the action item")
    description: Optional[str] = Field(None, max_length=1000, description="Detailed description of the action item")
    dueDate: Optional[datetime] = Field(None, description="Due date for completing the action item")
    priority: Priority = Field(default=Priority.MEDIUM, description="Priority level of the action item")

    class Config:
        populate_by_name = True

    @field_validator('dueDate')
    @classmethod
    def validate_due_date(cls, v):
        if v and v < datetime.now():
            raise ValueError('Due date cannot be in the past')
        return v


class UpdateActionItemRequest(BaseModel):
    """Request model for updating an existing action item"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Updated title of the action item")
    description: Optional[str] = Field(None, max_length=1000, description="Updated description of the action item")
    dueDate: Optional[datetime] = Field(None, description="Updated due date for the action item")
    priority: Optional[Priority] = Field(None, description="Updated priority level of the action item")

    class Config:
        populate_by_name = True

    @field_validator('dueDate')
    @classmethod
    def validate_due_date(cls, v):
        if v and v < datetime.now():
            raise ValueError('Due date cannot be in the past')
        return v


class ActionItemResponse(BaseModel):
    """Response model for action item data"""
    id: str = Field(..., description="Unique identifier of the action item")
    actionPlanId: str = Field(..., alias="action_plan_id", description="ID of the parent action plan")
    title: str = Field(..., description="Title of the action item")
    description: Optional[str] = Field(None, description="Description of the action item")
    dueDate: Optional[datetime] = Field(None, alias="due_date", description="Due date for the action item")
    completedAt: Optional[datetime] = Field(None, alias="completed_at", description="Completion timestamp")
    priority: Priority = Field(..., description="Priority level of the action item")
    createdAt: datetime = Field(..., alias="created_at", description="Creation timestamp")
    updatedAt: datetime = Field(..., alias="updated_at", description="Last update timestamp")

    class Config:
        from_attributes = True
        populate_by_name = True
        by_alias = True


class CreateActionPlanRequest(BaseModel):
    """Request model for creating a new action plan"""
    title: str = Field(..., min_length=1, max_length=200, description="Title of the action plan")
    description: Optional[str] = Field(None, max_length=1000, description="Detailed description of the action plan")
    status: ActionPlanStatus = Field(default=ActionPlanStatus.ACTIVE, description="Status of the action plan")


class UpdateActionPlanRequest(BaseModel):
    """Request model for updating an existing action plan"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Updated title of the action plan")
    description: Optional[str] = Field(None, max_length=1000, description="Updated description of the action plan")
    status: Optional[ActionPlanStatus] = Field(None, description="Updated status of the action plan")


class ActionPlanResponse(BaseModel):
    """Response model for action plan data"""
    id: str = Field(..., description="Unique identifier of the action plan")
    userId: str = Field(..., alias="user_id", description="ID of the user who owns the action plan")
    systemId: str = Field(..., alias="system_id", description="ID of the system the action plan belongs to")
    title: str = Field(..., description="Title of the action plan")
    description: Optional[str] = Field(None, description="Description of the action plan")
    status: ActionPlanStatus = Field(..., description="Current status of the action plan")
    createdAt: datetime = Field(..., alias="created_at", description="Creation timestamp")
    updatedAt: datetime = Field(..., alias="updated_at", description="Last update timestamp")
    actionItems: List[ActionItemResponse] = Field(default_factory=list, description="List of action items in this plan")

    class Config:
        from_attributes = True
        populate_by_name = True
        by_alias = True
