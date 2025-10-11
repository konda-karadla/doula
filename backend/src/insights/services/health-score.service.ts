import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CategoryScore {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
}

export interface HealthScoreResult {
  overall: number;
  overallStatus: 'excellent' | 'good' | 'fair' | 'poor';
  categories: {
    metabolic?: CategoryScore;
    cardiovascular?: CategoryScore;
    reproductive?: CategoryScore;
    nutritional?: CategoryScore;
    hormonal?: CategoryScore;
  };
  totalBiomarkers: number;
  criticalCount: number;
  normalCount: number;
  lastUpdated: Date;
  trend?: 'improving' | 'stable' | 'declining';
}

@Injectable()
export class HealthScoreService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate comprehensive health score for a user
   */
  async calculateHealthScore(
    userId: string,
    systemId: string,
  ): Promise<HealthScoreResult> {
    // Get all lab results for user
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
    });

    if (labResults.length === 0) {
      return this.getDefaultScore();
    }

    // Get all biomarkers
    const allBiomarkers = labResults.flatMap((lr) => lr.biomarkers);

    if (allBiomarkers.length === 0) {
      return this.getDefaultScore();
    }

    // Calculate scores
    const categoryScores = this.calculateCategoryScores(allBiomarkers);
    const overallScore = this.calculateOverallScore(categoryScores);
    const criticalCount = this.countCriticalBiomarkers(allBiomarkers);
    const normalCount = this.countNormalBiomarkers(allBiomarkers);

    // Calculate trend if we have historical data
    const trend = await this.calculateTrend(userId, systemId);

    return {
      overall: overallScore,
      overallStatus: this.getScoreStatus(overallScore),
      categories: categoryScores,
      totalBiomarkers: allBiomarkers.length,
      criticalCount,
      normalCount,
      lastUpdated: labResults[0].uploadedAt,
      trend,
    };
  }

  /**
   * Calculate scores for each health category
   */
  private calculateCategoryScores(biomarkers: any[]): HealthScoreResult['categories'] {
    const categories: HealthScoreResult['categories'] = {};

    // Metabolic category (glucose, HbA1c, lipids)
    const metabolicMarkers = biomarkers.filter((b) =>
      this.isMetabolicMarker(b.testName),
    );
    if (metabolicMarkers.length > 0) {
      categories.metabolic = this.scoreCategoryMarkers(
        metabolicMarkers,
        'metabolic',
      );
    }

    // Cardiovascular category
    const cardiovascularMarkers = biomarkers.filter((b) =>
      this.isCardiovascularMarker(b.testName),
    );
    if (cardiovascularMarkers.length > 0) {
      categories.cardiovascular = this.scoreCategoryMarkers(
        cardiovascularMarkers,
        'cardiovascular',
      );
    }

    // Reproductive category
    const reproductiveMarkers = biomarkers.filter((b) =>
      this.isReproductiveMarker(b.testName),
    );
    if (reproductiveMarkers.length > 0) {
      categories.reproductive = this.scoreCategoryMarkers(
        reproductiveMarkers,
        'reproductive',
      );
    }

    // Nutritional category (vitamins, minerals)
    const nutritionalMarkers = biomarkers.filter((b) =>
      this.isNutritionalMarker(b.testName),
    );
    if (nutritionalMarkers.length > 0) {
      categories.nutritional = this.scoreCategoryMarkers(
        nutritionalMarkers,
        'nutritional',
      );
    }

    // Hormonal category
    const hormonalMarkers = biomarkers.filter((b) =>
      this.isHormonalMarker(b.testName),
    );
    if (hormonalMarkers.length > 0) {
      categories.hormonal = this.scoreCategoryMarkers(
        hormonalMarkers,
        'hormonal',
      );
    }

    return categories;
  }

  /**
   * Score a group of biomarkers
   */
  private scoreCategoryMarkers(
    markers: any[],
    categoryName: string,
  ): CategoryScore {
    let score = 100;
    let criticalIssues = 0;
    let moderateIssues = 0;

    markers.forEach((marker) => {
      const status = this.getBiomarkerStatus(marker);

      if (status === 'critical') {
        score -= 20;
        criticalIssues++;
      } else if (status === 'abnormal') {
        score -= 10;
        moderateIssues++;
      } else if (status === 'borderline') {
        score -= 5;
      }
      // Normal markers don't reduce score
    });

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      score,
      status: this.getScoreStatus(score),
      message: this.getCategoryMessage(
        score,
        criticalIssues,
        moderateIssues,
        categoryName,
      ),
    };
  }

  /**
   * Determine biomarker status based on reference ranges
   */
  private getBiomarkerStatus(
    biomarker: any,
  ): 'normal' | 'borderline' | 'abnormal' | 'critical' {
    const value = parseFloat(biomarker.value);
    const low = biomarker.referenceRangeLow
      ? parseFloat(biomarker.referenceRangeLow)
      : null;
    const high = biomarker.referenceRangeHigh
      ? parseFloat(biomarker.referenceRangeHigh)
      : null;

    if (isNaN(value)) {
      return 'normal'; // Can't determine, assume normal
    }

    // If we have ranges, check them
    if (low !== null && high !== null) {
      const range = high - low;
      const borderlineThreshold = range * 0.1; // 10% outside range is borderline

      if (value < low) {
        const diff = low - value;
        if (diff > range * 0.5) return 'critical'; // 50% below
        if (diff > borderlineThreshold) return 'abnormal';
        return 'borderline';
      }

      if (value > high) {
        const diff = value - high;
        if (diff > range * 0.5) return 'critical'; // 50% above
        if (diff > borderlineThreshold) return 'abnormal';
        return 'borderline';
      }

      return 'normal';
    }

    // No range data, assume normal
    return 'normal';
  }

  /**
   * Calculate overall score from category scores
   */
  private calculateOverallScore(
    categories: HealthScoreResult['categories'],
  ): number {
    const scores = Object.values(categories).map((c) => c.score);

    if (scores.length === 0) return 100;

    // Weighted average (can be adjusted)
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / scores.length);
  }

  /**
   * Get status label from score
   */
  private getScoreStatus(
    score: number,
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  /**
   * Generate message for category score
   */
  private getCategoryMessage(
    score: number,
    criticalIssues: number,
    moderateIssues: number,
    categoryName: string,
  ): string {
    if (score >= 85) {
      return `Your ${categoryName} health is excellent!`;
    }
    if (score >= 70) {
      return `Your ${categoryName} health is good with minor areas to address.`;
    }
    if (criticalIssues > 0) {
      return `${criticalIssues} critical marker(s) need immediate attention.`;
    }
    if (moderateIssues > 0) {
      return `${moderateIssues} marker(s) are outside optimal range.`;
    }
    return `Your ${categoryName} health needs improvement.`;
  }

  /**
   * Count critical biomarkers
   */
  private countCriticalBiomarkers(biomarkers: any[]): number {
    return biomarkers.filter(
      (b) => this.getBiomarkerStatus(b) === 'critical',
    ).length;
  }

  /**
   * Count normal biomarkers
   */
  private countNormalBiomarkers(biomarkers: any[]): number {
    return biomarkers.filter((b) => this.getBiomarkerStatus(b) === 'normal')
      .length;
  }

  /**
   * Calculate trend (improving/stable/declining)
   */
  private async calculateTrend(
    userId: string,
    systemId: string,
  ): Promise<'improving' | 'stable' | 'declining' | undefined> {
    // Get last 2 lab results to compare
    const recentResults = await this.prisma.labResult.findMany({
      where: { userId, systemId },
      include: { biomarkers: true },
      orderBy: { uploadedAt: 'desc' },
      take: 2,
    });

    if (recentResults.length < 2) {
      return undefined; // Not enough data
    }

    const [latest, previous] = recentResults;

    // Calculate scores for both
    const latestBiomarkers = latest.biomarkers;
    const previousBiomarkers = previous.biomarkers;

    const latestScore = this.calculateOverallScore(
      this.calculateCategoryScores(latestBiomarkers),
    );
    const previousScore = this.calculateOverallScore(
      this.calculateCategoryScores(previousBiomarkers),
    );

    const diff = latestScore - previousScore;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  /**
   * Default score for users with no data
   */
  private getDefaultScore(): HealthScoreResult {
    return {
      overall: 0,
      overallStatus: 'poor',
      categories: {},
      totalBiomarkers: 0,
      criticalCount: 0,
      normalCount: 0,
      lastUpdated: new Date(),
    };
  }

  // Category classification helpers
  private isMetabolicMarker(testName: string): boolean {
    const keywords = ['glucose', 'hba1c', 'insulin', 'cholesterol', 'triglyceride', 'ldl', 'hdl'];
    return keywords.some((kw) => testName.toLowerCase().includes(kw));
  }

  private isCardiovascularMarker(testName: string): boolean {
    const keywords = ['cholesterol', 'ldl', 'hdl', 'triglyceride', 'crp', 'homocysteine'];
    return keywords.some((kw) => testName.toLowerCase().includes(kw));
  }

  private isReproductiveMarker(testName: string): boolean {
    const keywords = ['testosterone', 'estrogen', 'progesterone', 'fsh', 'lh', 'amh', 'prolactin'];
    return keywords.some((kw) => testName.toLowerCase().includes(kw));
  }

  private isNutritionalMarker(testName: string): boolean {
    const keywords = ['vitamin', 'iron', 'ferritin', 'b12', 'folate', 'calcium', 'magnesium', 'zinc'];
    return keywords.some((kw) => testName.toLowerCase().includes(kw));
  }

  private isHormonalMarker(testName: string): boolean {
    const keywords = ['thyroid', 'tsh', 't3', 't4', 'cortisol', 'dhea', 'testosterone', 'estrogen'];
    return keywords.some((kw) => testName.toLowerCase().includes(kw));
  }
}

