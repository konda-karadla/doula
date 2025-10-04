import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ActionPlansService } from './action-plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantIsolationGuard } from '../common/guards/tenant-isolation.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { UpdateActionItemDto } from './dto/update-action-item.dto';
import { ActionPlanDto } from './dto/action-plan.dto';
import { ActionItemDto } from './dto/action-item.dto';

@ApiTags('action-plans')
@ApiBearerAuth()
@Controller('action-plans')
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
export class ActionPlansController {
  constructor(private readonly actionPlansService: ActionPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new action plan' })
  @ApiResponse({
    status: 201,
    description: 'Action plan created successfully',
    type: ActionPlanDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createActionPlan(
    @CurrentUser() user: any,
    @Body() dto: CreateActionPlanDto,
  ) {
    return this.actionPlansService.createActionPlan(
      user.userId,
      user.systemId,
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all action plans for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of action plans with their items',
    type: [ActionPlanDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllActionPlans(@CurrentUser() user: any) {
    return this.actionPlansService.findAllActionPlans(
      user.userId,
      user.systemId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get action plan by ID' })
  @ApiParam({ name: 'id', description: 'Action plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Action plan details with items',
    type: ActionPlanDto,
  })
  @ApiResponse({ status: 404, description: 'Action plan not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getActionPlanById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.actionPlansService.findActionPlanById(
      id,
      user.userId,
      user.systemId,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update action plan' })
  @ApiParam({ name: 'id', description: 'Action plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Action plan updated successfully',
    type: ActionPlanDto,
  })
  @ApiResponse({ status: 404, description: 'Action plan not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateActionPlan(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateActionPlanDto,
  ) {
    return this.actionPlansService.updateActionPlan(
      id,
      user.userId,
      user.systemId,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete action plan and all its items' })
  @ApiParam({ name: 'id', description: 'Action plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Action plan deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Action plan not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteActionPlan(@CurrentUser() user: any, @Param('id') id: string) {
    return this.actionPlansService.deleteActionPlan(
      id,
      user.userId,
      user.systemId,
    );
  }

  @Post(':planId/items')
  @ApiOperation({ summary: 'Add action item to action plan' })
  @ApiParam({ name: 'planId', description: 'Action plan ID' })
  @ApiResponse({
    status: 201,
    description: 'Action item created successfully',
    type: ActionItemDto,
  })
  @ApiResponse({ status: 404, description: 'Action plan not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createActionItem(
    @CurrentUser() user: any,
    @Param('planId') planId: string,
    @Body() dto: CreateActionItemDto,
  ) {
    return this.actionPlansService.createActionItem(
      planId,
      user.userId,
      user.systemId,
      dto,
    );
  }

  @Get(':planId/items')
  @ApiOperation({ summary: 'Get all action items for an action plan' })
  @ApiParam({ name: 'planId', description: 'Action plan ID' })
  @ApiResponse({
    status: 200,
    description: 'List of action items',
    type: [ActionItemDto],
  })
  @ApiResponse({ status: 404, description: 'Action plan not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getActionItems(
    @CurrentUser() user: any,
    @Param('planId') planId: string,
  ) {
    return this.actionPlansService.findActionItemsByPlanId(
      planId,
      user.userId,
      user.systemId,
    );
  }

  @Get(':planId/items/:itemId')
  @ApiOperation({ summary: 'Get action item by ID' })
  @ApiParam({ name: 'planId', description: 'Action plan ID' })
  @ApiParam({ name: 'itemId', description: 'Action item ID' })
  @ApiResponse({
    status: 200,
    description: 'Action item details',
    type: ActionItemDto,
  })
  @ApiResponse({ status: 404, description: 'Action item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getActionItemById(
    @CurrentUser() user: any,
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.actionPlansService.findActionItemById(
      itemId,
      planId,
      user.userId,
      user.systemId,
    );
  }

  @Put(':planId/items/:itemId')
  @ApiOperation({ summary: 'Update action item' })
  @ApiParam({ name: 'planId', description: 'Action plan ID' })
  @ApiParam({ name: 'itemId', description: 'Action item ID' })
  @ApiResponse({
    status: 200,
    description: 'Action item updated successfully',
    type: ActionItemDto,
  })
  @ApiResponse({ status: 404, description: 'Action item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateActionItem(
    @CurrentUser() user: any,
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateActionItemDto,
  ) {
    return this.actionPlansService.updateActionItem(
      itemId,
      planId,
      user.userId,
      user.systemId,
      dto,
    );
  }

  @Patch(':planId/items/:itemId/complete')
  @ApiOperation({ summary: 'Mark action item as completed' })
  @ApiParam({ name: 'planId', description: 'Action plan ID' })
  @ApiParam({ name: 'itemId', description: 'Action item ID' })
  @ApiResponse({
    status: 200,
    description: 'Action item marked as completed',
    type: ActionItemDto,
  })
  @ApiResponse({ status: 404, description: 'Action item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeActionItem(
    @CurrentUser() user: any,
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.actionPlansService.completeActionItem(
      itemId,
      planId,
      user.userId,
      user.systemId,
    );
  }

  @Patch(':planId/items/:itemId/uncomplete')
  @ApiOperation({ summary: 'Mark action item as not completed' })
  @ApiParam({ name: 'planId', description: 'Action plan ID' })
  @ApiParam({ name: 'itemId', description: 'Action item ID' })
  @ApiResponse({
    status: 200,
    description: 'Action item marked as not completed',
    type: ActionItemDto,
  })
  @ApiResponse({ status: 404, description: 'Action item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uncompleteActionItem(
    @CurrentUser() user: any,
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.actionPlansService.uncompleteActionItem(
      itemId,
      planId,
      user.userId,
      user.systemId,
    );
  }

  @Delete(':planId/items/:itemId')
  @ApiOperation({ summary: 'Delete action item' })
  @ApiParam({ name: 'planId', description: 'Action plan ID' })
  @ApiParam({ name: 'itemId', description: 'Action item ID' })
  @ApiResponse({
    status: 200,
    description: 'Action item deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Action item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteActionItem(
    @CurrentUser() user: any,
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.actionPlansService.deleteActionItem(
      itemId,
      planId,
      user.userId,
      user.systemId,
    );
  }
}
