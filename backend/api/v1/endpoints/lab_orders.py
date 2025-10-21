"""
Lab Orders API Endpoints - Complete medical workflow for lab test orders
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from core.database import get_db
from core.dependencies import get_current_user, verify_tenant_access, CurrentUser
from schemas.lab_order import (
    LabTestOrderCreate, LabTestOrderUpdate, LabTestOrderResponse,
    LabTestOrderWithDetails, LabTestOrderListFilter, LabTestOrderListResponse,
    LabStats, PatientLabSummary, PhysicianLabWorkload
)
from services.lab_orders_service import LabOrdersService

router = APIRouter()


@router.post("/", response_model=LabTestOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_lab_order(
    order_data: LabTestOrderCreate,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Create a new lab test order"""
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.create_lab_order(order_data)


@router.get("/{order_id}", response_model=LabTestOrderWithDetails)
async def get_lab_order(
    order_id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific lab order with details"""
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.get_lab_order(order_id, current_user.systemId)


@router.put("/{order_id}", response_model=LabTestOrderResponse)
async def update_lab_order(
    order_id: str,
    update_data: LabTestOrderUpdate,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Update a lab order"""
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.update_lab_order(order_id, update_data, current_user.systemId)


@router.delete("/{order_id}", status_code=status.HTTP_200_OK)
async def delete_lab_order(
    order_id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Delete a lab order"""
    lab_orders_service = LabOrdersService(db)
    await lab_orders_service.delete_lab_order(order_id, current_user.systemId)
    return {"message": "Lab order deleted successfully"}


@router.get("/", response_model=LabTestOrderListResponse)
async def list_lab_orders(
    patient_id: Optional[str] = Query(None, description="Filter by patient ID"),
    ordering_physician_id: Optional[str] = Query(None, description="Filter by physician ID"),
    status: Optional[str] = Query(None, description="Filter by order status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    start_date: Optional[str] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (ISO format)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """List lab orders with filtering and pagination"""
    from datetime import datetime
    
    # Parse dates if provided
    parsed_start_date = None
    parsed_end_date = None
    if start_date:
        try:
            parsed_start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use ISO format."
            )
    if end_date:
        try:
            parsed_end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use ISO format."
            )

    filters = LabTestOrderListFilter(
        patient_id=patient_id,
        ordering_physician_id=ordering_physician_id,
        status=status,
        priority=priority,
        start_date=parsed_start_date,
        end_date=parsed_end_date,
        skip=skip,
        limit=limit
    )

    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.list_lab_orders(filters, current_user.systemId)


@router.post("/{order_id}/collect", response_model=LabTestOrderResponse)
async def mark_sample_collected(
    order_id: str,
    collected_by: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Mark lab sample as collected"""
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.mark_sample_collected(order_id, collected_by, current_user.systemId)


@router.get("/stats/overview", response_model=LabStats)
async def get_lab_stats(
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Get lab module statistics"""
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.get_lab_stats(current_user.systemId)


@router.get("/patient/{patient_id}/summary", response_model=PatientLabSummary)
async def get_patient_lab_summary(
    patient_id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Get patient's lab test summary"""
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.get_patient_lab_summary(patient_id, current_user.systemId)


@router.get("/physician/{physician_id}/workload", response_model=PhysicianLabWorkload)
async def get_physician_workload(
    physician_id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Get physician's lab review workload"""
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.get_physician_workload(physician_id, current_user.systemId)
