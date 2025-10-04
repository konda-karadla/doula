import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { HealthStatsDto } from './dto/health-stats.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string, systemId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        systemId,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      profileType: user.profileType,
      journeyType: user.journeyType,
      systemId: user.systemId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getHealthStats(
    userId: string,
    systemId: string,
  ): Promise<HealthStatsDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        systemId,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const [
      labResultsCount,
      actionPlansCount,
      actionItems,
      lastLabResult,
      lastActionPlan,
    ] = await Promise.all([
      this.prisma.labResult.count({
        where: { userId, systemId },
      }),
      this.prisma.actionPlan.count({
        where: { userId, systemId },
      }),
      this.prisma.actionItem.findMany({
        where: {
          actionPlan: {
            userId,
            systemId,
          },
        },
      }),
      this.prisma.labResult.findFirst({
        where: { userId, systemId },
        orderBy: { uploadedAt: 'desc' },
      }),
      this.prisma.actionPlan.findFirst({
        where: { userId, systemId },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const completedActionItems = actionItems.filter(
      (item) => item.completedAt !== null,
    ).length;
    const pendingActionItems = actionItems.filter(
      (item) => item.completedAt === null,
    ).length;

    const criticalInsights = await this.getCriticalInsightsCount(
      userId,
      systemId,
    );

    return {
      totalLabResults: labResultsCount,
      totalActionPlans: actionPlansCount,
      completedActionItems,
      pendingActionItems,
      criticalInsights,
      lastLabUpload: lastLabResult?.uploadedAt,
      lastActionPlanUpdate: lastActionPlan?.updatedAt,
      memberSince: user.createdAt,
    };
  }

  private async getCriticalInsightsCount(
    userId: string,
    systemId: string,
  ): Promise<number> {
    const latestLabResult = await this.prisma.labResult.findFirst({
      where: { userId, systemId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        biomarkers: true,
      },
    });

    if (!latestLabResult) {
      return 0;
    }

    const biomarkerRules: Record<
      string,
      { optimalLow?: number; optimalHigh?: number }
    > = {
      glucose: { optimalLow: 70, optimalHigh: 100 },
      'hemoglobin a1c': { optimalHigh: 5.7 },
      cholesterol: { optimalHigh: 200 },
      'ldl cholesterol': { optimalHigh: 100 },
      'hdl cholesterol': { optimalLow: 40 },
      triglycerides: { optimalHigh: 150 },
      tsh: { optimalLow: 0.4, optimalHigh: 4.0 },
      'vitamin d': { optimalLow: 30, optimalHigh: 100 },
      hemoglobin: { optimalLow: 12.0, optimalHigh: 17.0 },
    };

    let criticalCount = 0;

    for (const biomarker of latestLabResult.biomarkers) {
      const testNameLower = biomarker.testName.toLowerCase();
      const rules = biomarkerRules[testNameLower];

      if (!rules) continue;

      const value = parseFloat(biomarker.value);
      if (isNaN(value)) continue;

      if (rules.optimalLow && value < rules.optimalLow * 0.7) {
        criticalCount++;
      } else if (rules.optimalHigh && value > rules.optimalHigh * 1.5) {
        criticalCount++;
      }
    }

    return criticalCount;
  }
}
