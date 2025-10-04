import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from './services/s3.service';
import { LabResultDto } from './dto/lab-result.dto';
import { BiomarkerDto } from './dto/biomarker.dto';

@Injectable()
export class LabsService {
  private readonly logger = new Logger(LabsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    @InjectQueue('ocr-processing') private readonly ocrQueue: Queue,
  ) {}

  async uploadLab(
    file: Express.Multer.File,
    userId: string,
    systemId: string,
    notes?: string,
  ): Promise<LabResultDto> {
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

  async getLabResults(userId: string, systemId: string): Promise<LabResultDto[]> {
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

  async getLabResult(id: string, userId: string, systemId: string): Promise<LabResultDto> {
    const labResult = await this.prisma.labResult.findFirst({
      where: {
        id,
        userId,
        systemId,
      },
    });

    if (!labResult) {
      throw new NotFoundException('Lab result not found');
    }

    return this.mapToDto(labResult);
  }

  async getBiomarkers(
    labResultId: string,
    userId: string,
    systemId: string,
  ): Promise<BiomarkerDto[]> {
    const labResult = await this.prisma.labResult.findFirst({
      where: {
        id: labResultId,
        userId,
        systemId,
      },
    });

    if (!labResult) {
      throw new NotFoundException('Lab result not found');
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

  async deleteLabResult(
    id: string,
    userId: string,
    systemId: string,
  ): Promise<void> {
    const labResult = await this.prisma.labResult.findFirst({
      where: {
        id,
        userId,
        systemId,
      },
    });

    if (!labResult) {
      throw new NotFoundException('Lab result not found');
    }

    await this.s3Service.deleteFile(labResult.s3Key);

    await this.prisma.labResult.delete({
      where: { id },
    });

    this.logger.log(`Lab result deleted: ${id}`);
  }

  private mapToDto(labResult: any): LabResultDto {
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

  private mapBiomarkerToDto(biomarker: any): BiomarkerDto {
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
}
