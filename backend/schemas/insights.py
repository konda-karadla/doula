from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class HealthInsightResponse(BaseModel):
    testName: str = ...
    value: str
    status: str
    recommendation: str
    priority: str

    class Config:
        from_attributes = True

    @classmethod
    def create(cls, test_name: str, value: str, status: str, recommendation: str, priority: str):
        return cls(
            testName=test_name,
            value=value,
            status=status,
            recommendation=recommendation,
            priority=priority,
        )


class InsightsSummaryResponse(BaseModel):
    totalBiomarkers: int = ...
    abnormalCount: int = ...
    insights: List[HealthInsightResponse]
    lastUpdated: Optional[datetime] = None

    class Config:
        from_attributes = True

    @classmethod
    def create(cls, total: int, abnormal: int, insights: List[HealthInsightResponse],
               last_updated: Optional[datetime] = None):
        return cls(
            totalBiomarkers=total,
            abnormalCount=abnormal,
            insights=insights,
            lastUpdated=last_updated,
        )


class BiomarkerTrendResponse(BaseModel):
    testName: str = ...
    values: List[dict]

    class Config:
        from_attributes = True

    @classmethod
    def create(cls, test_name: str, values: List[dict]):
        return cls(
            testName=test_name,
            values=values,
        )
