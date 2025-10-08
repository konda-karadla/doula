import { IsString, IsObject, IsOptional } from 'class-validator';

export class SystemConfigDto {
  @IsObject()
  general: {
    platformName: string;
    supportEmail: string;
    maxFileSize: string;
    sessionTimeout: string;
  };

  @IsObject()
  features: {
    userRegistration: boolean;
    labUpload: boolean;
    actionPlans: boolean;
    notifications: boolean;
    analytics: boolean;
    darkMode: boolean;
  };

  @IsObject()
  systems: {
    doula: SystemInfo;
    functional_health: SystemInfo;
    elderly_care: SystemInfo;
  };
}

export class SystemInfo {
  enabled: boolean;
  name: string;
  description: string;
  primaryColor: string;
}

export class UpdateSystemConfigDto {
  @IsObject()
  @IsOptional()
  general?: {
    platformName?: string;
    supportEmail?: string;
    maxFileSize?: string;
    sessionTimeout?: string;
  };

  @IsObject()
  @IsOptional()
  features?: {
    userRegistration?: boolean;
    labUpload?: boolean;
    actionPlans?: boolean;
    notifications?: boolean;
    analytics?: boolean;
    darkMode?: boolean;
  };

  @IsObject()
  @IsOptional()
  systems?: {
    doula?: SystemInfo;
    functional_health?: SystemInfo;
    elderly_care?: SystemInfo;
  };
}

