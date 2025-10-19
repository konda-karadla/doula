import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
      this.logger.log('Starting OCR processing...');

      const result = await Tesseract.recognize(buffer, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            this.logger.debug(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
          }
        },
      });

      this.logger.log('OCR processing completed');
      return result.data.text;
    } catch (error) {
      this.logger.error(`OCR processing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    return this.extractTextFromBuffer(file.buffer);
  }
}
