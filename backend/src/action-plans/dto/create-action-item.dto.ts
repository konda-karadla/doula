import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ActionItemPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateActionItemDto {
  @ApiProperty({ description: 'Title of the action item' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description of the action item' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Due date for the action item (ISO 8601 format)' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Priority level',
    enum: ActionItemPriority,
    default: ActionItemPriority.MEDIUM,
  })
  @IsEnum(ActionItemPriority)
  @IsOptional()
  priority?: ActionItemPriority;
}
