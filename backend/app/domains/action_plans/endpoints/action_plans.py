from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import verify_tenant_access, CurrentUser
from app.shared.schemas.action_plan import (
    ActionPlanResponse,
    ActionItemResponse,
    CreateActionPlanRequest,
    UpdateActionPlanRequest,
    CreateActionItemRequest,
    UpdateActionItemRequest
)
from app.domains.action_plans.services.action_plans_service import ActionPlansService

router = APIRouter()


@router.post("", response_model=ActionPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_action_plan(
    data: CreateActionPlanRequest,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.create_action_plan(data, current_user.userId, current_user.systemId)


@router.get("", response_model=List[ActionPlanResponse])
async def get_all_action_plans(
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.get_action_plans(current_user.userId, current_user.systemId)


@router.get("/{id}", response_model=ActionPlanResponse)
async def get_action_plan_by_id(
    id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.get_action_plan(id, current_user.userId, current_user.systemId)


@router.put("/{id}", response_model=ActionPlanResponse)
async def update_action_plan(
    id: str,
    data: UpdateActionPlanRequest,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.update_action_plan(id, data, current_user.userId, current_user.systemId)


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_action_plan(
    id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    await service.delete_action_plan(id, current_user.userId, current_user.systemId)
    return {"message": "Action plan deleted successfully"}


# Action Items endpoints
@router.post("/{plan_id}/items", response_model=ActionItemResponse, status_code=status.HTTP_201_CREATED)
async def create_action_item(
    plan_id: str,
    data: CreateActionItemRequest,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.create_action_item(plan_id, data, current_user.userId, current_user.systemId)


@router.get("/{plan_id}/items", response_model=List[ActionItemResponse])
async def get_action_items(
    plan_id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.get_action_items(plan_id, current_user.userId, current_user.systemId)


@router.get("/items/{item_id}", response_model=ActionItemResponse)
async def get_action_item(
    item_id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.get_action_item(item_id, current_user.userId, current_user.systemId)


@router.put("/items/{item_id}", response_model=ActionItemResponse)
async def update_action_item(
    item_id: str,
    data: UpdateActionItemRequest,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.update_action_item(item_id, data, current_user.userId, current_user.systemId)


@router.delete("/items/{item_id}", status_code=status.HTTP_200_OK)
async def delete_action_item(
    item_id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    await service.delete_action_item(item_id, current_user.userId, current_user.systemId)
    return {"message": "Action item deleted successfully"}
