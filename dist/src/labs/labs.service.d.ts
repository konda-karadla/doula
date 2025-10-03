import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from './services/s3.service';
import { LabResultDto } from './dto/lab-result.dto';
import { BiomarkerDto } from './dto/biomarker.dto';
export declare class LabsService {
    private readonly prisma;
    private readonly s3Service;
    private readonly ocrQueue;
    private readonly logger;
    constructor(prisma: PrismaService, s3Service: S3Service, ocrQueue: Queue);
    uploadLab(file: Express.Multer.File, userId: string, systemId: string, notes?: string): Promise<LabResultDto>;
    getLabResults(userId: string, systemId: string): Promise<LabResultDto[]>;
    getLabResult(id: string, userId: string, systemId: string): Promise<LabResultDto>;
    getBiomarkers(labResultId: string, userId: string, systemId: string): Promise<BiomarkerDto[]>;
    deleteLabResult(id: string, userId: string, systemId: string): Promise<void>;
    private mapToDto;
    private mapBiomarkerToDto;
}
