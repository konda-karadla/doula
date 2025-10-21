"""
Service layer for Vitals Recording (Nurse data capture)
"""
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import joinedload
from decimal import Decimal

from app.shared.models import VitalsRecord, VitalsAlert, User, Staff
from app.shared.schemas.vitals import (
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
from app.shared.schemas.enums import VitalsStatus, AlertSeverity


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
        patient = await self._get_user_by_id(vitals_data.patient_id)
        if not patient:
            raise NotFoundError("Patient not found")
        
        # Create vitals record
        vitals_record = VitalsRecord(
            patient_id=vitals_data.patient_id,
            nurse_id=nurse.id,
            system_id=nurse.system_id,
            recorded_at=vitals_data.recorded_at or datetime.now(),
            blood_pressure_systolic=vitals_data.blood_pressure_systolic,
            blood_pressure_diastolic=vitals_data.blood_pressure_diastolic,
            heart_rate=vitals_data.heart_rate,
            temperature=vitals_data.temperature,
            respiratory_rate=vitals_data.respiratory_rate,
            oxygen_saturation=vitals_data.oxygen_saturation,
            weight=vitals_data.weight,
            height=vitals_data.height,
            bmi=vitals_data.bmi,
            notes=vitals_data.notes
        )

        self.db.add(vitals_record)
        await self.db.commit()
        await self.db.refresh(vitals_record)

        # Check for vitals alerts
        await self._check_vitals_alerts(vitals_record)

        return VitalsRecordResponse.model_validate(vitals_record)

    async def get_vitals_record(self, record_id: str, system_id: str) -> VitalsRecordWithDetails:
        """Get a vitals record with details"""
        result = await self.db.execute(
            select(VitalsRecord)
            .options(
                joinedload(VitalsRecord.patient),
                joinedload(VitalsRecord.nurse)
            )
            .where(
                and_(
                    VitalsRecord.id == record_id,
                    VitalsRecord.system_id == system_id
                )
            )
        )
        record = result.scalar_one_or_none()

        if not record:
            raise NotFoundError("Vitals record not found")

        return VitalsRecordWithDetails(
            **record.__dict__,
            patient_name=f"{record.patient.first_name} {record.patient.last_name}",
            nurse_name=f"{record.nurse.first_name} {record.nurse.last_name}"
        )

    async def update_vitals_record(
        self,
        record_id: str,
        update_data: VitalsRecordUpdate,
        system_id: str
    ) -> VitalsRecordResponse:
        """Update a vitals record"""
        result = await self.db.execute(
            select(VitalsRecord).where(
                and_(
                    VitalsRecord.id == record_id,
                    VitalsRecord.system_id == system_id
                )
            )
        )
        record = result.scalar_one_or_none()

        if not record:
            raise NotFoundError("Vitals record not found")

        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(record, field, value)

        record.updated_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(record)

        # Check for new vitals alerts
        await self._check_vitals_alerts(record)

        return VitalsRecordResponse.model_validate(record)

    async def list_vitals_records(
        self,
        filters: VitalsRecordListFilter,
        user_id: str,
        is_staff: bool
    ) -> Tuple[List[VitalsRecordResponse], int]:
        """List vitals records with filtering"""
        query = select(VitalsRecord)

        # Apply filters
        if filters.patient_id:
            query = query.where(VitalsRecord.patient_id == filters.patient_id)
        elif not is_staff:
            # Non-staff users can only see their own records
            query = query.where(VitalsRecord.patient_id == user_id)

        if filters.nurse_id:
            query = query.where(VitalsRecord.nurse_id == filters.nurse_id)

        if filters.start_date:
            query = query.where(VitalsRecord.recorded_at >= filters.start_date)

        if filters.end_date:
            query = query.where(VitalsRecord.recorded_at <= filters.end_date)

        if filters.system_id:
            query = query.where(VitalsRecord.system_id == filters.system_id)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination
        if filters.skip:
            query = query.offset(filters.skip)
        if filters.limit:
            query = query.limit(filters.limit)

        # Order by recorded_at desc
        query = query.order_by(VitalsRecord.recorded_at.desc())

        result = await self.db.execute(query)
        records = result.scalars().all()

        return [VitalsRecordResponse.model_validate(record) for record in records], total

    async def get_patient_vitals_trends(
        self,
        patient_id: str,
        days: int = 30,
        system_id: str = None
    ) -> PatientVitalsTrends:
        """Get vitals trends for a patient"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        query = select(VitalsRecord).where(
            and_(
                VitalsRecord.patient_id == patient_id,
                VitalsRecord.recorded_at >= start_date,
                VitalsRecord.recorded_at <= end_date
            )
        )

        if system_id:
            query = query.where(VitalsRecord.system_id == system_id)

        query = query.order_by(VitalsRecord.recorded_at.asc())

        result = await self.db.execute(query)
        records = result.scalars().all()

        return PatientVitalsTrends(
            patient_id=patient_id,
            period_days=days,
            total_records=len(records),
            records=[VitalsRecordResponse.model_validate(record) for record in records]
        )

    async def get_vitals_stats(self, system_id: str) -> VitalsStats:
        """Get vitals statistics for the system"""
        # Total records
        total_records = await self.db.execute(
            select(func.count()).select_from(VitalsRecord).where(VitalsRecord.system_id == system_id)
        )

        # Records in last 24 hours
        yesterday = datetime.now() - timedelta(days=1)
        recent_records = await self.db.execute(
            select(func.count()).select_from(VitalsRecord).where(
                and_(
                    VitalsRecord.system_id == system_id,
                    VitalsRecord.recorded_at >= yesterday
                )
            )
        )

        # Active alerts
        active_alerts = await self.db.execute(
            select(func.count()).select_from(VitalsAlert).where(
                and_(
                    VitalsAlert.system_id == system_id,
                    VitalsAlert.is_acknowledged == False
                )
            )
        )

        return VitalsStats(
            total_records=total_records.scalar(),
            recent_records_24h=recent_records.scalar(),
            active_alerts=active_alerts.scalar(),
            avg_heart_rate=0.0,  # Would need additional calculation
            avg_blood_pressure_systolic=0.0,  # Would need additional calculation
            avg_blood_pressure_diastolic=0.0  # Would need additional calculation
        )

    async def acknowledge_vitals_alert(
        self,
        alert_id: str,
        acknowledge_data: VitalsAlertAcknowledge,
        system_id: str
    ) -> VitalsAlertResponse:
        """Acknowledge a vitals alert"""
        result = await self.db.execute(
            select(VitalsAlert).where(
                and_(
                    VitalsAlert.id == alert_id,
                    VitalsAlert.system_id == system_id
                )
            )
        )
        alert = result.scalar_one_or_none()

        if not alert:
            raise NotFoundError("Vitals alert not found")

        alert.is_acknowledged = True
        alert.acknowledged_by = acknowledge_data.acknowledged_by
        alert.acknowledged_at = datetime.now()
        alert.acknowledgment_notes = acknowledge_data.notes

        await self.db.commit()
        await self.db.refresh(alert)

        return VitalsAlertResponse.model_validate(alert)

    async def _get_staff_by_user_id(self, user_id: str) -> Optional[Staff]:
        """Get staff member by user ID"""
        result = await self.db.execute(
            select(Staff).where(Staff.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def _get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def _check_vitals_alerts(self, vitals_record: VitalsRecord) -> None:
        """Check for vitals alerts based on record values"""
        alerts = []

        # Blood pressure alerts
        if vitals_record.blood_pressure_systolic and vitals_record.blood_pressure_diastolic:
            if (vitals_record.blood_pressure_systolic > 140 or 
                vitals_record.blood_pressure_diastolic > 90):
                alerts.append(VitalsAlert(
                    vitals_record_id=vitals_record.id,
                    patient_id=vitals_record.patient_id,
                    system_id=vitals_record.system_id,
                    alert_type="high_blood_pressure",
                    severity=AlertSeverity.HIGH,
                    message="High blood pressure detected",
                    recorded_at=datetime.now()
                ))

        # Heart rate alerts
        if vitals_record.heart_rate:
            if vitals_record.heart_rate > 100:
                alerts.append(VitalsAlert(
                    vitals_record_id=vitals_record.id,
                    patient_id=vitals_record.patient_id,
                    system_id=vitals_record.system_id,
                    alert_type="high_heart_rate",
                    severity=AlertSeverity.MEDIUM,
                    message="High heart rate detected",
                    recorded_at=datetime.now()
                ))
            elif vitals_record.heart_rate < 60:
                alerts.append(VitalsAlert(
                    vitals_record_id=vitals_record.id,
                    patient_id=vitals_record.patient_id,
                    system_id=vitals_record.system_id,
                    alert_type="low_heart_rate",
                    severity=AlertSeverity.MEDIUM,
                    message="Low heart rate detected",
                    recorded_at=datetime.now()
                ))

        # Temperature alerts
        if vitals_record.temperature:
            if vitals_record.temperature > 100.4:  # Fahrenheit
                alerts.append(VitalsAlert(
                    vitals_record_id=vitals_record.id,
                    patient_id=vitals_record.patient_id,
                    system_id=vitals_record.system_id,
                    alert_type="high_temperature",
                    severity=AlertSeverity.HIGH,
                    message="High temperature detected (fever)",
                    recorded_at=datetime.now()
                ))

        # Oxygen saturation alerts
        if vitals_record.oxygen_saturation:
            if vitals_record.oxygen_saturation < 95:
                alerts.append(VitalsAlert(
                    vitals_record_id=vitals_record.id,
                    patient_id=vitals_record.patient_id,
                    system_id=vitals_record.system_id,
                    alert_type="low_oxygen_saturation",
                    severity=AlertSeverity.HIGH,
                    message="Low oxygen saturation detected",
                    recorded_at=datetime.now()
                ))

        # Add alerts to database
        if alerts:
            self.db.add_all(alerts)
            await self.db.commit()
