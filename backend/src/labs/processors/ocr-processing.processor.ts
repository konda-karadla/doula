import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OcrService } from '../services/ocr.service';
import { BiomarkerParserService } from '../services/biomarker-parser.service';
import { S3Service } from '../services/s3.service';

interface OcrJobData {
  labResultId: string;
  s3Key: string;
}

@Processor('ocr-processing')
export class OcrProcessingProcessor {
  private readonly logger = new Logger(OcrProcessingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ocrService: OcrService,
    private readonly biomarkerParser: BiomarkerParserService,
    private readonly s3Service: S3Service,
  ) {}

  @Process('extract-text')
  async handleOcrProcessing(job: Job<OcrJobData>) {
    const { labResultId, s3Key } = job.data;

    this.logger.log(`Processing OCR for lab result: ${labResultId}`);

    try {
      await this.prisma.labResult.update({
        where: { id: labResultId },
        data: { processingStatus: 'processing' },
      });

      const presignedUrl = await this.s3Service.getPresignedUrl(s3Key);
      const response = await fetch(presignedUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      const ocrText = await this.ocrService.extractTextFromBuffer(buffer);

      await this.prisma.labResult.update({
        where: { id: labResultId },
        data: {
          rawOcrText: ocrText,
          processingStatus: 'parsing',
        },
      });

      const biomarkers = this.biomarkerParser.parseBiomarkersFromText(ocrText);

      if (biomarkers.length > 0) {
        await this.prisma.biomarker.createMany({
          data: biomarkers.map((bio) => ({
            labResultId,
            testName: bio.testName,
            value: bio.value,
            unit: bio.unit,
            referenceRangeLow: bio.referenceRangeLow,
            referenceRangeHigh: bio.referenceRangeHigh,
          })),
        });
      }

      await this.prisma.labResult.update({
        where: { id: labResultId },
        data: { processingStatus: 'completed' },
      });

      this.logger.log(
        `OCR processing completed for lab result: ${labResultId}`,
      );
    } catch (error) {
      this.logger.error(
        `OCR processing failed for lab result ${labResultId}: ${error.message}`,
        error.stack,
      );

      await this.prisma.labResult.update({
        where: { id: labResultId },
        data: { processingStatus: 'failed' },
      });

      throw error;
    }
  }
}
