import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, UploadFile

from app.models.lab_result import LabResult, Biomarker
from app.schemas.lab import LabResultResponse, BiomarkerResponse
from app.services.s3_service import S3Service
from app.tasks.ocr_tasks import process_ocr_task

logger = logging.getLogger(__name__)


class LabsService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.s3_service = S3Service()

    async def upload_lab(
        self,
        file: UploadFile,
        user_id: str,
        system_id: str,
        notes: str = None
    ) -> LabResultResponse:
        logger.info(f"Uploading lab for user: {user_id}")

        file_content = await file.read()

        s3_key = self.s3_service.generate_key(system_id, user_id, file.filename)
        result = await self.s3_service.upload_file(file_content, file.filename, s3_key)

        lab_result = LabResult(
            user_id=user_id,
            system_id=system_id,
            file_name=file.filename,
            s3_key=result["key"],
            s3_url=result["url"],
            processing_status="pending",
        )

        self.db.add(lab_result)
        await self.db.commit()
        await self.db.refresh(lab_result)

        process_ocr_task.delay(lab_result.id, s3_key)

        logger.info(f"Lab uploaded and queued for processing: {lab_result.id}")

        return LabResultResponse.from_orm_with_camel(lab_result)

    async def get_lab_results(self, user_id: str, system_id: str) -> list[LabResultResponse]:
        result = await self.db.execute(
            select(LabResult)
            .where(LabResult.user_id == user_id, LabResult.system_id == system_id)
            .order_by(LabResult.uploaded_at.desc())
        )
        lab_results = result.scalars().all()

        return [LabResultResponse.from_orm_with_camel(lab) for lab in lab_results]

    async def get_lab_result(self, lab_id: str, user_id: str, system_id: str) -> LabResultResponse:
        result = await self.db.execute(
            select(LabResult).where(
                LabResult.id == lab_id,
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

        return LabResultResponse.from_orm_with_camel(lab_result)

    async def get_biomarkers(self, lab_id: str, user_id: str, system_id: str) -> list[BiomarkerResponse]:
        result = await self.db.execute(
            select(LabResult).where(
                LabResult.id == lab_id,
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
            .where(Biomarker.lab_result_id == lab_id)
            .order_by(Biomarker.test_name.asc())
        )
        biomarkers = result.scalars().all()

        return [BiomarkerResponse.from_orm_with_camel(bio) for bio in biomarkers]

    async def delete_lab_result(self, lab_id: str, user_id: str, system_id: str):
        result = await self.db.execute(
            select(LabResult).where(
                LabResult.id == lab_id,
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

        await self.s3_service.delete_file(lab_result.s3_key)

        await self.db.delete(lab_result)
        await self.db.commit()

        logger.info(f"Lab result deleted: {lab_id}")
