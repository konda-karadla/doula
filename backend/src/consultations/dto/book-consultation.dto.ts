import { IsUUID, IsDateString, IsEnum, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsultationType } from '@prisma/client';

export class BookConsultationDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ example: '2025-10-15T10:00:00Z', description: 'ISO 8601 datetime' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes', default: 30 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(120)
  duration?: number;

  @ApiPropertyOptional({ enum: ConsultationType, example: ConsultationType.VIDEO, default: ConsultationType.VIDEO })
  @IsOptional()
  @IsEnum(ConsultationType)
  type?: ConsultationType;
}

