import { Module } from '@nestjs/common';
import { ActionPlansController } from './action-plans.controller';
import { ActionPlansService } from './action-plans.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActionPlansController],
  providers: [ActionPlansService],
  exports: [ActionPlansService],
})
export class ActionPlansModule {}
