from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.shared.models import ActionPlan, ActionItem
from app.shared.schemas.action_plan import (
    ActionPlanResponse, ActionItemResponse, CreateActionPlanRequest,
    UpdateActionPlanRequest, CreateActionItemRequest, UpdateActionItemRequest
)

# Constants for error messages
ACTION_PLAN_NOT_FOUND = "Action plan not found"
ACTION_ITEM_NOT_FOUND = "Action item not found"


class ActionPlansService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_action_plan(self, data: CreateActionPlanRequest, user_id: str, system_id: str) -> ActionPlanResponse:
        action_plan = ActionPlan(
            user_id=user_id,
            system_id=system_id,
            title=data.title,
            description=data.description,
            status=data.status.value if data.status else "active"
        )
        
        self.db.add(action_plan)
        await self.db.commit()
        await self.db.refresh(action_plan)
        
        return self._action_plan_to_response(action_plan)

    async def get_action_plans(self, user_id: str, system_id: str) -> List[ActionPlanResponse]:
        result = await self.db.execute(
            select(ActionPlan)
            .where(ActionPlan.user_id == user_id)
            .where(ActionPlan.system_id == system_id)
            .order_by(ActionPlan.created_at.desc())
        )
        action_plans = result.scalars().all()
        return [self._action_plan_to_response(plan) for plan in action_plans]

    async def get_action_plan(self, plan_id: str, user_id: str, system_id: str) -> ActionPlanResponse:
        result = await self.db.execute(
            select(ActionPlan)
            .where(ActionPlan.id == plan_id)
            .where(ActionPlan.user_id == user_id)
            .where(ActionPlan.system_id == system_id)
        )
        action_plan = result.scalar_one_or_none()
        
        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ACTION_PLAN_NOT_FOUND
            )
        
        return self._action_plan_to_response(action_plan)

    async def update_action_plan(self, plan_id: str, data: UpdateActionPlanRequest, user_id: str, system_id: str) -> ActionPlanResponse:
        result = await self.db.execute(
            select(ActionPlan)
            .where(ActionPlan.id == plan_id)
            .where(ActionPlan.user_id == user_id)
            .where(ActionPlan.system_id == system_id)
        )
        action_plan = result.scalar_one_or_none()
        
        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ACTION_PLAN_NOT_FOUND
            )
        
        # Update fields
        if data.title is not None:
            action_plan.title = data.title
        if data.description is not None:
            action_plan.description = data.description
        if data.status is not None:
            action_plan.status = data.status.value
        
        await self.db.commit()
        await self.db.refresh(action_plan)
        
        return self._action_plan_to_response(action_plan)

    async def delete_action_plan(self, plan_id: str, user_id: str, system_id: str) -> None:
        result = await self.db.execute(
            select(ActionPlan)
            .where(ActionPlan.id == plan_id)
            .where(ActionPlan.user_id == user_id)
            .where(ActionPlan.system_id == system_id)
        )
        action_plan = result.scalar_one_or_none()
        
        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ACTION_PLAN_NOT_FOUND
            )
        
        # Delete action plan (cascade will handle action items)
        await self.db.delete(action_plan)
        await self.db.commit()

    # Action Items Methods
    async def create_action_item(self, plan_id: str, data: CreateActionItemRequest, user_id: str, system_id: str) -> ActionItemResponse:
        # Verify action plan exists and belongs to user
        await self.get_action_plan(plan_id, user_id, system_id)
        
        action_item = ActionItem(
            action_plan_id=plan_id,
            title=data.title,
            description=data.description,
            priority=data.priority.value if data.priority else "medium",
            status=data.status.value if data.status else "pending",
            due_date=data.due_date
        )
        
        self.db.add(action_item)
        await self.db.commit()
        await self.db.refresh(action_item)
        
        return self._action_item_to_response(action_item)

    async def get_action_items(self, plan_id: str, user_id: str, system_id: str) -> List[ActionItemResponse]:
        # Verify action plan exists and belongs to user
        await self.get_action_plan(plan_id, user_id, system_id)
        
        result = await self.db.execute(
            select(ActionItem)
            .where(ActionItem.action_plan_id == plan_id)
            .order_by(ActionItem.created_at.desc())
        )
        action_items = result.scalars().all()
        return [self._action_item_to_response(item) for item in action_items]

    async def get_action_item(self, item_id: str, user_id: str, system_id: str) -> ActionItemResponse:
        result = await self.db.execute(
            select(ActionItem)
            .join(ActionPlan)
            .where(ActionItem.id == item_id)
            .where(ActionPlan.user_id == user_id)
            .where(ActionPlan.system_id == system_id)
        )
        action_item = result.scalar_one_or_none()
        
        if not action_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ACTION_ITEM_NOT_FOUND
            )
        
        return self._action_item_to_response(action_item)

    async def update_action_item(self, item_id: str, data: UpdateActionItemRequest, user_id: str, system_id: str) -> ActionItemResponse:
        result = await self.db.execute(
            select(ActionItem)
            .join(ActionPlan)
            .where(ActionItem.id == item_id)
            .where(ActionPlan.user_id == user_id)
            .where(ActionPlan.system_id == system_id)
        )
        action_item = result.scalar_one_or_none()
        
        if not action_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ACTION_ITEM_NOT_FOUND
            )
        
        # Update fields
        if data.title is not None:
            action_item.title = data.title
        if data.description is not None:
            action_item.description = data.description
        if data.priority is not None:
            action_item.priority = data.priority.value
        if data.status is not None:
            action_item.status = data.status.value
        if data.due_date is not None:
            action_item.due_date = data.due_date
        
        await self.db.commit()
        await self.db.refresh(action_item)
        
        return self._action_item_to_response(action_item)

    async def delete_action_item(self, item_id: str, user_id: str, system_id: str) -> None:
        result = await self.db.execute(
            select(ActionItem)
            .join(ActionPlan)
            .where(ActionItem.id == item_id)
            .where(ActionPlan.user_id == user_id)
            .where(ActionPlan.system_id == system_id)
        )
        action_item = result.scalar_one_or_none()
        
        if not action_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ACTION_ITEM_NOT_FOUND
            )
        
        await self.db.delete(action_item)
        await self.db.commit()

    # Helper methods
    def _action_plan_to_response(self, action_plan: ActionPlan) -> ActionPlanResponse:
        return ActionPlanResponse(
            id=action_plan.id,
            title=action_plan.title,
            description=action_plan.description,
            status=action_plan.status,
            createdAt=action_plan.created_at,
            updatedAt=action_plan.updated_at
        )

    def _action_item_to_response(self, action_item: ActionItem) -> ActionItemResponse:
        return ActionItemResponse(
            id=action_item.id,
            actionPlanId=action_item.action_plan_id,
            title=action_item.title,
            description=action_item.description,
            priority=action_item.priority,
            status=action_item.status,
            dueDate=action_item.due_date,
            createdAt=action_item.created_at,
            updatedAt=action_item.updated_at
        )
