import { ApiProperty } from '@nestjs/swagger';
import { HealthInsightDto } from './health-insight.dto';

export class InsightsSummaryDto {
  @ApiProperty()
  totalInsights: number;

  @ApiProperty()
  criticalCount: number;

  @ApiProperty()
  highPriorityCount: number;

  @ApiProperty()
  normalCount: number;

  @ApiProperty({ type: [HealthInsightDto] })
  insights: HealthInsightDto[];

  @ApiProperty()
  lastAnalyzedAt: Date;
}
