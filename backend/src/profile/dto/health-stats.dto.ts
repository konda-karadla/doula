import { ApiProperty } from '@nestjs/swagger';

export class HealthStatsDto {
  @ApiProperty()
  totalLabResults: number;

  @ApiProperty()
  totalActionPlans: number;

  @ApiProperty()
  completedActionItems: number;

  @ApiProperty()
  pendingActionItems: number;

  @ApiProperty()
  criticalInsights: number;

  @ApiProperty()
  lastLabUpload?: Date;

  @ApiProperty()
  lastActionPlanUpdate?: Date;

  @ApiProperty()
  memberSince: Date;
}
