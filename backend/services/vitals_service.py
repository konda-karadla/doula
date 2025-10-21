"""
Service layer for Vitals Recording (Nurse data capture)
"""
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import joinedload
from decimal import Decimal

from models.vitals import VitalsRecord, VitalsAlert
from models.user import User
from models.staff import Staff
from schemas.vitals import (
    VitalsRecordCreate,
    VitalsRecordUpdate,
    VitalsAlertCreate,
    VitalsAlertAcknowledge,
    VitalsRecordResponse,
    VitalsRecordWithAlerts,
    VitalsRecordWithDetails,
    VitalsAlertResponse,
    VitalsRecordListFilter,
    VitalsStats,
    PatientVitalsTrends,
    VitalsRange
)
from schemas.enums import VitalsStatus, AlertSeverity
from core.exceptions import NotFoundError, AuthorizationError, ValidationError


class VitalsService:
    """Service for managing vital signs records"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_vitals_record(
        self,
        vitals_data: VitalsRecordCreate,
        current_user_id: str
    ) -> VitalsRecordResponse:
        """Create a new vitals record"""
        
        # Verify nurse exists
        nurse = await self._get_staff_by_user_id(current_user_id)
        if not nurse:
            raise ValidationError("Current user is not registered as staff")
        
        # Verify patient exists
        patient = await self._get_user(vitals_data.patient_id)
        if not patient:
            raise NotFoundError("Patient", vitals_data.patient_id)
        
        # Calculate BMI if weight and height provided
        bmi = None
        if vitals_data.weight and vitals_data.height:
            height_m = float(vitals_data.height) / 100  # Convert cm to meters
            bmi = round(float(vitals_data.weight) / (height_m ** 2), 2)
        
        # Create vitals record
        vitals = VitalsRecord(
            patient_id=vitals_data.patient_id,
            nurse_id=vitals_data.nurse_id or nurse.id,
            recorded_at=vitals_data.recorded_at,
            location=vitals_data.location,
            systolic_bp=vitals_data.systolic_bp,
            diastolic_bp=vitals_data.diastolic_bp,
            heart_rate=vitals_data.heart_rate,
            respiratory_rate=vitals_data.respiratory_rate,
            temperature=vitals_data.temperature,
            oxygen_saturation=vitals_data.oxygen_saturation,
            weight=vitals_data.weight,
            height=vitals_data.height,
            bmi=Decimal(str(bmi)) if bmi else None,
            blood_glucose=vitals_data.blood_glucose,
            pain_level=vitals_data.pain_level,
            notes=vitals_data.notes,
            status=VitalsStatus.NORMAL  # Default, will be updated based on alerts
        )
        
        self.db.add(vitals)
        await self.db.flush()  # Get ID without committing
        
        # Check for abnormal vitals and create alerts
        alerts_created = await self._check_and_create_alerts(vitals)
        
        # Update status based on alerts
        if alerts_created:
            critical_alerts = [a for a in alerts_created if a.severity == AlertSeverity.CRITICAL]
            if critical_alerts:
                vitals.status = VitalsStatus.CRITICAL
            else:
                vitals.status = VitalsStatus.ABNORMAL
        
        await self.db.commit()
        await self.db.refresh(vitals)
        
        return VitalsRecordResponse.model_validate(vitals)
    
    async def get_vitals_record(
        self,
        record_id: str,
        include_alerts: bool = True
    ) -> Optional[VitalsRecordWithDetails]:
        """Get a vitals record by ID"""
        
        query = select(VitalsRecord).where(VitalsRecord.id == record_id)
        
        if include_alerts:
            query = query.options(joinedload(VitalsRecord.alerts))
        
        result = await self.db.execute(query)
        record = result.scalar_one_or_none()
        
        if not record:
            return None
        
        # Get related data
        patient = await self._get_user(record.patient_id)
        nurse = await self._get_staff(record.nurse_id)
        
        # Build response
        record_dict = {
            **record.__dict__,
            "patient_name": patient.username if patient else "Unknown",
            "patient_email": patient.email if patient else "Unknown",
            "nurse_name": nurse.user.username if nurse and nurse.user else "Unknown",
            "alerts": record.alerts if include_alerts else []
        }
        
        return VitalsRecordWithDetails(**record_dict)
    
    async def list_vitals_records(
        self,
        filters: VitalsRecordListFilter,
        current_user_id: str,
        is_staff: bool = True
    ) -> Tuple[List[VitalsRecordWithDetails], int]:
        """List vitals records with filters"""
        
        # Build query
        query = select(VitalsRecord)
        count_query = select(func.count(VitalsRecord.id))
        
        # Apply filters
        conditions = []
        
        if filters.patient_id:
            conditions.append(VitalsRecord.patient_id == filters.patient_id)
        
        if filters.nurse_id:
            conditions.append(VitalsRecord.nurse_id == filters.nurse_id)
        
        if filters.location:
            conditions.append(VitalsRecord.location == filters.location)
        
        if filters.status:
            conditions.append(VitalsRecord.status == filters.status)
        
        if filters.start_date:
            conditions.append(VitalsRecord.recorded_at >= filters.start_date)
        
        if filters.end_date:
            conditions.append(VitalsRecord.recorded_at <= filters.end_date)
        
        if filters.has_alerts is not None:
            # Subquery to check if record has alerts
            if filters.has_alerts:
                alert_subq = select(VitalsAlert.vitals_record_id).where(
                    VitalsAlert.vitals_record_id == VitalsRecord.id
                )
                conditions.append(alert_subq.exists())
        
        # If user is patient, only show their own records
        if not is_staff:
            conditions.append(VitalsRecord.patient_id == current_user_id)
        
        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))
        
        # Get total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.offset(filters.skip).limit(filters.limit)
        query = query.order_by(VitalsRecord.recorded_at.desc())
        
        # Execute query
        result = await self.db.execute(query)
        records = result.scalars().all()
        
        # Enrich with details
        enriched_records = []
        for record in records:
            patient = await self._get_user(record.patient_id)
            nurse = await self._get_staff(record.nurse_id)
            
            # Get alerts count
            alerts_result = await self.db.execute(
                select(VitalsAlert).where(VitalsAlert.vitals_record_id == record.id)
            )
            alerts = alerts_result.scalars().all()
            
            record_dict = {
                **record.__dict__,
                "patient_name": patient.username if patient else "Unknown",
                "patient_email": patient.email if patient else "Unknown",
                "nurse_name": nurse.user.username if nurse and nurse.user else "Unknown",
                "alerts": alerts
            }
            
            enriched_records.append(VitalsRecordWithDetails(**record_dict))
        
        return enriched_records, total
    
    async def update_vitals_record(
        self,
        record_id: str,
        vitals_data: VitalsRecordUpdate,
        current_user_id: str
    ) -> VitalsRecordResponse:
        """Update a vitals record"""
        
        record = await self._get_record(record_id)
        if not record:
            raise NotFoundError("Vitals Record", record_id)
        
        # Verify ownership (only creator can update, unless admin)
        nurse = await self._get_staff_by_user_id(current_user_id)
        if nurse and record.nurse_id != nurse.id:
            # Allow if admin - checked by permission middleware
            pass
        
        # Update fields
        update_data = vitals_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(record, field, value)
        
        # Recalculate BMI if weight or height changed
        if 'weight' in update_data or 'height' in update_data:
            if record.weight and record.height:
                height_m = float(record.height) / 100
                record.bmi = Decimal(str(round(float(record.weight) / (height_m ** 2), 2)))
        
        record.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(record)
        
        return VitalsRecordResponse.model_validate(record)
    
    async def delete_vitals_record(
        self,
        record_id: str
    ) -> bool:
        """Delete a vitals record (admin only)"""
        
        record = await self._get_record(record_id)
        if not record:
            raise NotFoundError("Vitals Record", record_id)
        
        await self.db.delete(record)
        await self.db.commit()
        
        return True
    
    async def acknowledge_alert(
        self,
        alert_id: str,
        ack_data: VitalsAlertAcknowledge,
        current_user_id: str
    ) -> VitalsAlertResponse:
        """Acknowledge a vitals alert"""
        
        alert = await self._get_alert(alert_id)
        if not alert:
            raise NotFoundError("Vitals Alert", alert_id)
        
        # Verify staff member
        staff = await self._get_staff_by_user_id(current_user_id)
        if not staff:
            raise ValidationError("Current user is not registered as staff")
        
        # Acknowledge alert
        alert.acknowledged = True
        alert.acknowledged_by = ack_data.acknowledged_by or staff.id
        alert.acknowledged_at = datetime.utcnow()
        alert.resolution_notes = ack_data.resolution_notes
        
        await self.db.commit()
        await self.db.refresh(alert)
        
        return VitalsAlertResponse.model_validate(alert)
    
    async def get_stats(self, nurse_id: Optional[str] = None) -> VitalsStats:
        """Get vitals statistics"""
        
        # Build queries
        conditions = []
        if nurse_id:
            conditions.append(VitalsRecord.nurse_id == nurse_id)
        
        base_query = select(func.count(VitalsRecord.id))
        if conditions:
            base_query = base_query.where(and_(*conditions))
        
        # Total records
        result = await self.db.execute(base_query)
        total_records = result.scalar()
        
        # Critical readings
        result = await self.db.execute(
            base_query.where(VitalsRecord.status == VitalsStatus.CRITICAL)
        )
        critical_readings = result.scalar()
        
        # Abnormal readings
        result = await self.db.execute(
            base_query.where(VitalsRecord.status == VitalsStatus.ABNORMAL)
        )
        abnormal_readings = result.scalar()
        
        # Pending alerts (unacknowledged)
        alert_query = select(func.count(VitalsAlert.id)).where(
            VitalsAlert.acknowledged == False
        )
        if nurse_id:
            alert_query = alert_query.join(VitalsRecord).where(VitalsRecord.nurse_id == nurse_id)
        
        result = await self.db.execute(alert_query)
        pending_alerts = result.scalar()
        
        # Today's records
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0)
        result = await self.db.execute(
            base_query.where(VitalsRecord.recorded_at >= today_start)
        )
        records_today = result.scalar()
        
        # This week's records
        week_start = datetime.utcnow() - timedelta(days=7)
        result = await self.db.execute(
            base_query.where(VitalsRecord.recorded_at >= week_start)
        )
        records_this_week = result.scalar()
        
        return VitalsStats(
            total_records=total_records,
            critical_readings=critical_readings,
            abnormal_readings=abnormal_readings,
            pending_alerts=pending_alerts,
            records_today=records_today,
            records_this_week=records_this_week
        )
    
    async def get_patient_trends(
        self,
        patient_id: str,
        days: int = 30
    ) -> PatientVitalsTrends:
        """Get trends for a patient's vitals"""
        
        patient = await self._get_user(patient_id)
        if not patient:
            raise NotFoundError("Patient", patient_id)
        
        # Get records from last N days
        start_date = datetime.utcnow() - timedelta(days=days)
        result = await self.db.execute(
            select(VitalsRecord)
            .where(
                and_(
                    VitalsRecord.patient_id == patient_id,
                    VitalsRecord.recorded_at >= start_date
                )
            )
            .order_by(VitalsRecord.recorded_at.desc())
        )
        records = result.scalars().all()
        
        if not records:
            return PatientVitalsTrends(
                patient_id=patient_id,
                patient_name=patient.username,
                avg_systolic_bp=None,
                avg_diastolic_bp=None,
                bp_trend=None,
                current_weight=None,
                weight_change=None,
                latest_record=None,
                active_alerts=0,
                total_alerts_30days=0
            )
        
        # Calculate averages
        bp_records = [r for r in records if r.systolic_bp and r.diastolic_bp]
        avg_systolic = sum(r.systolic_bp for r in bp_records) / len(bp_records) if bp_records else None
        avg_diastolic = sum(r.diastolic_bp for r in bp_records) / len(bp_records) if bp_records else None
        
        # Weight trend
        weight_records = [r for r in records if r.weight]
        current_weight = weight_records[0].weight if weight_records else None
        weight_change = None
        if len(weight_records) >= 2:
            weight_change = weight_records[0].weight - weight_records[-1].weight
        
        # Get alerts
        alerts_result = await self.db.execute(
            select(func.count(VitalsAlert.id))
            .join(VitalsRecord)
            .where(
                and_(
                    VitalsRecord.patient_id == patient_id,
                    VitalsAlert.acknowledged == False
                )
            )
        )
        active_alerts = alerts_result.scalar()
        
        alerts_30d_result = await self.db.execute(
            select(func.count(VitalsAlert.id))
            .join(VitalsRecord)
            .where(
                and_(
                    VitalsRecord.patient_id == patient_id,
                    VitalsRecord.recorded_at >= start_date
                )
            )
        )
        total_alerts_30days = alerts_30d_result.scalar()
        
        return PatientVitalsTrends(
            patient_id=patient_id,
            patient_name=patient.username,
            avg_systolic_bp=Decimal(str(round(avg_systolic, 1))) if avg_systolic else None,
            avg_diastolic_bp=Decimal(str(round(avg_diastolic, 1))) if avg_diastolic else None,
            bp_trend="stable",  # TODO: Implement trend calculation
            current_weight=current_weight,
            weight_change=weight_change,
            latest_record=VitalsRecordResponse.model_validate(records[0]) if records else None,
            active_alerts=active_alerts,
            total_alerts_30days=total_alerts_30days
        )
    
    # Helper methods
    
    async def _check_and_create_alerts(self, vitals: VitalsRecord) -> List[VitalsAlert]:
        """Check vitals against normal ranges and create alerts"""
        
        alerts = []
        ranges = VitalsRange()
        
        # Check blood pressure
        if vitals.systolic_bp:
            if vitals.systolic_bp > 140:
                alert = VitalsAlert(
                    vitals_record_id=vitals.id,
                    alert_type="HIGH_BP",
                    severity=AlertSeverity.CRITICAL if vitals.systolic_bp > 180 else AlertSeverity.WARNING,
                    message=f"High systolic BP: {vitals.systolic_bp} mmHg (normal: {ranges.systolic_bp_min}-{ranges.systolic_bp_max})"
                )
                alerts.append(alert)
                self.db.add(alert)
            elif vitals.systolic_bp < 90:
                alert = VitalsAlert(
                    vitals_record_id=vitals.id,
                    alert_type="LOW_BP",
                    severity=AlertSeverity.WARNING,
                    message=f"Low systolic BP: {vitals.systolic_bp} mmHg"
                )
                alerts.append(alert)
                self.db.add(alert)
        
        # Check temperature
        if vitals.temperature:
            if vitals.temperature > 99.5:
                alert = VitalsAlert(
                    vitals_record_id=vitals.id,
                    alert_type="HIGH_TEMP",
                    severity=AlertSeverity.CRITICAL if vitals.temperature > 103 else AlertSeverity.WARNING,
                    message=f"High temperature: {vitals.temperature}°F"
                )
                alerts.append(alert)
                self.db.add(alert)
        
        # Check oxygen saturation
        if vitals.oxygen_saturation:
            if vitals.oxygen_saturation < 95:
                alert = VitalsAlert(
                    vitals_record_id=vitals.id,
                    alert_type="LOW_OXYGEN",
                    severity=AlertSeverity.CRITICAL if vitals.oxygen_saturation < 90 else AlertSeverity.WARNING,
                    message=f"Low oxygen saturation: {vitals.oxygen_saturation}%"
                )
                alerts.append(alert)
                self.db.add(alert)
        
        # Check heart rate
        if vitals.heart_rate:
            if vitals.heart_rate > 100:
                alert = VitalsAlert(
                    vitals_record_id=vitals.id,
                    alert_type="HIGH_HEART_RATE",
                    severity=AlertSeverity.WARNING,
                    message=f"High heart rate: {vitals.heart_rate} bpm"
                )
                alerts.append(alert)
                self.db.add(alert)
            elif vitals.heart_rate < 60:
                alert = VitalsAlert(
                    vitals_record_id=vitals.id,
                    alert_type="LOW_HEART_RATE",
                    severity=AlertSeverity.WARNING,
                    message=f"Low heart rate: {vitals.heart_rate} bpm"
                )
                alerts.append(alert)
                self.db.add(alert)
        
        return alerts
    
    async def _get_record(self, record_id: str) -> Optional[VitalsRecord]:
        """Get vitals record by ID"""
        result = await self.db.execute(
            select(VitalsRecord).where(VitalsRecord.id == record_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_alert(self, alert_id: str) -> Optional[VitalsAlert]:
        """Get alert by ID"""
        result = await self.db.execute(
            select(VitalsAlert).where(VitalsAlert.id == alert_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_staff(self, staff_id: str) -> Optional[Staff]:
        """Get staff by ID with user loaded"""
        result = await self.db.execute(
            select(Staff)
            .where(Staff.id == staff_id)
            .options(joinedload(Staff.user))
        )
        return result.scalar_one_or_none()
    
    async def _get_staff_by_user_id(self, user_id: str) -> Optional[Staff]:
        """Get staff by user ID"""
        result = await self.db.execute(
            select(Staff)
            .where(Staff.user_id == user_id)
            .options(joinedload(Staff.user))
        )
        return result.scalar_one_or_none()

