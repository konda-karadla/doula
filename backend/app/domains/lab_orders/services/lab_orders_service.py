"""
Lab Orders Service - Complete medical workflow for lab test orders
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime, date

from app.shared.models import LabTestOrder, LabResult, Biomarker, User, Staff, System
from app.shared.schemas.lab_order import (
    LabTestOrderCreate, LabTestOrderUpdate, LabTestOrderResponse,
    LabTestOrderWithDetails, LabTestOrderListFilter, LabTestOrderListResponse,
    LabStats, PatientLabSummary, PhysicianLabWorkload
)
from app.shared.schemas.enums import LabOrderStatus, LabOrderPriority


class LabOrdersService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_lab_order(self, order_data: LabTestOrderCreate) -> LabTestOrderResponse:
        """Create a new lab test order"""
        # Verify patient exists
        patient = await self.db.execute(
            select(User).where(User.id == order_data.patient_id)
        )
        if not patient.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # Verify physician exists
        physician = await self.db.execute(
            select(Staff).where(Staff.id == order_data.ordering_physician_id)
        )
        if not physician.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ordering physician not found"
            )

        # Verify system exists
        system = await self.db.execute(
            select(System).where(System.id == order_data.system_id)
        )
        if not system.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="System not found"
            )

        # Create lab order
        lab_order = LabTestOrder(
            patient_id=order_data.patient_id,
            ordering_physician_id=order_data.ordering_physician_id,
            system_id=order_data.system_id,
            test_type=order_data.test_type,
            test_name=order_data.test_name,
            priority=order_data.priority,
            status=LabOrderStatus.PENDING,
            notes=order_data.notes,
            clinical_notes=order_data.clinical_notes,
            fasting_required=order_data.fasting_required,
            special_instructions=order_data.special_instructions,
            expected_collection_date=order_data.expected_collection_date,
            expected_result_date=order_data.expected_result_date
        )

        self.db.add(lab_order)
        await self.db.commit()
        await self.db.refresh(lab_order)

        return LabTestOrderResponse.model_validate(lab_order)

    async def get_lab_order(self, order_id: str, system_id: str) -> LabTestOrderWithDetails:
        """Get a specific lab order with details"""
        result = await self.db.execute(
            select(LabTestOrder)
            .options(
                selectinload(LabTestOrder.patient),
                selectinload(LabTestOrder.ordering_physician),
                selectinload(LabTestOrder.results)
            )
            .where(
                and_(
                    LabTestOrder.id == order_id,
                    LabTestOrder.system_id == system_id
                )
            )
        )
        lab_order = result.scalar_one_or_none()

        if not lab_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lab order not found"
            )

        # Get lab results for this order
        results_query = await self.db.execute(
            select(LabResult)
            .options(selectinload(LabResult.biomarkers))
            .where(LabResult.lab_order_id == order_id)
        )
        lab_results = results_query.scalars().all()

        # Convert results to response format
        results_data = []
        for result in lab_results:
            results_data.append({
                "id": result.id,
                "file_name": result.file_name,
                "uploaded_at": result.uploaded_at,
                "processing_status": result.processing_status,
                "s3_url": result.s3_url,
                "biomarkers_count": len(result.biomarkers),
                "is_reviewed": result.is_reviewed
            })

        return LabTestOrderWithDetails(
            **lab_order.__dict__,
            patient_name=f"{lab_order.patient.first_name} {lab_order.patient.last_name}",
            patient_email=lab_order.patient.email,
            ordering_physician_name=f"{lab_order.ordering_physician.first_name} {lab_order.ordering_physician.last_name}",
            results=results_data,
            results_count=len(results_data)
        )

    async def update_lab_order(self, order_id: str, update_data: LabTestOrderUpdate, system_id: str) -> LabTestOrderResponse:
        """Update a lab order"""
        result = await self.db.execute(
            select(LabTestOrder).where(
                and_(
                    LabTestOrder.id == order_id,
                    LabTestOrder.system_id == system_id
                )
            )
        )
        lab_order = result.scalar_one_or_none()

        if not lab_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lab order not found"
            )

        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(lab_order, field, value)

        lab_order.updated_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(lab_order)

        return LabTestOrderResponse.model_validate(lab_order)

    async def delete_lab_order(self, order_id: str, system_id: str) -> None:
        """Delete a lab order"""
        result = await self.db.execute(
            select(LabTestOrder).where(
                and_(
                    LabTestOrder.id == order_id,
                    LabTestOrder.system_id == system_id
                )
            )
        )
        lab_order = result.scalar_one_or_none()

        if not lab_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lab order not found"
            )

        # Check if order can be deleted (not if results exist)
        results_count = await self.db.execute(
            select(func.count()).select_from(LabResult).where(LabResult.lab_order_id == order_id)
        )
        if results_count.scalar() > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete lab order with existing results"
            )

        await self.db.delete(lab_order)
        await self.db.commit()

    async def list_lab_orders(self, filters: LabTestOrderListFilter, system_id: str) -> LabTestOrderListResponse:
        """List lab orders with filtering and pagination"""
        query = select(LabTestOrder).options(
            selectinload(LabTestOrder.patient),
            selectinload(LabTestOrder.ordering_physician)
        ).where(LabTestOrder.system_id == system_id)

        # Apply filters
        if filters.patient_id:
            query = query.where(LabTestOrder.patient_id == filters.patient_id)
        if filters.ordering_physician_id:
            query = query.where(LabTestOrder.ordering_physician_id == filters.ordering_physician_id)
        if filters.test_type:
            query = query.where(LabTestOrder.test_type == filters.test_type)
        if filters.priority:
            query = query.where(LabTestOrder.priority == filters.priority)
        if filters.status:
            query = query.where(LabTestOrder.status == filters.status)
        if filters.start_date:
            query = query.where(LabTestOrder.created_at >= filters.start_date)
        if filters.end_date:
            query = query.where(LabTestOrder.created_at <= filters.end_date)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination and ordering
        query = query.order_by(desc(LabTestOrder.created_at)).offset(filters.skip).limit(filters.limit)

        result = await self.db.execute(query)
        lab_orders = result.scalars().all()

        # Convert to response format
        items = []
        for order in lab_orders:
            items.append(LabTestOrderWithDetails(
                **order.__dict__,
                patient_name=f"{order.patient.first_name} {order.patient.last_name}",
                patient_email=order.patient.email,
                ordering_physician_name=f"{order.ordering_physician.first_name} {order.ordering_physician.last_name}",
                results=[],
                results_count=0
            ))

        return LabTestOrderListResponse(
            items=items,
            total=total,
            skip=filters.skip,
            limit=filters.limit,
            has_more=(filters.skip + len(items)) < total
        )

    async def get_lab_stats(self, system_id: str) -> LabStats:
        """Get lab statistics for the system"""
        # Total orders
        total_orders = await self.db.execute(
            select(func.count()).select_from(LabTestOrder).where(LabTestOrder.system_id == system_id)
        )

        # Orders by status
        status_counts = await self.db.execute(
            select(LabTestOrder.status, func.count())
            .where(LabTestOrder.system_id == system_id)
            .group_by(LabTestOrder.status)
        )

        # Orders by priority
        priority_counts = await self.db.execute(
            select(LabTestOrder.priority, func.count())
            .where(LabTestOrder.system_id == system_id)
            .group_by(LabTestOrder.priority)
        )

        # Orders by test type
        test_type_counts = await self.db.execute(
            select(LabTestOrder.test_type, func.count())
            .where(LabTestOrder.system_id == system_id)
            .group_by(LabTestOrder.test_type)
        )

        return LabStats(
            total_orders=total_orders.scalar(),
            status_counts=dict(status_counts.fetchall()),
            priority_counts=dict(priority_counts.fetchall()),
            test_type_counts=dict(test_type_counts.fetchall())
        )

    async def get_patient_lab_summary(self, patient_id: str, system_id: str) -> PatientLabSummary:
        """Get lab summary for a specific patient"""
        # Get patient's lab orders
        orders_result = await self.db.execute(
            select(LabTestOrder)
            .where(
                and_(
                    LabTestOrder.patient_id == patient_id,
                    LabTestOrder.system_id == system_id
                )
            )
            .order_by(desc(LabTestOrder.created_at))
        )
        lab_orders = orders_result.scalars().all()

        # Get patient's lab results
        results_result = await self.db.execute(
            select(LabResult)
            .options(selectinload(LabResult.biomarkers))
            .join(LabTestOrder)
            .where(
                and_(
                    LabTestOrder.patient_id == patient_id,
                    LabTestOrder.system_id == system_id
                )
            )
            .order_by(desc(LabResult.uploaded_at))
        )
        lab_results = results_result.scalars().all()

        # Calculate statistics
        total_orders = len(lab_orders)
        completed_orders = sum(1 for order in lab_orders if order.status == LabOrderStatus.COMPLETED)
        pending_orders = sum(1 for order in lab_orders if order.status == LabOrderStatus.PENDING)
        total_results = len(lab_results)
        critical_results = sum(1 for result in lab_results if any(b.is_critical for b in result.biomarkers))

        return PatientLabSummary(
            patient_id=patient_id,
            total_orders=total_orders,
            completed_orders=completed_orders,
            pending_orders=pending_orders,
            total_results=total_results,
            critical_results=critical_results,
            recent_orders=[LabTestOrderResponse.model_validate(order) for order in lab_orders[:5]],
            recent_results=[LabResultResponse.model_validate(result) for result in lab_results[:5]]
        )

    async def get_physician_lab_workload(self, physician_id: str, system_id: str) -> PhysicianLabWorkload:
        """Get lab workload for a specific physician"""
        # Get physician's lab orders
        orders_result = await self.db.execute(
            select(LabTestOrder)
            .where(
                and_(
                    LabTestOrder.ordering_physician_id == physician_id,
                    LabTestOrder.system_id == system_id
                )
            )
            .order_by(desc(LabTestOrder.created_at))
        )
        lab_orders = orders_result.scalars().all()

        # Calculate statistics
        total_orders = len(lab_orders)
        pending_orders = sum(1 for order in lab_orders if order.status == LabOrderStatus.PENDING)
        completed_orders = sum(1 for order in lab_orders if order.status == LabOrderStatus.COMPLETED)
        urgent_orders = sum(1 for order in lab_orders if order.priority == LabOrderPriority.URGENT)

        # Get orders by test type
        test_type_counts = {}
        for order in lab_orders:
            test_type_counts[order.test_type] = test_type_counts.get(order.test_type, 0) + 1

        return PhysicianLabWorkload(
            physician_id=physician_id,
            total_orders=total_orders,
            pending_orders=pending_orders,
            completed_orders=completed_orders,
            urgent_orders=urgent_orders,
            test_type_counts=test_type_counts,
            recent_orders=[LabTestOrderResponse.model_validate(order) for order in lab_orders[:10]]
        )
