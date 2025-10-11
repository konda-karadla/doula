import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ConsultationsService, DoctorsService } from './services';
import {
  CreateDoctorDto,
  UpdateDoctorDto,
  CreateAvailabilityDto,
  UpdateConsultationDto,
} from './dto';

@ApiTags('Admin - Consultations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/consultations')
export class AdminConsultationsController {
  constructor(
    private readonly consultationsService: ConsultationsService,
    private readonly doctorsService: DoctorsService,
  ) {}

  // Doctor Management

  @Post('doctors')
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiResponse({ status: 201, description: 'Doctor created successfully' })
  async createDoctor(@Body() createDoctorDto: CreateDoctorDto, @Request() req: any) {
    return this.doctorsService.create(req.user.systemId, createDoctorDto);
  }

  @Get('doctors')
  @ApiOperation({ summary: 'Get all doctors (including inactive)' })
  @ApiResponse({ status: 200, description: 'List of all doctors' })
  async getAllDoctors(@Request() req: any) {
    return this.doctorsService.findAll(req.user.systemId, true); // Include inactive
  }

  @Get('doctors/:id')
  @ApiOperation({ summary: 'Get doctor details' })
  @ApiResponse({ status: 200, description: 'Doctor details' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async getDoctor(@Param('id') id: string, @Request() req: any) {
    return this.doctorsService.findOne(id, req.user.systemId);
  }

  @Put('doctors/:id')
  @ApiOperation({ summary: 'Update doctor details' })
  @ApiResponse({ status: 200, description: 'Doctor updated successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async updateDoctor(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
    @Request() req: any,
  ) {
    return this.doctorsService.update(id, req.user.systemId, updateDoctorDto);
  }

  @Delete('doctors/:id')
  @ApiOperation({ summary: 'Delete doctor' })
  @ApiResponse({ status: 200, description: 'Doctor deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete doctor with upcoming consultations' })
  async deleteDoctor(@Param('id') id: string, @Request() req: any) {
    return this.doctorsService.remove(id, req.user.systemId);
  }

  @Put('doctors/:id/toggle')
  @ApiOperation({ summary: 'Activate/deactivate doctor' })
  @ApiResponse({ status: 200, description: 'Doctor status toggled' })
  async toggleDoctor(@Param('id') id: string, @Request() req: any) {
    return this.doctorsService.toggle(id, req.user.systemId);
  }

  @Post('doctors/:id/availability')
  @ApiOperation({ summary: 'Set doctor availability schedule' })
  @ApiResponse({ status: 200, description: 'Availability set successfully' })
  async setAvailability(
    @Param('id') id: string,
    @Body() availability: CreateAvailabilityDto[],
    @Request() req: any,
  ) {
    return this.doctorsService.setAvailability(id, req.user.systemId, availability);
  }

  // Consultation Management

  @Get()
  @ApiOperation({ summary: 'Get all consultations' })
  @ApiResponse({ status: 200, description: 'List of all consultations' })
  async getAllConsultations(@Request() req: any) {
    return this.consultationsService.findAllForAdmin(req.user.systemId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consultation details' })
  @ApiResponse({ status: 200, description: 'Consultation details' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async getConsultation(@Param('id') id: string) {
    return this.consultationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update consultation (status, notes, prescription)' })
  @ApiResponse({ status: 200, description: 'Consultation updated successfully' })
  async updateConsultation(
    @Param('id') id: string,
    @Body() updateDto: UpdateConsultationDto,
  ) {
    return this.consultationsService.updateStatus(id, updateDto);
  }
}

