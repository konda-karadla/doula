from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.shared.schemas.enums import InsightPriority, InsightStatus


class HealthInsightResponse(BaseModel):
    """Response model for individual health insights"""
    testName: str = Field(..., min_length=1, max_length=200, description="Name of the test/biomarker")
    value: str = Field(..., min_length=1, max_length=100, description="Current test result value")
    status: InsightStatus = Field(..., description="Status of the test result (normal, abnormal, etc.)")
    recommendation: str = Field(..., min_length=1, max_length=1000, description="Health recommendation based on the result")
    priority: InsightPriority = Field(..., description="Priority level of the insight")

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def create(cls, test_name: str, value: str, status: InsightStatus, recommendation: str, priority: InsightPriority):
        """Factory method for creating health insights"""
        return cls(
            testName=test_name,
            value=value,
            status=status,
            recommendation=recommendation,
            priority=priority,
        )


class InsightsSummaryResponse(BaseModel):
    """Response model for insights summary data"""
    totalBiomarkers: int = Field(..., ge=0, description="Total number of biomarkers analyzed")
    abnormalCount: int = Field(..., ge=0, description="Number of biomarkers with abnormal values")
    insights: List[HealthInsightResponse] = Field(..., description="List of health insights")
    lastUpdated: Optional[datetime] = Field(None, description="Timestamp of the last insights update")

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def create(cls, total: int, abnormal: int, insights: List[HealthInsightResponse],
               last_updated: Optional[datetime] = None):
        """Factory method for creating insights summary"""
        return cls(
            totalBiomarkers=total,
            abnormalCount=abnormal,
            insights=insights,
            lastUpdated=last_updated,
        )


class BiomarkerTrendResponse(BaseModel):
    """Response model for biomarker trend data"""
    testName: str = Field(..., min_length=1, max_length=200, description="Name of the biomarker")
    values: List[Dict[str, Any]] = Field(..., description="List of trend data points with timestamps and values")

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def create(cls, test_name: str, values: List[Dict[str, Any]]):
        """Factory method for creating biomarker trend data"""
        return cls(
            testName=test_name,
            values=values,
        )
