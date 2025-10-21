from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status, UploadFile
import boto3
import pytesseract
from PIL import Image
from pdf2image import convert_from_bytes
import io
import os
from datetime import datetime, date

from app.shared.models import LabResult, Biomarker, LabTestOrder, User, Staff
from app.domains.labs.schemas.lab import LabResultResponse, BiomarkerResponse
from app.shared.schemas.lab_order import (
    LabResultWithBiomarkers, LabResultWithDetails, LabResultListFilter,
    LabResultListResponse, LabResultReview, BiomarkerCreate, BiomarkerUpdate
)
from app.shared.schemas.enums import LabOrderStatus, ResultStatus
from app.core.config import settings


class LabsService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )

    async def upload_lab(self, file: UploadFile, user_id: str, system_id: str, ordered_by: Optional[str] = None) -> LabResultResponse:
        # Generate unique S3 key
        s3_key = f"lab-results/{user_id}/{file.filename}"
        
        # Upload to S3
        file_content = await file.read()
        self.s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key,
            Body=file_content,
            ContentType=file.content_type
        )
        
        s3_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
        
        # Create lab result record
        lab_result = LabResult(
            user_id=user_id,
            system_id=system_id,
            ordered_by=ordered_by,
            file_name=file.filename,
            s3_key=s3_key,
            s3_url=s3_url,
            processing_status="pending"
        )
        
        self.db.add(lab_result)
        await self.db.commit()
        await self.db.refresh(lab_result)
        
        # Process file for OCR (simplified - in real implementation, this would be async)
        try:
            raw_ocr_text = self._extract_text_from_file(file_content, file.content_type)
            lab_result.raw_ocr_text = raw_ocr_text
            lab_result.processing_status = "completed"
            await self.db.commit()
        except Exception:
            lab_result.processing_status = "failed"
            await self.db.commit()
        
        return LabResultResponse.model_validate(lab_result)

    def _extract_text_from_file(self, file_content: bytes, content_type: str) -> str:
        """Extract text from uploaded file using OCR"""
        try:
            if content_type == "application/pdf":
                # Convert PDF to images
                images = convert_from_bytes(file_content)
                text = ""
                for image in images:
                    text += pytesseract.image_to_string(image) + "\n"
                return text
            elif content_type.startswith("image/"):
                # Process image directly
                image = Image.open(io.BytesIO(file_content))
                return pytesseract.image_to_string(image)
            else:
                return "Unsupported file type for OCR"
        except Exception as e:
            return f"OCR processing failed: {str(e)}"

    async def get_lab_results(self, user_id: str, system_id: str) -> List[LabResultResponse]:
        result = await self.db.execute(
            select(LabResult)
            .where(LabResult.user_id == user_id)
            .where(LabResult.system_id == system_id)
            .order_by(LabResult.uploaded_at.desc())
        )
        lab_results = result.scalars().all()
        return [LabResultResponse.model_validate(lab_result) for lab_result in lab_results]

    async def get_lab_result(self, lab_result_id: str, user_id: str, system_id: str) -> LabResultResponse:
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
        
        return LabResultResponse.model_validate(lab_result)

    async def get_biomarkers(self, lab_result_id: str, user_id: str, system_id: str) -> List[BiomarkerResponse]:
        # First verify the lab result belongs to the user
        await self.get_lab_result(lab_result_id, user_id, system_id)
        
        result = await self.db.execute(
            select(Biomarker)
            .where(Biomarker.lab_result_id == lab_result_id)
            .order_by(Biomarker.test_name)
        )
        biomarkers = result.scalars().all()
        return [BiomarkerResponse.model_validate(biomarker) for biomarker in biomarkers]

    async def delete_lab_result(self, lab_result_id: str, user_id: str, system_id: str) -> None:
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
        
        # Delete from S3
        try:
            self.s3_client.delete_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=lab_result.s3_key
            )
        except Exception:
            # Log error but don't fail the deletion
            pass
        
        # Delete from database (cascade will handle biomarkers)
        await self.db.delete(lab_result)
        await self.db.commit()

    # Enhanced Lab Result Management with Review Workflow

    async def list_lab_results(self, filters: LabResultListFilter, system_id: str) -> LabResultListResponse:
        """List lab results with filtering and pagination"""
        query = select(LabResult).options(
            selectinload(LabResult.biomarkers),
            selectinload(LabResult.user),
            selectinload(LabResult.ordering_staff),
            selectinload(LabResult.reviewed_by_staff)
        ).where(LabResult.system_id == system_id)

        # Apply filters
        if filters.user_id:
            query = query.where(LabResult.user_id == filters.user_id)
        if filters.ordered_by:
            query = query.where(LabResult.ordered_by == filters.ordered_by)
        if filters.reviewed_by:
            query = query.where(LabResult.reviewed_by == filters.reviewed_by)
        if filters.test_category:
            query = query.where(LabResult.test_category == filters.test_category)
        if filters.is_reviewed is not None:
            query = query.where(LabResult.is_reviewed == filters.is_reviewed)
        if filters.start_date:
            query = query.where(LabResult.test_date >= filters.start_date)
        if filters.end_date:
            query = query.where(LabResult.test_date <= filters.end_date)
        if filters.has_critical is not None:
            if filters.has_critical:
                query = query.join(Biomarker).where(Biomarker.is_critical == True)
            else:
                # This is complex - would need subquery for proper exclusion
                pass

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination and ordering
        query = query.order_by(desc(LabResult.test_date)).offset(filters.skip).limit(filters.limit)

        result = await self.db.execute(query)
        lab_results = result.scalars().all()

        # Convert to response format
        items = []
        for result in lab_results:
            # Count critical and abnormal biomarkers
            critical_count = sum(1 for b in result.biomarkers if b.is_critical)
            abnormal_count = sum(1 for b in result.biomarkers if b.status == ResultStatus.ABNORMAL)

            items.append(LabResultWithDetails(
                **result.__dict__,
                patient_name=f"{result.user.first_name} {result.user.last_name}",
                patient_email=result.user.email,
                ordering_physician_name=f"{result.ordering_staff.first_name} {result.ordering_staff.last_name}" if result.ordering_staff else None,
                reviewing_physician_name=f"{result.reviewed_by_staff.first_name} {result.reviewed_by_staff.last_name}" if result.reviewed_by_staff else None,
                biomarkers=[],  # Would need proper conversion
                critical_count=critical_count,
                abnormal_count=abnormal_count
            ))

        return LabResultListResponse(
            items=items,
            total=total,
            skip=filters.skip,
            limit=filters.limit,
            has_more=(filters.skip + len(items)) < total
        )

    async def review_lab_result(self, result_id: str, review_data: LabResultReview, system_id: str) -> LabResultResponse:
        """Physician review and sign-off on lab result"""
        result = await self.db.execute(
            select(LabResult).where(
                and_(
                    LabResult.id == result_id,
                    LabResult.system_id == system_id
                )
            )
        )
        lab_result = result.scalar_one_or_none()

        if not lab_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lab result not found"
            )

        if lab_result.is_reviewed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lab result already reviewed"
            )

        # Verify physician exists
        physician = await self.db.execute(
            select(Staff).where(Staff.id == review_data.reviewed_by)
        )
        if not physician.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reviewing physician not found"
            )

        # Update lab result
        lab_result.is_reviewed = True
        lab_result.reviewed_by = review_data.reviewed_by
        lab_result.reviewed_at = datetime.now()
        lab_result.physician_notes = review_data.physician_notes
        lab_result.updated_at = datetime.now()

        await self.db.commit()
        await self.db.refresh(lab_result)

        return LabResultResponse.model_validate(lab_result)

    async def create_biomarker(self, biomarker_data: BiomarkerCreate, system_id: str) -> BiomarkerResponse:
        """Create a new biomarker for a lab result"""
        # Verify lab result exists and belongs to system
        result = await self.db.execute(
            select(LabResult).where(
                and_(
                    LabResult.id == biomarker_data.lab_result_id,
                    LabResult.system_id == system_id
                )
            )
        )
        lab_result = result.scalar_one_or_none()

        if not lab_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lab result not found"
            )

        # Create biomarker
        biomarker = Biomarker(
            lab_result_id=biomarker_data.lab_result_id,
            test_name=biomarker_data.name,
            value=biomarker_data.value,
            unit=biomarker_data.unit,
            reference_range_low=biomarker_data.reference_range.split('-')[0] if biomarker_data.reference_range and '-' in biomarker_data.reference_range else None,
            reference_range_high=biomarker_data.reference_range.split('-')[1] if biomarker_data.reference_range and '-' in biomarker_data.reference_range else None,
            is_critical=biomarker_data.is_critical,
            physician_comment=biomarker_data.physician_comment,
            trend_direction=biomarker_data.trend_direction.value if biomarker_data.trend_direction else None,
            previous_value=biomarker_data.previous_value
        )

        self.db.add(biomarker)
        await self.db.commit()
        await self.db.refresh(biomarker)

        return BiomarkerResponse.model_validate(biomarker)

    async def update_biomarker(self, biomarker_id: str, update_data: BiomarkerUpdate, system_id: str) -> BiomarkerResponse:
        """Update a biomarker"""
        result = await self.db.execute(
            select(Biomarker).join(LabResult).where(
                and_(
                    Biomarker.id == biomarker_id,
                    LabResult.system_id == system_id
                )
            )
        )
        biomarker = result.scalar_one_or_none()

        if not biomarker:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Biomarker not found"
            )

        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            if field == "name":
                setattr(biomarker, "test_name", value)
            elif field == "reference_range" and value:
                if '-' in value:
                    biomarker.reference_range_low = value.split('-')[0]
                    biomarker.reference_range_high = value.split('-')[1]
            elif field == "trend_direction" and value:
                setattr(biomarker, field, value.value)
            else:
                setattr(biomarker, field, value)

        biomarker.updated_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(biomarker)

        return BiomarkerResponse.model_validate(biomarker)

    async def get_lab_result_with_biomarkers(self, result_id: str, system_id: str) -> LabResultWithBiomarkers:
        """Get lab result with all biomarkers"""
        result = await self.db.execute(
            select(LabResult)
            .options(
                selectinload(LabResult.biomarkers),
                selectinload(LabResult.user),
                selectinload(LabResult.ordering_staff),
                selectinload(LabResult.reviewed_by_staff)
            )
            .where(
                and_(
                    LabResult.id == result_id,
                    LabResult.system_id == system_id
                )
            )
        )
        lab_result = result.scalar_one_or_none()

        if not lab_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lab result not found"
            )

        # Count critical and abnormal biomarkers
        critical_count = sum(1 for b in lab_result.biomarkers if b.is_critical)
        abnormal_count = sum(1 for b in lab_result.biomarkers if b.status == ResultStatus.ABNORMAL)

        return LabResultWithBiomarkers(
            **lab_result.__dict__,
            biomarkers=[],  # Would need proper conversion
            critical_count=critical_count,
            abnormal_count=abnormal_count
        )

    async def get_unreviewed_results(self, system_id: str, limit: int = 50) -> List[LabResultWithBiomarkers]:
        """Get unreviewed lab results for physician dashboard"""
        result = await self.db.execute(
            select(LabResult)
            .options(
                selectinload(LabResult.biomarkers),
                selectinload(LabResult.user),
                selectinload(LabResult.ordering_staff)
            )
            .where(
                and_(
                    LabResult.system_id == system_id,
                    LabResult.is_reviewed == False
                )
            )
            .order_by(desc(LabResult.uploaded_at))
            .limit(limit)
        )
        lab_results = result.scalars().all()

        results = []
        for lab_result in lab_results:
            critical_count = sum(1 for b in lab_result.biomarkers if b.is_critical)
            abnormal_count = sum(1 for b in lab_result.biomarkers if b.status == ResultStatus.ABNORMAL)

            results.append(LabResultWithBiomarkers(
                **lab_result.__dict__,
                biomarkers=[],  # Would need proper conversion
                critical_count=critical_count,
                abnormal_count=abnormal_count
            ))

        return results

    async def get_critical_results(self, system_id: str, limit: int = 20) -> List[LabResultWithBiomarkers]:
        """Get lab results with critical biomarkers"""
        result = await self.db.execute(
            select(LabResult)
            .options(
                selectinload(LabResult.biomarkers),
                selectinload(LabResult.user),
                selectinload(LabResult.ordering_staff)
            )
            .join(Biomarker)
            .where(
                and_(
                    LabResult.system_id == system_id,
                    Biomarker.is_critical == True
                )
            )
            .order_by(desc(LabResult.uploaded_at))
            .limit(limit)
        )
        lab_results = result.scalars().all()

        results = []
        for lab_result in lab_results:
            critical_count = sum(1 for b in lab_result.biomarkers if b.is_critical)
            abnormal_count = sum(1 for b in lab_result.biomarkers if b.status == ResultStatus.ABNORMAL)

            results.append(LabResultWithBiomarkers(
                **lab_result.__dict__,
                biomarkers=[],  # Would need proper conversion
                critical_count=critical_count,
                abnormal_count=abnormal_count
            ))

        return results
