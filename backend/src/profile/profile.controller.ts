import { Controller, Get, Patch, Body, Query, UseGuards, StreamableFile, Header } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantIsolationGuard } from '../common/guards/tenant-isolation.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserProfileDto } from './dto/user-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { HealthStatsDto } from './dto/health-stats.dto';
import { ExportType, ExportFormat } from './dto/export-data.dto';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile details',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@CurrentUser() user: any): Promise<UserProfileDto> {
    return this.profileService.getProfile(user.userId, user.systemId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user health statistics' })
  @ApiResponse({
    status: 200,
    description: 'Health statistics and activity summary',
    type: HealthStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getHealthStats(@CurrentUser() user: any): Promise<HealthStatsDto> {
    return this.profileService.getHealthStats(user.userId, user.systemId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Updated profile', type: UserProfileDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() body: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.profileService.updateProfile(user.userId, user.systemId, body);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export user data in JSON or CSV format' })
  @ApiResponse({ status: 200, description: 'User data export' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Header('Content-Type', 'application/octet-stream')
  async exportData(
    @CurrentUser() user: any,
    @Query('type') type: ExportType = ExportType.ALL,
    @Query('format') format: ExportFormat = ExportFormat.JSON,
  ): Promise<StreamableFile> {
    const { data, filename, contentType } = await this.profileService.exportUserData(
      user.userId,
      user.systemId,
      type,
      format,
    );
    
    return new StreamableFile(Buffer.from(data), {
      type: contentType,
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
