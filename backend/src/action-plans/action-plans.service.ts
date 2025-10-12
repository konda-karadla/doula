import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { UpdateActionItemDto } from './dto/update-action-item.dto';

@Injectable()
export class ActionPlansService {
  constructor(private prisma: PrismaService) {}

  async createActionPlan(
    userId: string,
    systemId: string,
    dto: CreateActionPlanDto,
  ) {
    return this.prisma.actionPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status || 'active',
        userId,
        systemId,
      },
      include: {
        actionItems: true,
      },
    });
  }

  async findAllActionPlans(userId: string, systemId: string) {
    return this.prisma.actionPlan.findMany({
      where: {
        userId,
        systemId,
      },
      include: {
        actionItems: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findActionPlanById(id: string, userId: string, systemId: string) {
    const actionPlan = await this.prisma.actionPlan.findFirst({
      where: {
        id,
        userId,
        systemId,
      },
      include: {
        actionItems: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!actionPlan) {
      throw new NotFoundException('Action plan not found');
    }

    return actionPlan;
  }

  async updateActionPlan(
    id: string,
    userId: string,
    systemId: string,
    dto: UpdateActionPlanDto,
  ) {
    await this.findActionPlanById(id, userId, systemId);

    return this.prisma.actionPlan.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
      },
      include: {
        actionItems: true,
      },
    });
  }

  async deleteActionPlan(id: string, userId: string, systemId: string) {
    await this.findActionPlanById(id, userId, systemId);

    await this.prisma.actionPlan.delete({
      where: { id },
    });

    return { message: 'Action plan deleted successfully' };
  }

  async createActionItem(
    actionPlanId: string,
    userId: string,
    systemId: string,
    dto: CreateActionItemDto,
  ) {
    await this.findActionPlanById(actionPlanId, userId, systemId);

    return this.prisma.actionItem.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        priority: dto.priority || 'medium',
        actionPlanId,
      },
    });
  }

  async findActionItemsByPlanId(
    actionPlanId: string,
    userId: string,
    systemId: string,
  ) {
    await this.findActionPlanById(actionPlanId, userId, systemId);

    return this.prisma.actionItem.findMany({
      where: {
        actionPlanId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findActionItemById(
    itemId: string,
    actionPlanId: string,
    userId: string,
    systemId: string,
  ) {
    await this.findActionPlanById(actionPlanId, userId, systemId);

    const actionItem = await this.prisma.actionItem.findFirst({
      where: {
        id: itemId,
        actionPlanId,
      },
    });

    if (!actionItem) {
      throw new NotFoundException('Action item not found');
    }

    return actionItem;
  }

  async updateActionItem(
    itemId: string,
    actionPlanId: string,
    userId: string,
    systemId: string,
    dto: UpdateActionItemDto,
  ) {
    await this.findActionItemById(itemId, actionPlanId, userId, systemId);

    return this.prisma.actionItem.update({
      where: { id: itemId },
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        priority: dto.priority,
      },
    });
  }

  async completeActionItem(
    itemId: string,
    actionPlanId: string,
    userId: string,
    systemId: string,
  ) {
    await this.findActionItemById(itemId, actionPlanId, userId, systemId);

    return this.prisma.actionItem.update({
      where: { id: itemId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
  }

  async uncompleteActionItem(
    itemId: string,
    actionPlanId: string,
    userId: string,
    systemId: string,
  ) {
    await this.findActionItemById(itemId, actionPlanId, userId, systemId);

    return this.prisma.actionItem.update({
      where: { id: itemId },
      data: {
        status: 'pending',
        completedAt: null,
      },
    });
  }

  async deleteActionItem(
    itemId: string,
    actionPlanId: string,
    userId: string,
    systemId: string,
  ) {
    await this.findActionItemById(itemId, actionPlanId, userId, systemId);

    await this.prisma.actionItem.delete({
      where: { id: itemId },
    });

    return { message: 'Action item deleted successfully' };
  }
}
