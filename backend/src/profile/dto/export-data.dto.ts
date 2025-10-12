import { IsEnum, IsOptional } from 'class-validator';

export enum ExportType {
  ALL = 'all',
  LAB_RESULTS = 'lab_results',
  ACTION_PLANS = 'action_plans',
  HEALTH_INSIGHTS = 'health_insights',
  PROFILE = 'profile',
}

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
}

export class ExportDataDto {
  @IsEnum(ExportType)
  @IsOptional()
  type?: ExportType = ExportType.ALL;

  @IsEnum(ExportFormat)
  @IsOptional()
  format?: ExportFormat = ExportFormat.JSON;
}

