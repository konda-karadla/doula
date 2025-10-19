import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantIsolationGuard } from '../common/guards/tenant-isolation.guard';
import { TenantIsolation } from '../common/decorators/tenant-isolation.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { LabsService } from './labs.service';
import { LabResultDto } from './dto/lab-result.dto';
import { BiomarkerDto } from './dto/biomarker.dto';

@ApiTags('labs')
@ApiBearerAuth()
@Controller('labs')
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
@TenantIsolation()
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload lab result PDF for OCR processing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        notes: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadLab(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('notes') notes: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<LabResultDto> {
    return this.labsService.uploadLab(file, user.userId, user.systemId, notes);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lab results for current user' })
  async getLabResults(
    @CurrentUser() user: CurrentUserData,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ): Promise<LabResultDto[]> {
    return this.labsService.getLabResults(user.userId, user.systemId, { search, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific lab result by ID' })
  async getLabResult(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<LabResultDto> {
    return this.labsService.getLabResult(id, user.userId, user.systemId);
  }

  @Get(':id/biomarkers')
  @ApiOperation({ summary: 'Get parsed biomarkers from lab result' })
  async getBiomarkers(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<BiomarkerDto[]> {
    return this.labsService.getBiomarkers(id, user.userId, user.systemId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lab result and associated biomarkers' })
  async deleteLabResult(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    await this.labsService.deleteLabResult(id, user.userId, user.systemId);
    return { message: 'Lab result deleted successfully' };
  }
}
