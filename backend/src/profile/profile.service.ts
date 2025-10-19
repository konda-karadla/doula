import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { HealthStatsDto } from './dto/health-stats.dto';
import { ExportType, ExportFormat } from './dto/export-data.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.mapUserToDto(user);
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

  async updateProfile(
    userId: string,
    systemId: string,
    update: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    console.log('[ProfileService.updateProfile] Update request:', { userId, systemId, update });
    
    const existing = await this.prisma.user.findFirst({
      where: { id: userId, systemId },
    });

    if (!existing) {
      throw new NotFoundException('User profile not found');
    }

    const updateData = this.buildUpdateData(update);
    console.log('[ProfileService.updateProfile] Updating with data:', updateData);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    console.log('[ProfileService.updateProfile] Update successful:', { id: user.id, email: user.email });

    return this.mapUserToDto(user);
  }

  private buildUpdateData(update: UpdateProfileDto): any {
    const updateData: any = {};
    
    if (typeof update.email === 'string' && update.email.trim() !== '') {
      updateData.email = update.email.trim();
    }
    
    if (typeof update.profileType === 'string' && update.profileType.trim() !== '') {
      updateData.profileType = update.profileType.trim();
    }
    
    if (typeof update.journeyType === 'string' && update.journeyType.trim() !== '') {
      updateData.journeyType = update.journeyType.trim();
    }
    
    if (update.preferences) {
      updateData.preferences = update.preferences;
    }

    // Additional profile fields
    if (update.firstName !== undefined) {
      updateData.firstName = update.firstName;
    }
    if (update.lastName !== undefined) {
      updateData.lastName = update.lastName;
    }
    if (update.phoneNumber !== undefined) {
      updateData.phoneNumber = update.phoneNumber;
    }
    if (update.dateOfBirth !== undefined) {
      updateData.dateOfBirth = update.dateOfBirth ? new Date(update.dateOfBirth) : null;
    }
    if (update.healthGoals !== undefined) {
      updateData.healthGoals = update.healthGoals;
    }
    if (update.emergencyContactName !== undefined) {
      updateData.emergencyContactName = update.emergencyContactName;
    }
    if (update.emergencyContactPhone !== undefined) {
      updateData.emergencyContactPhone = update.emergencyContactPhone;
    }

    return updateData;
  }

  private mapUserToDto(user: any): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      profileType: user.profileType,
      journeyType: user.journeyType,
      systemId: user.systemId,
      preferences: user.preferences as Record<string, any>,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      phoneNumber: user.phoneNumber ?? undefined,
      dateOfBirth: user.dateOfBirth?.toISOString(),
      healthGoals: user.healthGoals,
      emergencyContactName: user.emergencyContactName ?? undefined,
      emergencyContactPhone: user.emergencyContactPhone ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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

      if (
        (rules.optimalLow && value < rules.optimalLow * 0.7) ||
        (rules.optimalHigh && value > rules.optimalHigh * 1.5)
      ) {
        criticalCount++;
      }
    }

    return criticalCount;
  }

  async exportUserData(
    userId: string,
    systemId: string,
    type: ExportType,
    format: ExportFormat,
  ): Promise<{ data: string; filename: string; contentType: string }> {
    const exportData = await this.gatherExportData(userId, systemId, type);
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === ExportFormat.JSON) {
      return {
        data: JSON.stringify(exportData, null, 2),
        filename: `health-data-${type}-${timestamp}.json`,
        contentType: 'application/json',
      };
    } else if (format === ExportFormat.CSV) {
      const csv = this.convertToCSV(exportData, type);
      return {
        data: csv,
        filename: `health-data-${type}-${timestamp}.csv`,
        contentType: 'text/csv',
      };
    }
    
    throw new Error('Unsupported export format');
  }

  private async gatherExportData(
    userId: string,
    systemId: string,
    type: ExportType,
  ): Promise<any> {
    const exportData: any = {
      exportedAt: new Date().toISOString(),
      exportType: type,
    };

    switch (type) {
      case ExportType.ALL:
        exportData.profile = await this.getProfileData(userId, systemId);
        exportData.labResults = await this.getLabResultsData(userId, systemId);
        exportData.actionPlans = await this.getActionPlansData(userId, systemId);
        exportData.healthStats = await this.getHealthStats(userId, systemId);
        break;

      case ExportType.PROFILE:
        exportData.profile = await this.getProfileData(userId, systemId);
        break;

      case ExportType.LAB_RESULTS:
        exportData.labResults = await this.getLabResultsData(userId, systemId);
        break;

      case ExportType.ACTION_PLANS:
        exportData.actionPlans = await this.getActionPlansData(userId, systemId);
        break;

      case ExportType.HEALTH_INSIGHTS:
        exportData.healthInsights = await this.getHealthInsightsData(userId, systemId);
        break;

      default:
        throw new Error('Invalid export type');
    }

    return exportData;
  }

  private async getProfileData(userId: string, systemId: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, systemId },
      select: {
        id: true,
        email: true,
        username: true,
        profileType: true,
        journeyType: true,
        preferences: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        dateOfBirth: true,
        healthGoals: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async getLabResultsData(userId: string, systemId: string): Promise<any> {
    const labResults = await this.prisma.labResult.findMany({
      where: { userId, systemId },
      include: {
        biomarkers: {
          select: {
            id: true,
            testName: true,
            value: true,
            unit: true,
            referenceRangeLow: true,
            referenceRangeHigh: true,
            testDate: true,
            notes: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return labResults;
  }

  private async getActionPlansData(userId: string, systemId: string): Promise<any> {
    const actionPlans = await this.prisma.actionPlan.findMany({
      where: { userId, systemId },
      include: {
        actionItems: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            dueDate: true,
            completedAt: true,
            priority: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return actionPlans;
  }

  private async getHealthInsightsData(userId: string, systemId: string): Promise<any> {
    // Get the latest lab result with biomarkers for insights
    const latestLabResult = await this.prisma.labResult.findFirst({
      where: { userId, systemId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        biomarkers: true,
      },
    });

    if (!latestLabResult) {
      return { message: 'No lab results available for insights' };
    }

    const insights = [];
    const biomarkerRules: Record<string, { optimalLow?: number; optimalHigh?: number }> = {
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

    for (const biomarker of latestLabResult.biomarkers) {
      const testNameLower = biomarker.testName.toLowerCase();
      const rules = biomarkerRules[testNameLower];

      if (!rules) continue;

      const value = parseFloat(biomarker.value);
      if (isNaN(value)) continue;

      let status = 'normal';
      let message = '';

      if (rules.optimalLow && value < rules.optimalLow) {
        status = 'low';
        message = `${biomarker.testName} is below optimal range`;
      } else if (rules.optimalHigh && value > rules.optimalHigh) {
        status = 'high';
        message = `${biomarker.testName} is above optimal range`;
      }

      if (status !== 'normal') {
        insights.push({
          testName: biomarker.testName,
          value: biomarker.value,
          unit: biomarker.unit,
          status,
          message,
          testDate: biomarker.testDate,
        });
      }
    }

    return {
      latestLabResultId: latestLabResult.id,
      uploadedAt: latestLabResult.uploadedAt,
      insights,
    };
  }

  private convertToCSV(data: any, type: ExportType): string {
    let csv = '';

    switch (type) {
      case ExportType.PROFILE:
        csv = this.profileToCSV(data.profile);
        break;

      case ExportType.LAB_RESULTS:
        csv = this.labResultsToCSV(data.labResults);
        break;

      case ExportType.ACTION_PLANS:
        csv = this.actionPlansToCSV(data.actionPlans);
        break;

      case ExportType.HEALTH_INSIGHTS:
        csv = this.healthInsightsToCSV(data.healthInsights);
        break;

      case ExportType.ALL:
        // For "all", create multiple CSV sections
        csv += '=== PROFILE ===\n';
        csv += this.profileToCSV(data.profile) + '\n\n';
        csv += '=== LAB RESULTS ===\n';
        csv += this.labResultsToCSV(data.labResults) + '\n\n';
        csv += '=== ACTION PLANS ===\n';
        csv += this.actionPlansToCSV(data.actionPlans);
        break;

      default:
        throw new Error('Invalid export type for CSV');
    }

    return csv;
  }

  private profileToCSV(profile: any): string {
    const headers = ['Field', 'Value'];
    const rows = [
      ['ID', profile.id],
      ['Email', profile.email],
      ['Username', profile.username],
      ['Profile Type', profile.profileType],
      ['Journey Type', profile.journeyType],
      ['First Name', profile.firstName || ''],
      ['Last Name', profile.lastName || ''],
      ['Phone Number', profile.phoneNumber || ''],
      ['Date of Birth', profile.dateOfBirth || ''],
      ['Health Goals', Array.isArray(profile.healthGoals) ? profile.healthGoals.join('; ') : ''],
      ['Emergency Contact Name', profile.emergencyContactName || ''],
      ['Emergency Contact Phone', profile.emergencyContactPhone || ''],
      ['Created At', profile.createdAt],
      ['Updated At', profile.updatedAt],
    ];

    return [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
  }

  private labResultsToCSV(labResults: any[]): string {
    if (!labResults || labResults.length === 0) {
      return 'No lab results available';
    }

    const headers = ['Lab Result ID', 'File Name', 'Uploaded At', 'Status', 'Test Name', 'Value', 'Unit', 'Ref Low', 'Ref High', 'Test Date'];
    const rows = [];

    for (const lab of labResults) {
      for (const biomarker of lab.biomarkers || []) {
        rows.push([
          lab.id,
          lab.fileName,
          lab.uploadedAt,
          lab.processingStatus,
          biomarker.testName,
          biomarker.value,
          biomarker.unit || '',
          biomarker.referenceRangeLow || '',
          biomarker.referenceRangeHigh || '',
          biomarker.testDate || '',
        ]);
      }
    }

    return [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
  }

  private actionPlansToCSV(actionPlans: any[]): string {
    if (!actionPlans || actionPlans.length === 0) {
      return 'No action plans available';
    }

    const headers = ['Plan ID', 'Plan Title', 'Plan Description', 'Plan Status', 'Item Title', 'Item Status', 'Due Date', 'Completed At', 'Priority'];
    const rows = [];

    for (const plan of actionPlans) {
      for (const item of plan.actionItems || []) {
        rows.push([
          plan.id,
          plan.title,
          plan.description || '',
          plan.status,
          item.title,
          item.status,
          item.dueDate || '',
          item.completedAt || '',
          item.priority,
        ]);
      }
    }

    return [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
  }

  private healthInsightsToCSV(insights: any): string {
    if (!insights?.insights || insights.insights.length === 0) {
      return 'No health insights available';
    }

    const headers = ['Test Name', 'Value', 'Unit', 'Status', 'Message', 'Test Date'];
    const rows = insights.insights.map((insight: any) => [
      insight.testName,
      insight.value,
      insight.unit || '',
      insight.status,
      insight.message,
      insight.testDate || '',
    ]);

    return [headers.join(','), ...rows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
  }
}
