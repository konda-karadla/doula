import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { HealthScoreService } from './services/health-score.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InsightsController],
  providers: [InsightsService, HealthScoreService],
  exports: [InsightsService, HealthScoreService],
})
export class InsightsModule {}
