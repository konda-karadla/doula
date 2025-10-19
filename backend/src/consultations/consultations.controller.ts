import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConsultationsService, DoctorsService } from './services';
import { BookConsultationDto, RescheduleConsultationDto } from './dto';

@ApiTags('Consultations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('consultations')
export class ConsultationsController {
  constructor(
    private readonly consultationsService: ConsultationsService,
    private readonly doctorsService: DoctorsService,
  ) {}

  // User endpoints

  @Get('doctors')
  @ApiOperation({ summary: 'Get list of available doctors' })
  @ApiResponse({ status: 200, description: 'List of doctors' })
  async getDoctors(@Request() req: any) {
    return this.doctorsService.findAll(req.user.systemId, false); // Only active doctors
  }

  @Get('doctors/:id')
  @ApiOperation({ summary: 'Get doctor details' })
  @ApiResponse({ status: 200, description: 'Doctor details' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async getDoctor(@Param('id') id: string, @Request() req: any) {
    return this.doctorsService.findOne(id, req.user.systemId);
  }

  @Get('doctors/:id/availability')
  @ApiOperation({ summary: 'Get doctor availability slots for a specific date' })
  @ApiQuery({ name: 'date', description: 'Date in ISO format (YYYY-MM-DD)', example: '2025-10-15' })
  @ApiResponse({ status: 200, description: 'Available time slots' })
  async getAvailability(@Param('id') id: string, @Query('date') date: string) {
    return this.consultationsService.getAvailableSlots(id, date);
  }

  @Post('book')
  @ApiOperation({ summary: 'Book a consultation' })
  @ApiResponse({ status: 201, description: 'Consultation booked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request (e.g., time conflict, invalid time)' })
  async bookConsultation(@Body() bookDto: BookConsultationDto, @Request() req: any) {
    return this.consultationsService.book(req.user.sub, bookDto);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get user consultations' })
  @ApiResponse({ status: 200, description: 'List of user consultations' })
  async getMyBookings(@Request() req: any) {
    return this.consultationsService.findAllForUser(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consultation details' })
  @ApiResponse({ status: 200, description: 'Consultation details' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getConsultation(@Param('id') id: string, @Request() req: any) {
    return this.consultationsService.findOne(id, req.user.sub);
  }

  @Put(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule a consultation' })
  @ApiResponse({ status: 200, description: 'Consultation rescheduled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reschedule (invalid status or time)' })
  async rescheduleConsultation(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleConsultationDto,
    @Request() req: any,
  ) {
    return this.consultationsService.reschedule(id, req.user.sub, rescheduleDto);
  }

  @Delete(':id/cancel')
  @ApiOperation({ summary: 'Cancel a consultation' })
  @ApiResponse({ status: 200, description: 'Consultation cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel (already completed/cancelled)' })
  async cancelConsultation(@Param('id') id: string, @Request() req: any) {
    return this.consultationsService.cancel(id, req.user.sub);
  }
}

