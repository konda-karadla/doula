import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.models.lab_result import LabResult, Biomarker
from app.schemas.insights import HealthInsightResponse, InsightsSummaryResponse, BiomarkerTrendResponse

logger = logging.getLogger(__name__)


class InsightsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_insights_summary(self, user_id: str, system_id: str) -> InsightsSummaryResponse:
        result = await self.db.execute(
            select(LabResult)
            .where(
                LabResult.user_id == user_id,
                LabResult.system_id == system_id,
                LabResult.processing_status == "completed"
            )
            .order_by(LabResult.uploaded_at.desc())
            .limit(1)
        )
        latest_lab = result.scalar_one_or_none()

        if not latest_lab:
            return InsightsSummaryResponse.create(
                total=0,
                abnormal=0,
                insights=[],
                last_updated=None
            )

        result = await self.db.execute(
            select(Biomarker)
            .where(Biomarker.lab_result_id == latest_lab.id)
        )
        biomarkers = result.scalars().all()

        insights = []
        abnormal_count = 0

        for bio in biomarkers:
            status_text, priority, recommendation = self._analyze_biomarker(bio)
            if status_text != "normal":
                abnormal_count += 1

            insights.append(
                HealthInsightResponse.create(
                    test_name=bio.test_name,
                    value=f"{bio.value} {bio.unit or ''}".strip(),
                    status=status_text,
                    recommendation=recommendation,
                    priority=priority
                )
            )

        insights.sort(key=lambda x: {"high": 0, "medium": 1, "low": 2}.get(x.priority, 3))

        return InsightsSummaryResponse.create(
            total=len(biomarkers),
            abnormal=abnormal_count,
            insights=insights[:10],
            last_updated=latest_lab.uploaded_at
        )

    async def generate_insights_for_lab_result(
        self,
        lab_result_id: str,
        user_id: str,
        system_id: str
    ) -> list[HealthInsightResponse]:
        result = await self.db.execute(
            select(LabResult)
            .where(
                LabResult.id == lab_result_id,
                LabResult.user_id == user_id,
                LabResult.system_id == system_id
            )
        )
        lab_result = result.scalar_one_or_none()

        if not lab_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lab result not found"
            )

        result = await self.db.execute(
            select(Biomarker)
            .where(Biomarker.lab_result_id == lab_result_id)
        )
        biomarkers = result.scalars().all()

        insights = []
        for bio in biomarkers:
            status_text, priority, recommendation = self._analyze_biomarker(bio)

            insights.append(
                HealthInsightResponse.create(
                    test_name=bio.test_name,
                    value=f"{bio.value} {bio.unit or ''}".strip(),
                    status=status_text,
                    recommendation=recommendation,
                    priority=priority
                )
            )

        return insights

    async def get_biomarker_trends(
        self,
        test_name: str,
        user_id: str,
        system_id: str
    ) -> BiomarkerTrendResponse:
        result = await self.db.execute(
            select(Biomarker, LabResult)
            .join(LabResult, Biomarker.lab_result_id == LabResult.id)
            .where(
                Biomarker.test_name.ilike(f"%{test_name}%"),
                LabResult.user_id == user_id,
                LabResult.system_id == system_id
            )
            .order_by(LabResult.uploaded_at.asc())
        )
        results = result.all()

        values = []
        for bio, lab in results:
            values.append({
                "date": lab.uploaded_at.isoformat(),
                "value": bio.value,
                "unit": bio.unit,
                "referenceRangeLow": bio.reference_range_low,
                "referenceRangeHigh": bio.reference_range_high,
            })

        return BiomarkerTrendResponse.create(
            test_name=test_name,
            values=values
        )

    def _analyze_biomarker(self, biomarker: Biomarker) -> tuple[str, str, str]:
        try:
            value = float(biomarker.value)
            low = float(biomarker.reference_range_low) if biomarker.reference_range_low else None
            high = float(biomarker.reference_range_high) if biomarker.reference_range_high else None

            if low is not None and value < low:
                return (
                    "low",
                    "medium",
                    f"{biomarker.test_name} is below normal range. Consider consulting with your healthcare provider."
                )
            elif high is not None and value > high:
                return (
                    "high",
                    "medium",
                    f"{biomarker.test_name} is above normal range. Consider consulting with your healthcare provider."
                )
            else:
                return (
                    "normal",
                    "low",
                    f"{biomarker.test_name} is within normal range."
                )
        except (ValueError, TypeError):
            return (
                "unknown",
                "low",
                f"Unable to analyze {biomarker.test_name}. Please review with your healthcare provider."
            )
