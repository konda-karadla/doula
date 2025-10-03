import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';
import { S3Service } from './services/s3.service';
import { OcrService } from './services/ocr.service';
import { BiomarkerParserService } from './services/biomarker-parser.service';
import { OcrProcessingProcessor } from './processors/ocr-processing.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'ocr-processing',
    }),
  ],
  controllers: [LabsController],
  providers: [
    LabsService,
    S3Service,
    OcrService,
    BiomarkerParserService,
    OcrProcessingProcessor,
  ],
  exports: [LabsService],
})
export class LabsModule {}
