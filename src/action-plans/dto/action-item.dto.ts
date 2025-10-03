import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActionItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  actionPlanId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  dueDate?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty()
  priority: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
