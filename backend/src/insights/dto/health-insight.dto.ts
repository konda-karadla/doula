import { ApiProperty } from '@nestjs/swagger';

export enum InsightType {
  NORMAL = 'normal',
  LOW = 'low',
  HIGH = 'high',
  CRITICAL = 'critical',
  IMPROVEMENT = 'improvement',
  CONCERN = 'concern',
}

export enum InsightPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class HealthInsightDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  biomarkerId: string;

  @ApiProperty()
  testName: string;

  @ApiProperty()
  currentValue: string;

  @ApiProperty({ required: false })
  previousValue?: string;

  @ApiProperty()
  type: InsightType;

  @ApiProperty()
  priority: InsightPriority;

  @ApiProperty()
  message: string;

  @ApiProperty()
  recommendation: string;

  @ApiProperty({ required: false })
  trendDirection?: 'up' | 'down' | 'stable';

  @ApiProperty()
  createdAt: Date;
}
