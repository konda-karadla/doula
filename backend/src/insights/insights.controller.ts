import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { HealthScoreService } from './services/health-score.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantIsolationGuard } from '../common/guards/tenant-isolation.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HealthInsightDto } from './dto/health-insight.dto';
import { InsightsSummaryDto } from './dto/insights-summary.dto';

@ApiTags('insights')
@ApiBearerAuth()
@Controller('insights')
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
export class InsightsController {
  constructor(
    private readonly insightsService: InsightsService,
    private readonly healthScoreService: HealthScoreService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get health insights summary from latest lab results',
  })
  @ApiResponse({
    status: 200,
    description: 'Health insights summary with prioritized recommendations',
    type: InsightsSummaryDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInsightsSummary(
    @CurrentUser() user: any,
  ): Promise<InsightsSummaryDto> {
    return this.insightsService.getInsightsSummary(
      user.userId,
      user.systemId,
    );
  }

  @Get('lab-result/:labResultId')
  @ApiOperation({ summary: 'Get insights for specific lab result' })
  @ApiParam({ name: 'labResultId', description: 'Lab result ID' })
  @ApiResponse({
    status: 200,
    description: 'Health insights for the specified lab result',
    type: [HealthInsightDto],
  })
  @ApiResponse({ status: 404, description: 'Lab result not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInsightsForLabResult(
    @CurrentUser() user: any,
    @Param('labResultId') labResultId: string,
  ): Promise<HealthInsightDto[]> {
    return this.insightsService.generateInsightsForLabResult(
      labResultId,
      user.userId,
      user.systemId,
    );
  }

  @Get('trends/:testName')
  @ApiOperation({ summary: 'Get biomarker trends over time' })
  @ApiParam({
    name: 'testName',
    description: 'Name of the biomarker (e.g., "glucose", "cholesterol")',
  })
  @ApiResponse({
    status: 200,
    description: 'Historical trend data for the specified biomarker',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBiomarkerTrends(
    @CurrentUser() user: any,
    @Param('testName') testName: string,
  ) {
    return this.insightsService.getBiomarkerTrends(
      testName,
      user.userId,
      user.systemId,
    );
  }

  @Get('health-score')
  @ApiOperation({
    summary: 'Get comprehensive health score based on all biomarkers',
  })
  @ApiResponse({
    status: 200,
    description: 'Health score with category breakdowns and trends',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getHealthScore(@CurrentUser() user: any) {
    return this.healthScoreService.calculateHealthScore(
      user.userId,
      user.systemId,
    );
  }
}
