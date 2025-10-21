from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

from .enums import ProcessingStatus


class BiomarkerResponse(BaseModel):
    """Response model for biomarker data"""
    id: str = Field(..., description="Unique identifier of the biomarker")
    labResultId: str = Field(..., alias="lab_result_id", description="ID of the associated lab result")
    testName: str = Field(..., alias="test_name", min_length=1, max_length=200, description="Name of the test/biomarker")
    value: str = Field(..., min_length=1, max_length=100, description="Test result value")
    unit: Optional[str] = Field(None, max_length=50, description="Unit of measurement for the value")
    referenceRangeLow: Optional[str] = Field(None, alias="reference_range_low", max_length=50, description="Lower bound of normal reference range")
    referenceRangeHigh: Optional[str] = Field(None, alias="reference_range_high", max_length=50, description="Upper bound of normal reference range")
    testDate: Optional[datetime] = Field(None, alias="test_date", description="Date when the test was performed")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes about the test result")
    createdAt: datetime = Field(..., alias="created_at", description="Creation timestamp")
    updatedAt: datetime = Field(..., alias="updated_at", description="Last update timestamp")

    class Config:
        from_attributes = True
        populate_by_name = True

    @field_validator('testDate')
    @classmethod
    def validate_test_date(cls, v):
        if v and v > datetime.now():
            raise ValueError('Test date cannot be in the future')
        return v


class LabResultResponse(BaseModel):
    """Response model for lab result data"""
    id: str = Field(..., description="Unique identifier of the lab result")
    fileName: str = Field(..., alias="file_name", min_length=1, max_length=255, description="Original filename of the uploaded lab report")
    uploadedAt: datetime = Field(..., alias="uploaded_at", description="Timestamp when the file was uploaded")
    processingStatus: ProcessingStatus = Field(..., alias="processing_status", description="Current processing status of the lab result")
    s3Url: str = Field(..., alias="s3_url", description="S3 URL where the lab result file is stored")
    rawOcrText: Optional[str] = Field(None, alias="raw_ocr_text", description="Raw OCR extracted text from the lab report")
    createdAt: datetime = Field(..., alias="created_at", description="Creation timestamp")
    updatedAt: datetime = Field(..., alias="updated_at", description="Last update timestamp")

    class Config:
        from_attributes = True
        populate_by_name = True
