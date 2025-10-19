import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.action_plan import ActionPlan, ActionItem
from app.schemas.action_plan import (
    ActionPlanResponse,
    ActionItemResponse,
    CreateActionPlanRequest,
    UpdateActionPlanRequest,
    CreateActionItemRequest,
    UpdateActionItemRequest
)

logger = logging.getLogger(__name__)


class ActionPlansService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_action_plan(
        self,
        user_id: str,
        system_id: str,
        data: CreateActionPlanRequest
    ) -> ActionPlanResponse:
        action_plan = ActionPlan(
            user_id=user_id,
            system_id=system_id,
            title=data.title,
            description=data.description,
            status=data.status,
        )

        self.db.add(action_plan)
        await self.db.commit()
        await self.db.refresh(action_plan, ["action_items"])

        return ActionPlanResponse.from_orm_with_camel(action_plan)

    async def find_all_action_plans(self, user_id: str, system_id: str) -> list[ActionPlanResponse]:
        result = await self.db.execute(
            select(ActionPlan)
            .where(ActionPlan.user_id == user_id, ActionPlan.system_id == system_id)
            .options(selectinload(ActionPlan.action_items))
            .order_by(ActionPlan.created_at.desc())
        )
        action_plans = result.scalars().all()

        return [ActionPlanResponse.from_orm_with_camel(plan) for plan in action_plans]

    async def find_action_plan_by_id(self, plan_id: str, user_id: str, system_id: str) -> ActionPlanResponse:
        result = await self.db.execute(
            select(ActionPlan)
            .where(
                ActionPlan.id == plan_id,
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id
            )
            .options(selectinload(ActionPlan.action_items))
        )
        action_plan = result.scalar_one_or_none()

        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action plan not found"
            )

        return ActionPlanResponse.from_orm_with_camel(action_plan)

    async def update_action_plan(
        self,
        plan_id: str,
        user_id: str,
        system_id: str,
        data: UpdateActionPlanRequest
    ) -> ActionPlanResponse:
        result = await self.db.execute(
            select(ActionPlan)
            .where(
                ActionPlan.id == plan_id,
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id
            )
        )
        action_plan = result.scalar_one_or_none()

        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action plan not found"
            )

        if data.title is not None:
            action_plan.title = data.title
        if data.description is not None:
            action_plan.description = data.description
        if data.status is not None:
            action_plan.status = data.status

        await self.db.commit()
        await self.db.refresh(action_plan, ["action_items"])

        return ActionPlanResponse.from_orm_with_camel(action_plan)

    async def delete_action_plan(self, plan_id: str, user_id: str, system_id: str):
        result = await self.db.execute(
            select(ActionPlan)
            .where(
                ActionPlan.id == plan_id,
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id
            )
        )
        action_plan = result.scalar_one_or_none()

        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action plan not found"
            )

        await self.db.delete(action_plan)
        await self.db.commit()

        return {"message": "Action plan deleted successfully"}

    async def create_action_item(
        self,
        plan_id: str,
        user_id: str,
        system_id: str,
        data: CreateActionItemRequest
    ) -> ActionItemResponse:
        result = await self.db.execute(
            select(ActionPlan)
            .where(
                ActionPlan.id == plan_id,
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id
            )
        )
        action_plan = result.scalar_one_or_none()

        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action plan not found"
            )

        action_item = ActionItem(
            action_plan_id=plan_id,
            title=data.title,
            description=data.description,
            due_date=data.dueDate,
            priority=data.priority,
        )

        self.db.add(action_item)
        await self.db.commit()
        await self.db.refresh(action_item)

        return ActionItemResponse.from_orm_with_camel(action_item)

    async def find_action_items_by_plan_id(
        self,
        plan_id: str,
        user_id: str,
        system_id: str
    ) -> list[ActionItemResponse]:
        result = await self.db.execute(
            select(ActionPlan)
            .where(
                ActionPlan.id == plan_id,
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id
            )
        )
        action_plan = result.scalar_one_or_none()

        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action plan not found"
            )

        result = await self.db.execute(
            select(ActionItem)
            .where(ActionItem.action_plan_id == plan_id)
            .order_by(ActionItem.created_at.desc())
        )
        action_items = result.scalars().all()

        return [ActionItemResponse.from_orm_with_camel(item) for item in action_items]

    async def find_action_item_by_id(
        self,
        item_id: str,
        plan_id: str,
        user_id: str,
        system_id: str
    ) -> ActionItemResponse:
        result = await self.db.execute(
            select(ActionPlan)
            .where(
                ActionPlan.id == plan_id,
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id
            )
        )
        action_plan = result.scalar_one_or_none()

        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action plan not found"
            )

        result = await self.db.execute(
            select(ActionItem).where(
                ActionItem.id == item_id,
                ActionItem.action_plan_id == plan_id
            )
        )
        action_item = result.scalar_one_or_none()

        if not action_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action item not found"
            )

        return ActionItemResponse.from_orm_with_camel(action_item)

    async def update_action_item(
        self,
        item_id: str,
        plan_id: str,
        user_id: str,
        system_id: str,
        data: UpdateActionItemRequest
    ) -> ActionItemResponse:
        result = await self.db.execute(
            select(ActionPlan)
            .where(
                ActionPlan.id == plan_id,
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id
            )
        )
        action_plan = result.scalar_one_or_none()

        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action plan not found"
            )

        result = await self.db.execute(
            select(ActionItem).where(
                ActionItem.id == item_id,
                ActionItem.action_plan_id == plan_id
            )
        )
        action_item = result.scalar_one_or_none()

        if not action_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action item not found"
            )

        if data.title is not None:
            action_item.title = data.title
        if data.description is not None:
            action_item.description = data.description
        if data.dueDate is not None:
            action_item.due_date = data.dueDate
        if data.priority is not None:
            action_item.priority = data.priority

        await self.db.commit()
        await self.db.refresh(action_item)

        return ActionItemResponse.from_orm_with_camel(action_item)

    async def complete_action_item(
        self,
        item_id: str,
        plan_id: str,
        user_id: str,
        system_id: str
    ) -> ActionItemResponse:
        result = await self.db.execute(
            select(ActionPlan)
            .where(
                ActionPlan.id == plan_id,
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id
            )
        )
        action_plan = result.scalar_one_or_none()

        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action plan not found"
            )

        result = await self.db.execute(
            select(ActionItem).where(
                ActionItem.id == item_id,
                ActionItem.action_plan_id == plan_id
            )
        )
        action_item = result.scalar_one_or_none()

        if not action_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action item not found"
            )

        action_item.completed_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(action_item)

        return ActionItemResponse.from_orm_with_camel(action_item)

    async def uncomplete_action_item(
        self,
        item_id: str,
        plan_id: str,
        user_id: str,
        system_id: str
    ) -> ActionItemResponse:
        result = await self.db.execute(
            select(ActionPlan)
            .where(
                ActionPlan.id == plan_id,
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id
            )
        )
        action_plan = result.scalar_one_or_none()

        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action plan not found"
            )

        result = await self.db.execute(
            select(ActionItem).where(
                ActionItem.id == item_id,
                ActionItem.action_plan_id == plan_id
            )
        )
        action_item = result.scalar_one_or_none()

        if not action_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action item not found"
            )

        action_item.completed_at = None

        await self.db.commit()
        await self.db.refresh(action_item)

        return ActionItemResponse.from_orm_with_camel(action_item)

    async def delete_action_item(self, item_id: str, plan_id: str, user_id: str, system_id: str):
        result = await self.db.execute(
            select(ActionPlan)
            .where(
                ActionPlan.id == plan_id,
                ActionPlan.user_id == user_id,
                ActionPlan.system_id == system_id
            )
        )
        action_plan = result.scalar_one_or_none()

        if not action_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action plan not found"
            )

        result = await self.db.execute(
            select(ActionItem).where(
                ActionItem.id == item_id,
                ActionItem.action_plan_id == plan_id
            )
        )
        action_item = result.scalar_one_or_none()

        if not action_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action item not found"
            )

        await self.db.delete(action_item)
        await self.db.commit()

        return {"message": "Action item deleted successfully"}
