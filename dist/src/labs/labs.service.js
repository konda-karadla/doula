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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LabsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabsService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("./services/s3.service");
let LabsService = LabsService_1 = class LabsService {
    prisma;
    s3Service;
    ocrQueue;
    logger = new common_1.Logger(LabsService_1.name);
    constructor(prisma, s3Service, ocrQueue) {
        this.prisma = prisma;
        this.s3Service = s3Service;
        this.ocrQueue = ocrQueue;
    }
    async uploadLab(file, userId, systemId, notes) {
        this.logger.log(`Uploading lab for user: ${userId}`);
        const s3Key = this.s3Service.generateKey(systemId, userId, file.originalname);
        const { url } = await this.s3Service.uploadFile(file, s3Key);
        const labResult = await this.prisma.labResult.create({
            data: {
                userId,
                systemId,
                fileName: file.originalname,
                s3Key,
                s3Url: url,
                processingStatus: 'pending',
            },
        });
        await this.ocrQueue.add('extract-text', {
            labResultId: labResult.id,
            s3Key,
        });
        this.logger.log(`Lab uploaded and queued for processing: ${labResult.id}`);
        return this.mapToDto(labResult);
    }
    async getLabResults(userId, systemId) {
        const labResults = await this.prisma.labResult.findMany({
            where: {
                userId,
                systemId,
            },
            orderBy: {
                uploadedAt: 'desc',
            },
        });
        return labResults.map((lab) => this.mapToDto(lab));
    }
    async getLabResult(id, userId, systemId) {
        const labResult = await this.prisma.labResult.findFirst({
            where: {
                id,
                userId,
                systemId,
            },
        });
        if (!labResult) {
            throw new common_1.NotFoundException('Lab result not found');
        }
        return this.mapToDto(labResult);
    }
    async getBiomarkers(labResultId, userId, systemId) {
        const labResult = await this.prisma.labResult.findFirst({
            where: {
                id: labResultId,
                userId,
                systemId,
            },
        });
        if (!labResult) {
            throw new common_1.NotFoundException('Lab result not found');
        }
        const biomarkers = await this.prisma.biomarker.findMany({
            where: {
                labResultId,
            },
            orderBy: {
                testName: 'asc',
            },
        });
        return biomarkers.map((bio) => this.mapBiomarkerToDto(bio));
    }
    async deleteLabResult(id, userId, systemId) {
        const labResult = await this.prisma.labResult.findFirst({
            where: {
                id,
                userId,
                systemId,
            },
        });
        if (!labResult) {
            throw new common_1.NotFoundException('Lab result not found');
        }
        await this.s3Service.deleteFile(labResult.s3Key);
        await this.prisma.labResult.delete({
            where: { id },
        });
        this.logger.log(`Lab result deleted: ${id}`);
    }
    mapToDto(labResult) {
        return {
            id: labResult.id,
            fileName: labResult.fileName,
            uploadedAt: labResult.uploadedAt,
            processingStatus: labResult.processingStatus,
            s3Url: labResult.s3Url,
            rawOcrText: labResult.rawOcrText,
            createdAt: labResult.createdAt,
            updatedAt: labResult.updatedAt,
        };
    }
    mapBiomarkerToDto(biomarker) {
        return {
            id: biomarker.id,
            labResultId: biomarker.labResultId,
            testName: biomarker.testName,
            value: biomarker.value,
            unit: biomarker.unit,
            referenceRangeLow: biomarker.referenceRangeLow,
            referenceRangeHigh: biomarker.referenceRangeHigh,
            testDate: biomarker.testDate,
            notes: biomarker.notes,
            createdAt: biomarker.createdAt,
            updatedAt: biomarker.updatedAt,
        };
    }
};
exports.LabsService = LabsService;
exports.LabsService = LabsService = LabsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bull_1.InjectQueue)('ocr-processing')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service, Object])
], LabsService);
//# sourceMappingURL=labs.service.js.map