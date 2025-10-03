"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OcrProcessingProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrProcessingProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ocr_service_1 = require("../services/ocr.service");
const biomarker_parser_service_1 = require("../services/biomarker-parser.service");
const s3_service_1 = require("../services/s3.service");
let OcrProcessingProcessor = OcrProcessingProcessor_1 = class OcrProcessingProcessor {
    prisma;
    ocrService;
    biomarkerParser;
    s3Service;
    logger = new common_1.Logger(OcrProcessingProcessor_1.name);
    constructor(prisma, ocrService, biomarkerParser, s3Service) {
        this.prisma = prisma;
        this.ocrService = ocrService;
        this.biomarkerParser = biomarkerParser;
        this.s3Service = s3Service;
    }
    async handleOcrProcessing(job) {
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
            this.logger.log(`OCR processing completed for lab result: ${labResultId}`);
        }
        catch (error) {
            this.logger.error(`OCR processing failed for lab result ${labResultId}: ${error.message}`, error.stack);
            await this.prisma.labResult.update({
                where: { id: labResultId },
                data: { processingStatus: 'failed' },
            });
            throw error;
        }
    }
};
exports.OcrProcessingProcessor = OcrProcessingProcessor;
__decorate([
    (0, bull_1.Process)('extract-text'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OcrProcessingProcessor.prototype, "handleOcrProcessing", null);
exports.OcrProcessingProcessor = OcrProcessingProcessor = OcrProcessingProcessor_1 = __decorate([
    (0, bull_1.Processor)('ocr-processing'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ocr_service_1.OcrService,
        biomarker_parser_service_1.BiomarkerParserService,
        s3_service_1.S3Service])
], OcrProcessingProcessor);
//# sourceMappingURL=ocr-processing.processor.js.map