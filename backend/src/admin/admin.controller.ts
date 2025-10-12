import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSystemConfigDto } from './dto/system-config.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== USER MANAGEMENT ====================
  
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ==================== SYSTEM CONFIGURATION ====================
  
  @Get('systems')
  async getSystems() {
    return this.adminService.getSystems();
  }

  @Get('system-config')
  async getSystemConfig() {
    return this.adminService.getSystemConfig();
  }

  @Put('system-config')
  async updateSystemConfig(@Body() updateConfigDto: UpdateSystemConfigDto) {
    return this.adminService.updateSystemConfig(updateConfigDto);
  }

  // ==================== ANALYTICS ====================
  
  @Get('analytics/users')
  async getUserAnalytics() {
    return this.adminService.getUserAnalytics();
  }

  @Get('analytics/labs')
  async getLabAnalytics() {
    return this.adminService.getLabAnalytics();
  }

  @Get('analytics/action-plans')
  async getActionPlanAnalytics() {
    return this.adminService.getActionPlanAnalytics();
  }

  // ==================== LAB RESULTS MANAGEMENT ====================
  
  @Get('lab-results')
  async getAllLabResults() {
    return this.adminService.getAllLabResults();
  }

  // ==================== ACTION PLAN MANAGEMENT ====================
  
  @Get('action-plans')
  async getAllActionPlans() {
    return this.adminService.getAllActionPlans();
  }

  @Get('action-plans/:id')
  async getActionPlanById(@Param('id') id: string) {
    return this.adminService.getActionPlanById(id);
  }

  @Get('action-plans/:id/items')
  async getActionPlanItems(@Param('id') id: string) {
    return this.adminService.getActionPlanItems(id);
  }

  @Post('action-plans')
  async createActionPlanForUser(@Body() data: any) {
    return this.adminService.createActionPlanForUser(data);
  }

  @Put('action-plans/:id')
  async updateActionPlan(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateActionPlan(id, data);
  }

  @Delete('action-plans/:id')
  async deleteActionPlan(@Param('id') id: string) {
    return this.adminService.deleteActionPlan(id);
  }
}

