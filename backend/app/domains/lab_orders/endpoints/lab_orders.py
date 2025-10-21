"""
Lab Orders API Endpoints - Complete medical workflow for lab test orders
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_tenant_access, CurrentUser
from app.shared.schemas.lab_order import (
    LabTestOrderCreate, LabTestOrderUpdate, LabTestOrderResponse,
    LabTestOrderWithDetails, LabTestOrderListFilter, LabTestOrderListResponse,
    LabStats, PatientLabSummary, PhysicianLabWorkload
)
from app.domains.lab_orders.services.lab_orders_service import LabOrdersService

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
    ordering_physician_id: Optional[str] = Query(None, description="Filter by ordering physician"),
    test_type: Optional[str] = Query(None, description="Filter by test type"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    status: Optional[str] = Query(None, description="Filter by status"),
    start_date: Optional[str] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (ISO format)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """List lab orders with filtering and pagination"""
    from datetime import date
    
    # Parse dates if provided
    parsed_start_date = None
    parsed_end_date = None
    if start_date:
        try:
            parsed_start_date = date.fromisoformat(start_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use ISO date format (YYYY-MM-DD)."
            )
    if end_date:
        try:
            parsed_end_date = date.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use ISO date format (YYYY-MM-DD)."
            )

    filters = LabTestOrderListFilter(
        patient_id=patient_id,
        ordering_physician_id=ordering_physician_id,
        test_type=test_type,
        priority=priority,
        status=status,
        start_date=parsed_start_date,
        end_date=parsed_end_date,
        skip=skip,
        limit=limit
    )

    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.list_lab_orders(filters, current_user.systemId)


@router.get("/stats/overview", response_model=LabStats)
async def get_lab_stats(
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Get lab statistics overview for the system"""
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.get_lab_stats(current_user.systemId)


@router.get("/patient/{patient_id}/summary", response_model=PatientLabSummary)
async def get_patient_lab_summary(
    patient_id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Get lab summary for a specific patient"""
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.get_patient_lab_summary(patient_id, current_user.systemId)


@router.get("/physician/{physician_id}/workload", response_model=PhysicianLabWorkload)
async def get_physician_lab_workload(
    physician_id: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Get lab workload for a specific physician"""
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.get_physician_lab_workload(physician_id, current_user.systemId)


@router.put("/{order_id}/status", response_model=LabTestOrderResponse)
async def update_lab_order_status(
    order_id: str,
    new_status: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Update the status of a lab order"""
    from app.shared.schemas.enums import LabOrderStatus
    
    # Validate status
    try:
        status_enum = LabOrderStatus(new_status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {[s.value for s in LabOrderStatus]}"
        )
    
    update_data = LabTestOrderUpdate(status=status_enum)
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.update_lab_order(order_id, update_data, current_user.systemId)


@router.put("/{order_id}/priority", response_model=LabTestOrderResponse)
async def update_lab_order_priority(
    order_id: str,
    new_priority: str,
    current_user: CurrentUser = Depends(verify_tenant_access),
    db: AsyncSession = Depends(get_db)
):
    """Update the priority of a lab order"""
    from app.shared.schemas.enums import LabOrderPriority
    
    # Validate priority
    try:
        priority_enum = LabOrderPriority(new_priority)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid priority. Must be one of: {[p.value for p in LabOrderPriority]}"
        )
    
    update_data = LabTestOrderUpdate(priority=priority_enum)
    lab_orders_service = LabOrdersService(db)
    return await lab_orders_service.update_lab_order(order_id, update_data, current_user.systemId)
