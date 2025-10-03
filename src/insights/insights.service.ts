import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  HealthInsightDto,
  InsightType,
  InsightPriority,
} from './dto/health-insight.dto';
import { InsightsSummaryDto } from './dto/insights-summary.dto';

interface BiomarkerRules {
  [key: string]: {
    optimalLow?: number;
    optimalHigh?: number;
    unit: string;
    recommendations: {
      low?: string;
      high?: string;
      normal?: string;
    };
  };
}

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  private readonly biomarkerRules: BiomarkerRules = {
    glucose: {
      optimalLow: 70,
      optimalHigh: 100,
      unit: 'mg/dL',
      recommendations: {
        low: 'Your blood glucose is low. Consider eating a small snack with carbohydrates. If this persists, consult your healthcare provider.',
        high: 'Your blood glucose is elevated. Consider reducing sugar intake, increasing physical activity, and monitoring regularly.',
        normal:
          'Your glucose levels are within optimal range. Maintain a balanced diet and regular exercise.',
      },
    },
    'hemoglobin a1c': {
      optimalHigh: 5.7,
      unit: '%',
      recommendations: {
        high: 'Your HbA1c indicates prediabetes or diabetes. Consult your doctor for a comprehensive diabetes management plan.',
        normal:
          'Your HbA1c is in the normal range, indicating good blood sugar control.',
      },
    },
    cholesterol: {
      optimalHigh: 200,
      unit: 'mg/dL',
      recommendations: {
        high: 'Your total cholesterol is elevated. Consider a heart-healthy diet, regular exercise, and discuss with your doctor.',
        normal:
          'Your cholesterol is within recommended range. Continue heart-healthy habits.',
      },
    },
    'ldl cholesterol': {
      optimalHigh: 100,
      unit: 'mg/dL',
      recommendations: {
        high: 'Your LDL cholesterol is high. Reduce saturated fats, increase fiber intake, and consider discussing medication with your doctor.',
        normal:
          'Your LDL cholesterol is optimal. Continue healthy eating patterns.',
      },
    },
    'hdl cholesterol': {
      optimalLow: 40,
      unit: 'mg/dL',
      recommendations: {
        low: 'Your HDL cholesterol is low. Increase aerobic exercise, quit smoking if applicable, and eat healthy fats.',
        normal:
          'Your HDL cholesterol is good. This helps protect against heart disease.',
      },
    },
    triglycerides: {
      optimalHigh: 150,
      unit: 'mg/dL',
      recommendations: {
        high: 'Your triglycerides are elevated. Limit sugar and refined carbs, increase omega-3 fatty acids, and exercise regularly.',
        normal:
          'Your triglyceride levels are healthy. Maintain your current lifestyle.',
      },
    },
    tsh: {
      optimalLow: 0.4,
      optimalHigh: 4.0,
      unit: 'mIU/L',
      recommendations: {
        low: 'Your TSH is low, which may indicate hyperthyroidism. Consult your doctor for thyroid function evaluation.',
        high: 'Your TSH is elevated, which may indicate hypothyroidism. Discuss thyroid supplementation with your healthcare provider.',
        normal:
          'Your thyroid function appears normal. Continue monitoring as recommended.',
      },
    },
    'vitamin d': {
      optimalLow: 30,
      optimalHigh: 100,
      unit: 'ng/mL',
      recommendations: {
        low: 'Your vitamin D is low. Increase sun exposure, eat vitamin D-rich foods, or consider supplementation (2000-4000 IU daily).',
        high: 'Your vitamin D is very high. Review your supplementation with your doctor to avoid toxicity.',
        normal:
          'Your vitamin D levels are optimal. Maintain adequate sun exposure and dietary intake.',
      },
    },
    hemoglobin: {
      optimalLow: 12.0,
      optimalHigh: 17.0,
      unit: 'g/dL',
      recommendations: {
        low: 'Your hemoglobin is low, indicating possible anemia. Increase iron-rich foods and consult your doctor.',
        high: 'Your hemoglobin is elevated. Stay well-hydrated and discuss with your healthcare provider.',
        normal:
          'Your hemoglobin levels are healthy, indicating good oxygen-carrying capacity.',
      },
    },
  };

  async generateInsightsForLabResult(
    labResultId: string,
    userId: string,
    systemId: string,
  ): Promise<HealthInsightDto[]> {
    const biomarkers = await this.prisma.biomarker.findMany({
      where: {
        labResultId,
        labResult: {
          userId,
          systemId,
        },
      },
    });

    const insights: HealthInsightDto[] = [];

    for (const biomarker of biomarkers) {
      const insight = this.analyzeBiomarker(biomarker);
      if (insight) {
        insights.push(insight);
      }
    }

    return insights;
  }

  async getInsightsSummary(
    userId: string,
    systemId: string,
  ): Promise<InsightsSummaryDto> {
    const labResults = await this.prisma.labResult.findMany({
      where: {
        userId,
        systemId,
      },
      include: {
        biomarkers: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      take: 1,
    });

    if (labResults.length === 0) {
      return {
        totalInsights: 0,
        criticalCount: 0,
        highPriorityCount: 0,
        normalCount: 0,
        insights: [],
        lastAnalyzedAt: new Date(),
      };
    }

    const latestLabResult = labResults[0];
    const insights: HealthInsightDto[] = [];

    for (const biomarker of latestLabResult.biomarkers) {
      const insight = this.analyzeBiomarker(biomarker);
      if (insight) {
        insights.push(insight);
      }
    }

    const criticalCount = insights.filter(
      (i) => i.type === InsightType.CRITICAL,
    ).length;
    const highPriorityCount = insights.filter(
      (i) => i.priority === InsightPriority.HIGH,
    ).length;
    const normalCount = insights.filter(
      (i) => i.type === InsightType.NORMAL,
    ).length;

    return {
      totalInsights: insights.length,
      criticalCount,
      highPriorityCount,
      normalCount,
      insights: insights.sort((a, b) => {
        const priorityOrder = {
          [InsightPriority.URGENT]: 0,
          [InsightPriority.HIGH]: 1,
          [InsightPriority.MEDIUM]: 2,
          [InsightPriority.LOW]: 3,
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),
      lastAnalyzedAt: new Date(),
    };
  }

  private analyzeBiomarker(biomarker: any): HealthInsightDto | null {
    const testNameLower = biomarker.testName.toLowerCase();
    const rules = this.biomarkerRules[testNameLower];

    if (!rules) {
      return null;
    }

    const value = parseFloat(biomarker.value);
    if (isNaN(value)) {
      return null;
    }

    let type: InsightType = InsightType.NORMAL;
    let priority: InsightPriority = InsightPriority.LOW;
    let message: string;
    let recommendation: string;

    if (rules.optimalLow !== undefined && value < rules.optimalLow) {
      type = InsightType.LOW;
      priority = InsightPriority.MEDIUM;
      if (value < rules.optimalLow * 0.7) {
        type = InsightType.CRITICAL;
        priority = InsightPriority.URGENT;
      }
      message = `Your ${biomarker.testName} is below the optimal range at ${biomarker.value} ${rules.unit}.`;
      recommendation = rules.recommendations.low || 'Consult your healthcare provider.';
    } else if (rules.optimalHigh !== undefined && value > rules.optimalHigh) {
      type = InsightType.HIGH;
      priority = InsightPriority.MEDIUM;
      if (value > rules.optimalHigh * 1.5) {
        type = InsightType.CRITICAL;
        priority = InsightPriority.URGENT;
      }
      message = `Your ${biomarker.testName} is above the optimal range at ${biomarker.value} ${rules.unit}.`;
      recommendation = rules.recommendations.high || 'Consult your healthcare provider.';
    } else {
      type = InsightType.NORMAL;
      priority = InsightPriority.LOW;
      message = `Your ${biomarker.testName} is within the healthy range at ${biomarker.value} ${rules.unit}.`;
      recommendation =
        rules.recommendations.normal || 'Continue your healthy habits.';
    }

    return {
      id: biomarker.id,
      biomarkerId: biomarker.id,
      testName: biomarker.testName,
      currentValue: biomarker.value,
      type,
      priority,
      message,
      recommendation,
      createdAt: biomarker.createdAt,
    };
  }

  async getBiomarkerTrends(
    testName: string,
    userId: string,
    systemId: string,
  ): Promise<any[]> {
    const biomarkers = await this.prisma.biomarker.findMany({
      where: {
        testName: {
          equals: testName,
          mode: 'insensitive',
        },
        labResult: {
          userId,
          systemId,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        labResult: {
          select: {
            uploadedAt: true,
          },
        },
      },
    });

    return biomarkers.map((b) => ({
      value: b.value,
      unit: b.unit,
      date: b.labResult.uploadedAt,
      testName: b.testName,
    }));
  }
}
