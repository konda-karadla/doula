import { Module } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { AdminConsultationsController } from './admin-consultations.controller';
import { DoctorsService, ConsultationsService } from './services';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConsultationsController, AdminConsultationsController],
  providers: [DoctorsService, ConsultationsService],
  exports: [DoctorsService, ConsultationsService],
})
export class ConsultationsModule {}

