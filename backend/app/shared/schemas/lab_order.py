"""
Pydantic schemas for Lab Test Orders and enhanced Lab Results
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

from schemas.enums import LabOrderPriority, LabOrderStatus, LabTestCategory, TrendDirection, ResultStatus


# ============================================================================
# Lab Test Order Schemas
# ============================================================================

class LabTestOrderBase(BaseModel):
    """Base schema for lab test orders"""
    order_date: datetime = Field(default_factory=datetime.now, description="Date and time of order")
    priority: LabOrderPriority = Field(default=LabOrderPriority.ROUTINE, description="Order priority")
    
    # Test Details
    test_types: str = Field(..., description="Comma-separated list or JSON array of test types")
    clinical_indication: Optional[str] = Field(None, description="Reason for ordering tests")
    special_instructions: Optional[str] = Field(None, description="Special instructions for lab")
    
    # External Lab
    external_lab_name: Optional[str] = Field(None, max_length=200, description="External lab name")
    external_lab_reference: Optional[str] = Field(None, max_length=100, description="External lab reference number")


class LabTestOrderCreate(LabTestOrderBase):
    """Schema for creating a lab test order"""
    patient_id: str = Field(..., description="Patient ID (User ID)")
    ordering_physician_id: str = Field(..., description="Physician ID (Staff ID)")
    system_id: str = Field(..., description="System ID")


class LabTestOrderUpdate(BaseModel):
    """Schema for updating a lab test order"""
    priority: Optional[LabOrderPriority] = None
    test_types: Optional[str] = None
    clinical_indication: Optional[str] = None
    special_instructions: Optional[str] = None
    external_lab_name: Optional[str] = Field(None, max_length=200)
    external_lab_reference: Optional[str] = Field(None, max_length=100)
    status: Optional[LabOrderStatus] = None
    collection_date: Optional[datetime] = None
    collected_by: Optional[str] = Field(None, description="Staff ID who collected sample")


class LabTestOrderResponse(LabTestOrderBase):
    """Schema for lab test order response"""
    id: str
    patient_id: str
    ordering_physician_id: str
    system_id: str
    status: LabOrderStatus
    collection_date: Optional[datetime]
    collected_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LabTestOrderWithDetails(LabTestOrderResponse):
    """Schema with patient and physician details"""
    patient_name: str
    patient_email: str
    ordering_physician_name: str
    ordering_physician_credentials: Optional[str]
    collector_name: Optional[str]

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Enhanced Lab Result Schemas (with review tracking)
# ============================================================================

class BiomarkerBase(BaseModel):
    """Base schema for biomarkers"""
    name: str = Field(..., max_length=100, description="Biomarker name (e.g., 'Hemoglobin')")
    value: str = Field(..., max_length=100, description="Measured value")
    unit: str = Field(..., max_length=50, description="Unit of measurement")
    reference_range: Optional[str] = Field(None, max_length=100, description="Normal range")
    status: ResultStatus = Field(..., description="Result status (normal/abnormal/critical)")
    is_critical: bool = Field(default=False, description="Whether this is a critical value")
    physician_comment: Optional[str] = Field(None, max_length=1000, description="Physician's comment")
    trend_direction: Optional[TrendDirection] = Field(None, description="Trend compared to previous")
    previous_value: Optional[str] = Field(None, max_length=100, description="Previous value for comparison")


class BiomarkerCreate(BiomarkerBase):
    """Schema for creating a biomarker"""
    lab_result_id: str = Field(..., description="Lab result ID this biomarker belongs to")


class BiomarkerUpdate(BaseModel):
    """Schema for updating a biomarker"""
    name: Optional[str] = Field(None, max_length=100)
    value: Optional[str] = Field(None, max_length=100)
    unit: Optional[str] = Field(None, max_length=50)
    reference_range: Optional[str] = Field(None, max_length=100)
    status: Optional[ResultStatus] = None
    is_critical: Optional[bool] = None
    physician_comment: Optional[str] = Field(None, max_length=1000)
    trend_direction: Optional[TrendDirection] = None
    previous_value: Optional[str] = Field(None, max_length=100)


class BiomarkerResponse(BiomarkerBase):
    """Schema for biomarker response"""
    id: str
    lab_result_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LabResultBase(BaseModel):
    """Base schema for lab results"""
    test_name: str = Field(..., max_length=200, description="Name of the lab test")
    test_date: date = Field(..., description="Date test was performed")
    lab_name: Optional[str] = Field(None, max_length=200, description="Name of the lab")
    lab_test_type: Optional[str] = Field(None, max_length=100, description="Type of lab test")
    test_category: Optional[LabTestCategory] = Field(None, description="Category of test")
    
    # Results
    result_pdf_url: Optional[str] = Field(None, description="S3 URL to PDF report")
    interpretation: Optional[str] = Field(None, description="AI/OCR interpretation")
    
    # Physician Review
    physician_notes: Optional[str] = Field(None, description="Physician's notes on results")


class LabResultCreate(LabResultBase):
    """Schema for creating a lab result"""
    user_id: str = Field(..., description="Patient ID (User ID)")
    system_id: str = Field(..., description="System ID")
    ordered_by: Optional[str] = Field(None, description="Physician who ordered (Staff ID)")


class LabResultUpdate(BaseModel):
    """Schema for updating a lab result"""
    test_name: Optional[str] = Field(None, max_length=200)
    test_date: Optional[date] = None
    lab_name: Optional[str] = Field(None, max_length=200)
    lab_test_type: Optional[str] = Field(None, max_length=100)
    test_category: Optional[LabTestCategory] = None
    result_pdf_url: Optional[str] = None
    interpretation: Optional[str] = None
    physician_notes: Optional[str] = None
    is_reviewed: Optional[bool] = None


class LabResultReview(BaseModel):
    """Schema for physician to review a lab result"""
    reviewed_by: str = Field(..., description="Physician Staff ID")
    physician_notes: str = Field(..., min_length=1, description="Physician's review notes")


class LabResultResponse(LabResultBase):
    """Schema for lab result response"""
    id: str
    user_id: str
    system_id: str
    ordered_by: Optional[str]
    is_reviewed: bool
    reviewed_by: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LabResultWithBiomarkers(LabResultResponse):
    """Schema for lab result with all biomarkers"""
    biomarkers: list[BiomarkerResponse] = []
    critical_count: int = 0
    abnormal_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class LabResultWithDetails(LabResultResponse):
    """Schema with patient and physician details"""
    patient_name: str
    patient_email: str
    ordering_physician_name: Optional[str]
    reviewing_physician_name: Optional[str]
    biomarkers: list[BiomarkerResponse] = []
    critical_count: int = 0
    abnormal_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# List/Filter Schemas
# ============================================================================

class LabTestOrderListFilter(BaseModel):
    """Filter for lab test orders"""
    patient_id: Optional[str] = Field(None, description="Filter by patient")
    ordering_physician_id: Optional[str] = Field(None, description="Filter by physician")
    status: Optional[LabOrderStatus] = Field(None, description="Filter by status")
    priority: Optional[LabOrderPriority] = Field(None, description="Filter by priority")
    
    start_date: Optional[datetime] = Field(None, description="Filter by order date (start)")
    end_date: Optional[datetime] = Field(None, description="Filter by order date (end)")
    
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)


class LabResultListFilter(BaseModel):
    """Filter for lab results"""
    user_id: Optional[str] = Field(None, description="Filter by patient")
    ordered_by: Optional[str] = Field(None, description="Filter by ordering physician")
    reviewed_by: Optional[str] = Field(None, description="Filter by reviewing physician")
    test_category: Optional[LabTestCategory] = Field(None, description="Filter by category")
    is_reviewed: Optional[bool] = Field(None, description="Filter by review status")
    
    start_date: Optional[date] = Field(None, description="Filter by test date (start)")
    end_date: Optional[date] = Field(None, description="Filter by test date (end)")
    
    has_critical: Optional[bool] = Field(None, description="Filter results with critical biomarkers")
    
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)


class LabTestOrderListResponse(BaseModel):
    """Paginated lab order list"""
    items: list[LabTestOrderWithDetails]
    total: int
    skip: int
    limit: int
    has_more: bool

    model_config = ConfigDict(from_attributes=True)


class LabResultListResponse(BaseModel):
    """Paginated lab result list"""
    items: list[LabResultWithDetails]
    total: int
    skip: int
    limit: int
    has_more: bool

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Statistics Schemas
# ============================================================================

class LabStats(BaseModel):
    """Lab module statistics"""
    total_orders: int
    pending_orders: int
    completed_orders: int
    total_results: int
    unreviewed_results: int
    results_with_critical_values: int
    orders_this_week: int


class PatientLabSummary(BaseModel):
    """Patient's lab test summary"""
    patient_id: str
    patient_name: str
    total_results: int
    recent_results: list[LabResultWithBiomarkers] = []
    pending_orders: int
    last_test_date: Optional[date]
    critical_values_count: int


class PhysicianLabWorkload(BaseModel):
    """Physician's lab review workload"""
    physician_id: str
    physician_name: str
    pending_reviews: int
    reviewed_this_week: int
    orders_pending_results: int
    critical_results_pending: int

