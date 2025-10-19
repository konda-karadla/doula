from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BiomarkerResponse(BaseModel):
    id: str
    labResultId: str = ...
    testName: str = ...
    value: str
    unit: Optional[str] = None
    referenceRangeLow: Optional[str] = None
    referenceRangeHigh: Optional[str] = None
    testDate: Optional[datetime] = None
    notes: Optional[str] = None
    createdAt: datetime = ...
    updatedAt: datetime = ...

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_camel(cls, obj):
        return cls(
            id=obj.id,
            labResultId=obj.lab_result_id,
            testName=obj.test_name,
            value=obj.value,
            unit=obj.unit,
            referenceRangeLow=obj.reference_range_low,
            referenceRangeHigh=obj.reference_range_high,
            testDate=obj.test_date,
            notes=obj.notes,
            createdAt=obj.created_at,
            updatedAt=obj.updated_at,
        )


class LabResultResponse(BaseModel):
    id: str
    fileName: str = ...
    uploadedAt: datetime = ...
    processingStatus: str = ...
    s3Url: str = ...
    rawOcrText: Optional[str] = None
    createdAt: datetime = ...
    updatedAt: datetime = ...

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_camel(cls, obj):
        return cls(
            id=obj.id,
            fileName=obj.file_name,
            uploadedAt=obj.uploaded_at,
            processingStatus=obj.processing_status,
            s3Url=obj.s3_url,
            rawOcrText=obj.raw_ocr_text,
            createdAt=obj.created_at,
            updatedAt=obj.updated_at,
        )
