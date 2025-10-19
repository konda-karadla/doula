import pytesseract
from PIL import Image
from pdf2image import convert_from_bytes
import io
import logging

logger = logging.getLogger(__name__)


class OCRService:
    def __init__(self):
        pass

    async def extract_text_from_buffer(self, file_buffer: bytes) -> str:
        try:
            images = convert_from_bytes(file_buffer)

            extracted_text = []
            for i, image in enumerate(images):
                logger.info(f"Processing page {i + 1} of {len(images)}")
                text = pytesseract.image_to_string(image)
                extracted_text.append(text)

            full_text = "\n\n".join(extracted_text)
            logger.info(f"OCR extraction completed. Total characters: {len(full_text)}")

            return full_text
        except Exception as e:
            logger.error(f"Error during OCR processing: {e}")
            raise
