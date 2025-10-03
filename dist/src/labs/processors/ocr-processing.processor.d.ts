import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { OcrService } from '../services/ocr.service';
import { BiomarkerParserService } from '../services/biomarker-parser.service';
import { S3Service } from '../services/s3.service';
interface OcrJobData {
    labResultId: string;
    s3Key: string;
}
export declare class OcrProcessingProcessor {
    private readonly prisma;
    private readonly ocrService;
    private readonly biomarkerParser;
    private readonly s3Service;
    private readonly logger;
    constructor(prisma: PrismaService, ocrService: OcrService, biomarkerParser: BiomarkerParserService, s3Service: S3Service);
    handleOcrProcessing(job: Job<OcrJobData>): Promise<void>;
}
export {};
