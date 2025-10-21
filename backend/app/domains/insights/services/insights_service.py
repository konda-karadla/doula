from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from fastapi import HTTPException, status
from datetime import datetime

from app.domains.lab.models.lab_result import LabResult, Biomarker
from app.domains.insights.schemas.insights import HealthInsightResponse, InsightsSummaryResponse, BiomarkerTrendResponse


class InsightsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_insights_summary(self, user_id: str, system_id: str) -> InsightsSummaryResponse:
        # Get all biomarkers for the user
        result = await self.db.execute(
            select(Biomarker)
            .join(LabResult, Biomarker.lab_result_id == LabResult.id)
            .where(LabResult.user_id == user_id)
            .where(LabResult.system_id == system_id)
            .order_by(desc(Biomarker.created_at))
        )
        biomarkers = result.scalars().all()
        
        total_biomarkers = len(biomarkers)
        abnormal_count = 0
        insights = []
        
        # Generate insights for each biomarker
        for biomarker in biomarkers:
            insight = self._generate_insight(biomarker)
            insights.append(insight)
            if insight.status == "abnormal":
                abnormal_count += 1
        
        # Get last updated timestamp
        last_updated = biomarkers[0].created_at if biomarkers else None
        
        return InsightsSummaryResponse.create(
            total=total_biomarkers,
            abnormal=abnormal_count,
            insights=insights,
            last_updated=last_updated
        )

    async def generate_insights_for_lab_result(self, lab_result_id: str, user_id: str, system_id: str) -> List[HealthInsightResponse]:
        # Verify lab result belongs to user
        lab_result = await self._verify_lab_result_access(lab_result_id, user_id, system_id)
        
        # Get biomarkers for this lab result
        result = await self.db.execute(
            select(Biomarker)
            .where(Biomarker.lab_result_id == lab_result_id)
            .order_by(Biomarker.test_name)
        )
        biomarkers = result.scalars().all()
        
        insights = []
        for biomarker in biomarkers:
            insight = self._generate_insight(biomarker)
            insights.append(insight)
        
        return insights

    async def get_biomarker_trends(self, test_name: str, user_id: str, system_id: str) -> BiomarkerTrendResponse:
        # Get all biomarkers for this test name
        result = await self.db.execute(
            select(Biomarker)
            .join(LabResult, Biomarker.lab_result_id == LabResult.id)
            .where(LabResult.user_id == user_id)
            .where(LabResult.system_id == system_id)
            .where(Biomarker.test_name == test_name)
            .order_by(Biomarker.test_date.asc())
        )
        biomarkers = result.scalars().all()
        
        values = []
        for biomarker in biomarkers:
            values.append({
                "value": biomarker.value,
                "unit": biomarker.unit,
                "date": biomarker.test_date.isoformat() if biomarker.test_date else None,
                "referenceRange": {
                    "low": biomarker.reference_range_low,
                    "high": biomarker.reference_range_high
                }
            })
        
        return BiomarkerTrendResponse.create(test_name=test_name, values=values)

    async def _verify_lab_result_access(self, lab_result_id: str, user_id: str, system_id: str) -> LabResult:
        result = await self.db.execute(
            select(LabResult)
            .where(LabResult.id == lab_result_id)
            .where(LabResult.user_id == user_id)
            .where(LabResult.system_id == system_id)
        )
        lab_result = result.scalar_one_or_none()
        
        if not lab_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lab result not found"
            )
        
        return lab_result

    def _generate_insight(self, biomarker: Biomarker) -> HealthInsightResponse:
        """Generate health insight based on biomarker values"""
        test_name = biomarker.test_name
        value = biomarker.value
        unit = biomarker.unit or ""
        ref_low = biomarker.reference_range_low
        ref_high = biomarker.reference_range_high
        
        # Simple insight generation logic
        status = "normal"
        recommendation = "Continue monitoring"
        priority = "low"
        
        try:
            # Try to parse numeric values
            numeric_value = float(value)
            if ref_low and ref_high:
                ref_low_num = float(ref_low)
                ref_high_num = float(ref_high)
                
                if numeric_value < ref_low_num:
                    status = "low"
                    recommendation = f"{test_name} is below normal range. Consider consulting with your healthcare provider."
                    priority = "medium"
                elif numeric_value > ref_high_num:
                    status = "high"
                    recommendation = f"{test_name} is above normal range. Consider consulting with your healthcare provider."
                    priority = "medium"
                else:
                    status = "normal"
                    recommendation = f"{test_name} is within normal range."
                    priority = "low"
        except (ValueError, TypeError):
            # Non-numeric values - use text-based analysis
            value_lower = value.lower()
            if any(word in value_lower for word in ["positive", "detected", "present"]):
                status = "abnormal"
                recommendation = f"{test_name} shows positive result. Please consult with your healthcare provider."
                priority = "high"
            elif any(word in value_lower for word in ["negative", "not detected", "absent"]):
                status = "normal"
                recommendation = f"{test_name} shows negative result."
                priority = "low"
            else:
                status = "unknown"
                recommendation = f"{test_name} result requires interpretation by a healthcare provider."
                priority = "medium"
        
        return HealthInsightResponse.create(
            test_name=test_name,
            value=f"{value} {unit}".strip(),
            status=status,
            recommendation=recommendation,
            priority=priority
        )
