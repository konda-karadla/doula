"""
Pydantic schemas for Vitals Recording (Nurse data capture)
"""
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
from decimal import Decimal

from schemas.enums import VitalsLocation, VitalsStatus, VitalsAlertType, AlertSeverity


# ============================================================================
# Vitals Alert Schemas
# ============================================================================

class VitalsAlertBase(BaseModel):
    """Base schema for vitals alerts"""
    alert_type: VitalsAlertType = Field(..., description="Type of alert")
    severity: AlertSeverity = Field(..., description="Alert severity level")
    message: str = Field(..., max_length=500, description="Alert message")


class VitalsAlertCreate(VitalsAlertBase):
    """Schema for creating a vitals alert"""
    vitals_record_id: str = Field(..., description="Vitals record that triggered the alert")


class VitalsAlertAcknowledge(BaseModel):
    """Schema for acknowledging a vitals alert"""
    acknowledged_by: str = Field(..., description="Staff ID who acknowledged")
    resolution_notes: Optional[str] = Field(None, max_length=1000, description="Notes about resolution")


class VitalsAlertResponse(VitalsAlertBase):
    """Schema for vitals alert response"""
    id: str
    vitals_record_id: str
    acknowledged: bool
    acknowledged_by: Optional[str]
    acknowledged_at: Optional[datetime]
    resolution_notes: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Vitals Record Schemas
# ============================================================================

class VitalsRecordBase(BaseModel):
    """Base schema for vitals records"""
    recorded_at: datetime = Field(..., description="Time when vitals were recorded")
    location: VitalsLocation = Field(..., description="Location where vitals were recorded")
    
    # Blood Pressure
    systolic_bp: Optional[int] = Field(None, ge=50, le=300, description="Systolic blood pressure (mmHg)")
    diastolic_bp: Optional[int] = Field(None, ge=30, le=200, description="Diastolic blood pressure (mmHg)")
    
    # Pulse & Respiratory
    heart_rate: Optional[int] = Field(None, ge=30, le=300, description="Heart rate (bpm)")
    respiratory_rate: Optional[int] = Field(None, ge=5, le=60, description="Respiratory rate (breaths/min)")
    
    # Temperature
    temperature: Optional[Decimal] = Field(None, ge=90.0, le=110.0, description="Body temperature (°F)")
    
    # Oxygen
    oxygen_saturation: Optional[Decimal] = Field(None, ge=0.0, le=100.0, description="O2 saturation (%)")
    
    # Weight & Height
    weight: Optional[Decimal] = Field(None, ge=0.0, le=500.0, description="Weight (kg)")
    height: Optional[Decimal] = Field(None, ge=0.0, le=300.0, description="Height (cm)")
    bmi: Optional[Decimal] = Field(None, ge=0.0, le=100.0, description="Body Mass Index (calculated)")
    
    # Blood Glucose
    blood_glucose: Optional[Decimal] = Field(None, ge=0.0, le=1000.0, description="Blood glucose (mg/dL)")
    
    # Pain Assessment
    pain_level: Optional[int] = Field(None, ge=0, le=10, description="Pain level (0-10 scale)")
    
    # Additional Info
    notes: Optional[str] = Field(None, max_length=1000, description="Additional observations")

    @field_validator('bmi', mode='before')
    @classmethod
    def calculate_bmi(cls, v, info):
        """Calculate BMI if weight and height are provided"""
        if info.data and 'weight' in info.data and 'height' in info.data:
            weight = info.data.get('weight')
            height = info.data.get('height')
            if weight and height and height > 0:
                # BMI = weight(kg) / (height(m))^2
                height_m = height / 100  # Convert cm to meters
                return round(weight / (height_m ** 2), 2)
        return v


class VitalsRecordCreate(VitalsRecordBase):
    """Schema for creating a vitals record"""
    patient_id: str = Field(..., description="Patient ID (User ID)")
    nurse_id: str = Field(..., description="Nurse ID (Staff ID)")


class VitalsRecordUpdate(BaseModel):
    """Schema for updating a vitals record"""
    recorded_at: Optional[datetime] = None
    location: Optional[VitalsLocation] = None
    systolic_bp: Optional[int] = Field(None, ge=50, le=300)
    diastolic_bp: Optional[int] = Field(None, ge=30, le=200)
    heart_rate: Optional[int] = Field(None, ge=30, le=300)
    respiratory_rate: Optional[int] = Field(None, ge=5, le=60)
    temperature: Optional[Decimal] = Field(None, ge=90.0, le=110.0)
    oxygen_saturation: Optional[Decimal] = Field(None, ge=0.0, le=100.0)
    weight: Optional[Decimal] = Field(None, ge=0.0, le=500.0)
    height: Optional[Decimal] = Field(None, ge=0.0, le=300.0)
    blood_glucose: Optional[Decimal] = Field(None, ge=0.0, le=1000.0)
    pain_level: Optional[int] = Field(None, ge=0, le=10)
    notes: Optional[str] = Field(None, max_length=1000)
    status: Optional[VitalsStatus] = None


class VitalsRecordResponse(VitalsRecordBase):
    """Schema for vitals record response"""
    id: str
    patient_id: str
    nurse_id: str
    bmi: Optional[Decimal]
    status: VitalsStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VitalsRecordWithAlerts(VitalsRecordResponse):
    """Schema for vitals record with alerts"""
    alerts: list[VitalsAlertResponse] = []

    model_config = ConfigDict(from_attributes=True)


class VitalsRecordWithDetails(VitalsRecordResponse):
    """Schema for vitals record with patient and nurse details"""
    patient_name: str
    patient_email: str
    nurse_name: str
    alerts: list[VitalsAlertResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# List/Filter Schemas
# ============================================================================

class VitalsRecordListFilter(BaseModel):
    """Schema for filtering vitals records"""
    patient_id: Optional[str] = Field(None, description="Filter by patient")
    nurse_id: Optional[str] = Field(None, description="Filter by nurse")
    location: Optional[VitalsLocation] = Field(None, description="Filter by location")
    status: Optional[VitalsStatus] = Field(None, description="Filter by status")
    
    start_date: Optional[datetime] = Field(None, description="Filter by recorded date (start)")
    end_date: Optional[datetime] = Field(None, description="Filter by recorded date (end)")
    
    has_alerts: Optional[bool] = Field(None, description="Filter records with alerts")
    
    skip: int = Field(0, ge=0, description="Number of records to skip")
    limit: int = Field(100, ge=1, le=1000, description="Number of records to return")


class VitalsRecordListResponse(BaseModel):
    """Schema for paginated vitals records list"""
    items: list[VitalsRecordWithDetails]
    total: int
    skip: int
    limit: int
    has_more: bool

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Statistics/Trends Schemas
# ============================================================================

class VitalsStats(BaseModel):
    """Statistics for vitals"""
    total_records: int
    critical_readings: int
    abnormal_readings: int
    pending_alerts: int
    records_today: int
    records_this_week: int


class PatientVitalsTrends(BaseModel):
    """Trends for a patient's vitals"""
    patient_id: str
    patient_name: str
    
    # BP Trends
    avg_systolic_bp: Optional[Decimal]
    avg_diastolic_bp: Optional[Decimal]
    bp_trend: Optional[str]  # "improving", "stable", "worsening"
    
    # Weight Trend
    current_weight: Optional[Decimal]
    weight_change: Optional[Decimal]  # Change from previous reading
    
    # Latest Reading
    latest_record: Optional[VitalsRecordResponse]
    
    # Alert Summary
    active_alerts: int
    total_alerts_30days: int


class VitalsRange(BaseModel):
    """Normal ranges for vitals (for reference/validation)"""
    systolic_bp_min: int = 90
    systolic_bp_max: int = 120
    diastolic_bp_min: int = 60
    diastolic_bp_max: int = 80
    heart_rate_min: int = 60
    heart_rate_max: int = 100
    temperature_min: Decimal = Decimal("97.0")
    temperature_max: Decimal = Decimal("99.0")
    oxygen_saturation_min: Decimal = Decimal("95.0")
    respiratory_rate_min: int = 12
    respiratory_rate_max: int = 20

