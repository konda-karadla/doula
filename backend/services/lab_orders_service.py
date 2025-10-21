"""
Lab Orders Service - Complete medical workflow for lab test orders
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime, date

from models.lab_order import LabTestOrder
from models.lab_result import LabResult, Biomarker
from models.user import User
from models.staff import Staff
from models.system import System
from schemas.lab_order import (
    LabTestOrderCreate, LabTestOrderUpdate, LabTestOrderResponse,
    LabTestOrderWithDetails, LabTestOrderListFilter, LabTestOrderListResponse,
    LabStats, PatientLabSummary, PhysicianLabWorkload
)
from schemas.enums import LabOrderStatus, LabOrderPriority


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
            order_date=order_data.order_date,
            priority=order_data.priority,
            test_types=order_data.test_types,
            clinical_indication=order_data.clinical_indication,
            special_instructions=order_data.special_instructions,
            external_lab_name=order_data.external_lab_name,
            external_lab_reference=order_data.external_lab_reference,
            status=LabOrderStatus.ORDERED
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
                selectinload(LabTestOrder.collector)
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

        return LabTestOrderWithDetails(
            **lab_order.__dict__,
            patient_name=f"{lab_order.patient.first_name} {lab_order.patient.last_name}",
            patient_email=lab_order.patient.email,
            ordering_physician_name=f"{lab_order.ordering_physician.first_name} {lab_order.ordering_physician.last_name}",
            ordering_physician_credentials=lab_order.ordering_physician.credentials,
            collector_name=f"{lab_order.collector.first_name} {lab_order.collector.last_name}" if lab_order.collector else None
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

        # Only allow deletion if order is not completed
        if lab_order.status == LabOrderStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete completed lab orders"
            )

        await self.db.delete(lab_order)
        await self.db.commit()

    async def list_lab_orders(self, filters: LabTestOrderListFilter, system_id: str) -> LabTestOrderListResponse:
        """List lab orders with filtering and pagination"""
        query = select(LabTestOrder).options(
            selectinload(LabTestOrder.patient),
            selectinload(LabTestOrder.ordering_physician),
            selectinload(LabTestOrder.collector)
        ).where(LabTestOrder.system_id == system_id)

        # Apply filters
        if filters.patient_id:
            query = query.where(LabTestOrder.patient_id == filters.patient_id)
        if filters.ordering_physician_id:
            query = query.where(LabTestOrder.ordering_physician_id == filters.ordering_physician_id)
        if filters.status:
            query = query.where(LabTestOrder.status == filters.status)
        if filters.priority:
            query = query.where(LabTestOrder.priority == filters.priority)
        if filters.start_date:
            query = query.where(LabTestOrder.order_date >= filters.start_date)
        if filters.end_date:
            query = query.where(LabTestOrder.order_date <= filters.end_date)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination and ordering
        query = query.order_by(desc(LabTestOrder.order_date)).offset(filters.skip).limit(filters.limit)

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
                ordering_physician_credentials=order.ordering_physician.credentials,
                collector_name=f"{order.collector.first_name} {order.collector.last_name}" if order.collector else None
            ))

        return LabTestOrderListResponse(
            items=items,
            total=total,
            skip=filters.skip,
            limit=filters.limit,
            has_more=(filters.skip + len(items)) < total
        )

    async def mark_sample_collected(self, order_id: str, collected_by: str, system_id: str) -> LabTestOrderResponse:
        """Mark lab sample as collected"""
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

        if lab_order.status != LabOrderStatus.ORDERED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only collect samples from ordered status"
            )

        # Verify collector exists
        collector = await self.db.execute(
            select(Staff).where(Staff.id == collected_by)
        )
        if not collector.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collector not found"
            )

        lab_order.status = LabOrderStatus.COLLECTED
        lab_order.collection_date = datetime.now()
        lab_order.collected_by = collected_by
        lab_order.updated_at = datetime.now()

        await self.db.commit()
        await self.db.refresh(lab_order)

        return LabTestOrderResponse.model_validate(lab_order)

    async def get_lab_stats(self, system_id: str) -> LabStats:
        """Get lab module statistics"""
        # Total orders
        total_orders_result = await self.db.execute(
            select(func.count()).select_from(LabTestOrder).where(LabTestOrder.system_id == system_id)
        )
        total_orders = total_orders_result.scalar()

        # Pending orders
        pending_orders_result = await self.db.execute(
            select(func.count()).select_from(LabTestOrder).where(
                and_(
                    LabTestOrder.system_id == system_id,
                    LabTestOrder.status.in_([LabOrderStatus.ORDERED, LabOrderStatus.COLLECTED, LabOrderStatus.PROCESSING])
                )
            )
        )
        pending_orders = pending_orders_result.scalar()

        # Completed orders
        completed_orders_result = await self.db.execute(
            select(func.count()).select_from(LabTestOrder).where(
                and_(
                    LabTestOrder.system_id == system_id,
                    LabTestOrder.status == LabOrderStatus.COMPLETED
                )
            )
        )
        completed_orders = completed_orders_result.scalar()

        # Total results
        total_results_result = await self.db.execute(
            select(func.count()).select_from(LabResult).where(LabResult.system_id == system_id)
        )
        total_results = total_results_result.scalar()

        # Unreviewed results
        unreviewed_results_result = await self.db.execute(
            select(func.count()).select_from(LabResult).where(
                and_(
                    LabResult.system_id == system_id,
                    LabResult.is_reviewed == False
                )
            )
        )
        unreviewed_results = unreviewed_results_result.scalar()

        # Results with critical values
        critical_results_result = await self.db.execute(
            select(func.count()).select_from(Biomarker).join(LabResult).where(
                and_(
                    LabResult.system_id == system_id,
                    Biomarker.is_critical == True
                )
            )
        )
        results_with_critical_values = critical_results_result.scalar()

        # Orders this week
        week_ago = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = week_ago.replace(day=week_ago.day - 7)
        
        orders_this_week_result = await self.db.execute(
            select(func.count()).select_from(LabTestOrder).where(
                and_(
                    LabTestOrder.system_id == system_id,
                    LabTestOrder.order_date >= week_ago
                )
            )
        )
        orders_this_week = orders_this_week_result.scalar()

        return LabStats(
            total_orders=total_orders,
            pending_orders=pending_orders,
            completed_orders=completed_orders,
            total_results=total_results,
            unreviewed_results=unreviewed_results,
            results_with_critical_values=results_with_critical_values,
            orders_this_week=orders_this_week
        )

    async def get_patient_lab_summary(self, patient_id: str, system_id: str) -> PatientLabSummary:
        """Get patient's lab test summary"""
        # Get patient info
        patient_result = await self.db.execute(
            select(User).where(User.id == patient_id)
        )
        patient = patient_result.scalar_one_or_none()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # Get total results
        total_results_result = await self.db.execute(
            select(func.count()).select_from(LabResult).where(
                and_(
                    LabResult.user_id == patient_id,
                    LabResult.system_id == system_id
                )
            )
        )
        total_results = total_results_result.scalar()

        # Get recent results (last 5)
        recent_results_result = await self.db.execute(
            select(LabResult)
            .options(selectinload(LabResult.biomarkers))
            .where(
                and_(
                    LabResult.user_id == patient_id,
                    LabResult.system_id == system_id
                )
            )
            .order_by(desc(LabResult.test_date))
            .limit(5)
        )
        recent_results = recent_results_result.scalars().all()

        # Get pending orders
        pending_orders_result = await self.db.execute(
            select(func.count()).select_from(LabTestOrder).where(
                and_(
                    LabTestOrder.patient_id == patient_id,
                    LabTestOrder.system_id == system_id,
                    LabTestOrder.status.in_([LabOrderStatus.ORDERED, LabOrderStatus.COLLECTED, LabOrderStatus.PROCESSING])
                )
            )
        )
        pending_orders = pending_orders_result.scalar()

        # Get last test date
        last_test_result = await self.db.execute(
            select(LabResult.test_date)
            .where(
                and_(
                    LabResult.user_id == patient_id,
                    LabResult.system_id == system_id
                )
            )
            .order_by(desc(LabResult.test_date))
            .limit(1)
        )
        last_test_date = last_test_result.scalar_one_or_none()

        # Get critical values count
        critical_count_result = await self.db.execute(
            select(func.count()).select_from(Biomarker).join(LabResult).where(
                and_(
                    LabResult.user_id == patient_id,
                    LabResult.system_id == system_id,
                    Biomarker.is_critical == True
                )
            )
        )
        critical_values_count = critical_count_result.scalar()

        return PatientLabSummary(
            patient_id=patient_id,
            patient_name=f"{patient.first_name} {patient.last_name}",
            total_results=total_results,
            recent_results=[],  # Would need to convert to proper response format
            pending_orders=pending_orders,
            last_test_date=last_test_date,
            critical_values_count=critical_values_count
        )

    async def get_physician_workload(self, physician_id: str, system_id: str) -> PhysicianLabWorkload:
        """Get physician's lab review workload"""
        # Get physician info
        physician_result = await self.db.execute(
            select(Staff).where(Staff.id == physician_id)
        )
        physician = physician_result.scalar_one_or_none()
        if not physician:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Physician not found"
            )

        # Get pending reviews (results ordered by this physician but not reviewed)
        pending_reviews_result = await self.db.execute(
            select(func.count()).select_from(LabResult).where(
                and_(
                    LabResult.system_id == system_id,
                    LabResult.ordered_by == physician_id,
                    LabResult.is_reviewed == False
                )
            )
        )
        pending_reviews = pending_reviews_result.scalar()

        # Get reviewed this week
        week_ago = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = week_ago.replace(day=week_ago.day - 7)
        
        reviewed_this_week_result = await self.db.execute(
            select(func.count()).select_from(LabResult).where(
                and_(
                    LabResult.system_id == system_id,
                    LabResult.reviewed_by == physician_id,
                    LabResult.reviewed_at >= week_ago
                )
            )
        )
        reviewed_this_week = reviewed_this_week_result.scalar()

        # Get orders pending results
        orders_pending_results_result = await self.db.execute(
            select(func.count()).select_from(LabTestOrder).where(
                and_(
                    LabTestOrder.system_id == system_id,
                    LabTestOrder.ordering_physician_id == physician_id,
                    LabTestOrder.status.in_([LabOrderStatus.COLLECTED, LabOrderStatus.PROCESSING])
                )
            )
        )
        orders_pending_results = orders_pending_results_result.scalar()

        # Get critical results pending review
        critical_results_pending_result = await self.db.execute(
            select(func.count()).select_from(LabResult).join(Biomarker).where(
                and_(
                    LabResult.system_id == system_id,
                    LabResult.ordered_by == physician_id,
                    LabResult.is_reviewed == False,
                    Biomarker.is_critical == True
                )
            )
        )
        critical_results_pending = critical_results_pending_result.scalar()

        return PhysicianLabWorkload(
            physician_id=physician_id,
            physician_name=f"{physician.first_name} {physician.last_name}",
            pending_reviews=pending_reviews,
            reviewed_this_week=reviewed_this_week,
            orders_pending_results=orders_pending_results,
            critical_results_pending=critical_results_pending
        )
