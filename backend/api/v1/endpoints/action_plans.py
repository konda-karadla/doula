from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from backend.core.database import get_db
from backend.core.dependencies import verify_tenant_access, CurrentUser
from backend.schemas.action_plan import (
    ActionPlanResponse,
    ActionItemResponse,
    CreateActionPlanRequest,
    UpdateActionPlanRequest,
    CreateActionItemRequest,
    UpdateActionItemRequest
)
from backend.services.action_plans_service import ActionPlansService

router = APIRouter()


@router.post("", response_model=ActionPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_action_plan(
    data: CreateActionPlanRequest,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.create_action_plan(current_user.userId, current_user.systemId, data)


@router.get("", response_model=List[ActionPlanResponse])
async def get_all_action_plans(
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.find_all_action_plans(current_user.userId, current_user.systemId)


@router.get("/{id}", response_model=ActionPlanResponse)
async def get_action_plan_by_id(
    id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.find_action_plan_by_id(id, current_user.userId, current_user.systemId)


@router.put("/{id}", response_model=ActionPlanResponse)
async def update_action_plan(
    id: str,
    data: UpdateActionPlanRequest,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.update_action_plan(id, current_user.userId, current_user.systemId, data)


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_action_plan(
    id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.delete_action_plan(id, current_user.userId, current_user.systemId)


@router.post("/{planId}/items", response_model=ActionItemResponse, status_code=status.HTTP_201_CREATED)
async def create_action_item(
    planId: str,
    data: CreateActionItemRequest,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.create_action_item(planId, current_user.userId, current_user.systemId, data)


@router.get("/{planId}/items", response_model=List[ActionItemResponse])
async def get_action_items(
    planId: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.find_action_items_by_plan_id(planId, current_user.userId, current_user.systemId)


@router.get("/{planId}/items/{itemId}", response_model=ActionItemResponse)
async def get_action_item_by_id(
    planId: str,
    itemId: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.find_action_item_by_id(itemId, planId, current_user.userId, current_user.systemId)


@router.put("/{planId}/items/{itemId}", response_model=ActionItemResponse)
async def update_action_item(
    planId: str,
    itemId: str,
    data: UpdateActionItemRequest,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.update_action_item(itemId, planId, current_user.userId, current_user.systemId, data)


@router.patch("/{planId}/items/{itemId}/complete", response_model=ActionItemResponse)
async def complete_action_item(
    planId: str,
    itemId: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.complete_action_item(itemId, planId, current_user.userId, current_user.systemId)


@router.patch("/{planId}/items/{itemId}/uncomplete", response_model=ActionItemResponse)
async def uncomplete_action_item(
    planId: str,
    itemId: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.uncomplete_action_item(itemId, planId, current_user.userId, current_user.systemId)


@router.delete("/{planId}/items/{itemId}", status_code=status.HTTP_200_OK)
async def delete_action_item(
    planId: str,
    itemId: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    service = ActionPlansService(db)
    return await service.delete_action_item(itemId, planId, current_user.userId, current_user.systemId)
