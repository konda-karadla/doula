import asyncio
import httpx
import logging
from sqlalchemy import select, update

from app.core.celery_app import celery_app
from app.core.database import async_session_maker
from app.models.lab_result import LabResult, Biomarker
from app.services.ocr_service import OCRService
from app.services.biomarker_parser_service import BiomarkerParserService
from app.services.s3_service import S3Service

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.process_ocr")
def process_ocr_task(lab_result_id: str, s3_key: str):
    asyncio.run(process_ocr(lab_result_id, s3_key))


async def process_ocr(lab_result_id: str, s3_key: str):
    logger.info(f"Processing OCR for lab result: {lab_result_id}")

    async with async_session_maker() as db:
        try:
            await db.execute(
                update(LabResult)
                .where(LabResult.id == lab_result_id)
                .values(processing_status="processing")
            )
            await db.commit()

            s3_service = S3Service()
            presigned_url = await s3_service.get_presigned_url(s3_key)

            async with httpx.AsyncClient() as client:
                response = await client.get(presigned_url)
                file_buffer = response.content

            ocr_service = OCRService()
            ocr_text = await ocr_service.extract_text_from_buffer(file_buffer)

            await db.execute(
                update(LabResult)
                .where(LabResult.id == lab_result_id)
                .values(raw_ocr_text=ocr_text, processing_status="parsing")
            )
            await db.commit()

            biomarker_parser = BiomarkerParserService()
            biomarkers = biomarker_parser.parse_biomarkers_from_text(ocr_text)

            if biomarkers:
                for bio in biomarkers:
                    biomarker = Biomarker(
                        lab_result_id=lab_result_id,
                        test_name=bio['testName'],
                        value=bio['value'],
                        unit=bio.get('unit'),
                        reference_range_low=bio.get('referenceRangeLow'),
                        reference_range_high=bio.get('referenceRangeHigh'),
                    )
                    db.add(biomarker)

                await db.commit()

            await db.execute(
                update(LabResult)
                .where(LabResult.id == lab_result_id)
                .values(processing_status="completed")
            )
            await db.commit()

            logger.info(f"OCR processing completed for lab result: {lab_result_id}")

        except Exception as e:
            logger.error(f"OCR processing failed for lab result {lab_result_id}: {str(e)}")

            await db.execute(
                update(LabResult)
                .where(LabResult.id == lab_result_id)
                .values(processing_status="failed")
            )
            await db.commit()

            raise
