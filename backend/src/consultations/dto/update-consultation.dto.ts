import { IsEnum, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsultationStatus } from '@prisma/client';

export class UpdateConsultationDto {
  @ApiPropertyOptional({ enum: ConsultationStatus, example: ConsultationStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;

  @ApiPropertyOptional({ example: 'Patient presented with...' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'Prescribed medication...' })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  @IsOptional()
  @IsString()
  meetingLink?: string;
}

export class RescheduleConsultationDto {
  @ApiProperty({ example: '2025-10-16T14:00:00Z', description: 'New scheduled time (ISO 8601)' })
  @IsDateString()
  scheduledAt: string;
}

