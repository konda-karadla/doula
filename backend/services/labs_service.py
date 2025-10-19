from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, UploadFile
import boto3
import pytesseract
from PIL import Image
from pdf2image import convert_from_bytes
import io
import os

from backend.models.lab_result import LabResult, Biomarker
from backend.schemas.lab import LabResultResponse, BiomarkerResponse
from backend.core.config import settings


class LabsService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )

    async def upload_lab(self, file: UploadFile, user_id: str, system_id: str, notes: Optional[str] = None) -> LabResultResponse:
        # Generate unique S3 key
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
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
            raw_ocr_text = await self._extract_text_from_file(file_content, file.content_type)
            lab_result.raw_ocr_text = raw_ocr_text
            lab_result.processing_status = "completed"
            await self.db.commit()
        except Exception as e:
            lab_result.processing_status = "failed"
            await self.db.commit()
        
        return LabResultResponse.from_orm_with_camel(lab_result)

    async def _extract_text_from_file(self, file_content: bytes, content_type: str) -> str:
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
        return [LabResultResponse.from_orm_with_camel(lab_result) for lab_result in lab_results]

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
        
        return LabResultResponse.from_orm_with_camel(lab_result)

    async def get_biomarkers(self, lab_result_id: str, user_id: str, system_id: str) -> List[BiomarkerResponse]:
        # First verify the lab result belongs to the user
        lab_result = await self.get_lab_result(lab_result_id, user_id, system_id)
        
        result = await self.db.execute(
            select(Biomarker)
            .where(Biomarker.lab_result_id == lab_result_id)
            .order_by(Biomarker.test_name)
        )
        biomarkers = result.scalars().all()
        return [BiomarkerResponse.from_orm_with_camel(biomarker) for biomarker in biomarkers]

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
        except Exception as e:
            # Log error but don't fail the deletion
            pass
        
        # Delete from database (cascade will handle biomarkers)
        await self.db.delete(lab_result)
        await self.db.commit()
