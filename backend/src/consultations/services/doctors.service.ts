import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDoctorDto, UpdateDoctorDto, CreateAvailabilityDto } from '../dto';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async create(systemId: string, createDoctorDto: CreateDoctorDto) {
    return this.prisma.doctor.create({
      data: {
        ...createDoctorDto,
        systemId,
      },
      include: {
        availabilitySlots: true,
      },
    });
  }

  async findAll(systemId: string, includeInactive = false) {
    return this.prisma.doctor.findMany({
      where: {
        systemId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        availabilitySlots: {
          where: { isActive: true },
        },
        _count: {
          select: { consultations: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, systemId: string) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { id, systemId },
      include: {
        availabilitySlots: {
          where: { isActive: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        _count: {
          select: { consultations: true },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor;
  }

  async update(id: string, systemId: string, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.findOne(id, systemId);

    return this.prisma.doctor.update({
      where: { id: doctor.id },
      data: updateDoctorDto,
      include: {
        availabilitySlots: true,
      },
    });
  }

  async remove(id: string, systemId: string) {
    const doctor = await this.findOne(id, systemId);

    // Check for upcoming consultations
    const upcomingConsultations = await this.prisma.consultation.count({
      where: {
        doctorId: doctor.id,
        scheduledAt: {
          gte: new Date(),
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
    });

    if (upcomingConsultations > 0) {
      throw new BadRequestException(
        `Cannot delete doctor with ${upcomingConsultations} upcoming consultations. Please cancel or complete them first.`,
      );
    }

    return this.prisma.doctor.delete({
      where: { id: doctor.id },
    });
  }

  async toggle(id: string, systemId: string) {
    const doctor = await this.findOne(id, systemId);

    return this.prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        isActive: !doctor.isActive,
      },
    });
  }

  async setAvailability(doctorId: string, systemId: string, availability: CreateAvailabilityDto[]) {
    const doctor = await this.findOne(doctorId, systemId);

    // Validate time ranges
    for (const slot of availability) {
      if (slot.startTime >= slot.endTime) {
        throw new BadRequestException(`Invalid time range: ${slot.startTime} - ${slot.endTime}`);
      }
    }

    // Delete existing availability slots
    await this.prisma.availabilitySlot.deleteMany({
      where: { doctorId: doctor.id },
    });

    // Create new availability slots
    const slots = await this.prisma.availabilitySlot.createMany({
      data: availability.map((slot) => ({
        ...slot,
        doctorId: doctor.id,
      })),
    });

    return this.findOne(doctorId, systemId);
  }

  async getAvailability(doctorId: string, systemId: string) {
    await this.findOne(doctorId, systemId);

    return this.prisma.availabilitySlot.findMany({
      where: {
        doctorId,
        isActive: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }
}

