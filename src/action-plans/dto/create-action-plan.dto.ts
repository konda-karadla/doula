import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ActionPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export class CreateActionPlanDto {
  @ApiProperty({ description: 'Title of the action plan' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description of the action plan' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the action plan',
    enum: ActionPlanStatus,
    default: ActionPlanStatus.ACTIVE,
  })
  @IsEnum(ActionPlanStatus)
  @IsOptional()
  status?: ActionPlanStatus;
}
