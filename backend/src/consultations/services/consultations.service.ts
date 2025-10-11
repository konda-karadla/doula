import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookConsultationDto, UpdateConsultationDto, RescheduleConsultationDto } from '../dto';
import { ConsultationStatus } from '@prisma/client';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  async book(userId: string, bookConsultationDto: BookConsultationDto) {
    const { doctorId, scheduledAt, duration = 30, type } = bookConsultationDto;

    // Verify doctor exists and is active
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { availabilitySlots: { where: { isActive: true } } },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!doctor.isActive) {
      throw new BadRequestException('Doctor is not accepting consultations');
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    // Check for conflicts (doctor already has a consultation at this time)
    const endTime = new Date(scheduledDate.getTime() + duration * 60000);
    const conflictingConsultation = await this.prisma.consultation.findFirst({
      where: {
        doctorId,
        scheduledAt: {
          gte: new Date(scheduledDate.getTime() - 2 * 60 * 60000), // 2 hours before
          lte: new Date(scheduledDate.getTime() + 2 * 60 * 60000), // 2 hours after
        },
        status: {
          in: [ConsultationStatus.SCHEDULED, ConsultationStatus.CONFIRMED, ConsultationStatus.IN_PROGRESS],
        },
      },
    });

    if (conflictingConsultation) {
      throw new BadRequestException('Doctor is not available at this time');
    }

    // Check if the time falls within doctor's availability
    const dayOfWeek = scheduledDate.getDay();
    const timeString = `${scheduledDate.getHours().toString().padStart(2, '0')}:${scheduledDate.getMinutes().toString().padStart(2, '0')}`;
    
    const isWithinAvailability = doctor.availabilitySlots.some((slot) => {
      return slot.dayOfWeek === dayOfWeek && slot.startTime <= timeString && slot.endTime >= timeString;
    });

    if (!isWithinAvailability) {
      throw new BadRequestException('Selected time is outside doctor availability hours');
    }

    // Create consultation
    return this.prisma.consultation.create({
      data: {
        userId,
        doctorId,
        scheduledAt: scheduledDate,
        duration,
        type,
        fee: doctor.consultationFee,
        status: ConsultationStatus.SCHEDULED,
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            imageUrl: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.consultation.findMany({
      where: { userId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });
  }

  async findAllForAdmin(systemId: string) {
    return this.prisma.consultation.findMany({
      where: {
        doctor: {
          systemId,
        },
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId?: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            bio: true,
            qualifications: true,
            experience: true,
            imageUrl: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profileType: true,
            journeyType: true,
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    // If userId provided, verify ownership
    if (userId && consultation.userId !== userId) {
      throw new ForbiddenException('You do not have access to this consultation');
    }

    return consultation;
  }

  async reschedule(id: string, userId: string, rescheduleDto: RescheduleConsultationDto) {
    const consultation = await this.findOne(id, userId);

    // Only allow rescheduling scheduled or confirmed consultations
    const allowedStatuses = [ConsultationStatus.SCHEDULED, ConsultationStatus.CONFIRMED];
    if (!allowedStatuses.includes(consultation.status as any)) {
      throw new BadRequestException('Cannot reschedule consultation in current status');
    }

    // Validate new time is in the future
    const newScheduledDate = new Date(rescheduleDto.scheduledAt);
    if (newScheduledDate <= new Date()) {
      throw new BadRequestException('New scheduled time must be in the future');
    }

    // Check for conflicts at new time
    const endTime = new Date(newScheduledDate.getTime() + consultation.duration * 60000);
    const conflictingConsultation = await this.prisma.consultation.findFirst({
      where: {
        doctorId: consultation.doctorId,
        id: { not: id },
        scheduledAt: {
          gte: new Date(newScheduledDate.getTime() - 2 * 60 * 60000),
          lte: new Date(newScheduledDate.getTime() + 2 * 60 * 60000),
        },
        status: {
          in: [ConsultationStatus.SCHEDULED, ConsultationStatus.CONFIRMED, ConsultationStatus.IN_PROGRESS],
        },
      },
    });

    if (conflictingConsultation) {
      throw new BadRequestException('Doctor is not available at the new time');
    }

    return this.prisma.consultation.update({
      where: { id },
      data: {
        scheduledAt: newScheduledDate,
        status: ConsultationStatus.SCHEDULED, // Reset to scheduled
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async cancel(id: string, userId: string) {
    const consultation = await this.findOne(id, userId);

    if (consultation.status === ConsultationStatus.CANCELLED) {
      throw new BadRequestException('Consultation is already cancelled');
    }

    if (consultation.status === ConsultationStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed consultation');
    }

    return this.prisma.consultation.update({
      where: { id },
      data: {
        status: ConsultationStatus.CANCELLED,
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, updateDto: UpdateConsultationDto) {
    const consultation = await this.findOne(id);

    return this.prisma.consultation.update({
      where: { id },
      data: updateDto,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async getAvailableSlots(doctorId: string, date: string) {
    // Get doctor's availability
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        availabilitySlots: {
          where: { isActive: true },
        },
      },
    });

    if (!doctor || !doctor.isActive) {
      throw new NotFoundException('Doctor not found or inactive');
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Get availability for that day
    const dayAvailability = doctor.availabilitySlots.filter((slot) => slot.dayOfWeek === dayOfWeek);

    if (dayAvailability.length === 0) {
      return [];
    }

    // Get existing consultations for that day
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingConsultations = await this.prisma.consultation.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: [ConsultationStatus.SCHEDULED, ConsultationStatus.CONFIRMED, ConsultationStatus.IN_PROGRESS],
        },
      },
      select: {
        scheduledAt: true,
        duration: true,
      },
    });

    // Generate available time slots (30-minute intervals)
    const availableSlots: string[] = [];

    for (const availability of dayAvailability) {
      const [startHour, startMinute] = availability.startTime.split(':').map(Number);
      const [endHour, endMinute] = availability.endTime.split(':').map(Number);

      let currentTime = new Date(requestedDate);
      currentTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(requestedDate);
      endTime.setHours(endHour, endMinute, 0, 0);

      while (currentTime < endTime) {
        // Check if this slot conflicts with existing consultations
        const slotTime = new Date(currentTime);
        const hasConflict = existingConsultations.some((consultation) => {
          const consultationStart = new Date(consultation.scheduledAt);
          const consultationEnd = new Date(consultationStart.getTime() + consultation.duration * 60000);
          return slotTime >= consultationStart && slotTime < consultationEnd;
        });

        // Only add if no conflict and time is in the future
        if (!hasConflict && currentTime > new Date()) {
          availableSlots.push(currentTime.toISOString());
        }

        // Move to next 30-minute slot
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
    }

    return availableSlots;
  }
}

