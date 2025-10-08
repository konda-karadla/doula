import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SystemConfigDto, UpdateSystemConfigDto } from './dto/system-config.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ==================== USER MANAGEMENT ====================
  
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        language: true,
        profileType: true,
        journeyType: true,
        systemId: true,
        createdAt: true,
        updatedAt: true,
        system: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.username,
      role: user.role,
      system: user.system.slug,
      status: 'active', // You can add a status field to the User model if needed
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.updatedAt.toISOString(), // Use updatedAt as lastLogin for now
    }));
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        system: true,
        labResults: {
          take: 5,
          orderBy: { uploadedAt: 'desc' },
        },
        actionPlans: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createUser(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        language: true,
        profileType: true,
        journeyType: true,
        systemId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If password is being updated, hash it
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        language: true,
        profileType: true,
        journeyType: true,
        systemId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({ where: { id } });
    
    return { message: 'User deleted successfully' };
  }

  // ==================== SYSTEM CONFIGURATION ====================
  
  async getSystemConfig(): Promise<SystemConfigDto> {
    // This is a mock implementation. You can store these in SystemConfig table
    const config: SystemConfigDto = {
      general: {
        platformName: 'Health Platform',
        supportEmail: 'support@healthplatform.com',
        maxFileSize: '10',
        sessionTimeout: '30',
      },
      features: {
        userRegistration: true,
        labUpload: true,
        actionPlans: true,
        notifications: true,
        analytics: true,
        darkMode: false,
      },
      systems: {
        doula: {
          enabled: true,
          name: 'Doula Care System',
          description: 'Comprehensive doula and fertility care platform',
          primaryColor: '#3B82F6',
        },
        functional_health: {
          enabled: true,
          name: 'Functional Health System',
          description: 'Advanced functional medicine and wellness platform',
          primaryColor: '#8B5CF6',
        },
        elderly_care: {
          enabled: true,
          name: 'Elderly Care System',
          description: 'Specialized care platform for elderly patients',
          primaryColor: '#F59E0B',
        },
      },
    };

    return config;
  }

  async updateSystemConfig(updateConfigDto: UpdateSystemConfigDto): Promise<SystemConfigDto> {
    // In a real implementation, you would persist this to the database
    // For now, just return the updated config merged with defaults
    const currentConfig = await this.getSystemConfig();
    
    const updatedConfig: SystemConfigDto = {
      general: { ...currentConfig.general, ...updateConfigDto.general },
      features: { ...currentConfig.features, ...updateConfigDto.features },
      systems: {
        doula: { ...currentConfig.systems.doula, ...updateConfigDto.systems?.doula },
        functional_health: { ...currentConfig.systems.functional_health, ...updateConfigDto.systems?.functional_health },
        elderly_care: { ...currentConfig.systems.elderly_care, ...updateConfigDto.systems?.elderly_care },
      },
    };

    return updatedConfig;
  }

  // ==================== ANALYTICS ====================
  
  async getUserAnalytics() {
    const totalUsers = await this.prisma.user.count();
    const usersBySystem = await this.prisma.user.groupBy({
      by: ['systemId'],
      _count: true,
    });
    
    const systems = await this.prisma.system.findMany();
    
    const usersBySystemWithName = await Promise.all(
      usersBySystem.map(async (group) => {
        const system = systems.find(s => s.id === group.systemId);
        return {
          system: system?.name || 'Unknown',
          count: group._count,
        };
      })
    );

    return {
      totalUsers,
      usersBySystem: usersBySystemWithName,
      recentRegistrations: await this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    };
  }

  async getLabAnalytics() {
    const totalLabs = await this.prisma.labResult.count();
    const labsByStatus = await this.prisma.labResult.groupBy({
      by: ['processingStatus'],
      _count: true,
    });

    return {
      totalLabs,
      byStatus: labsByStatus.map(group => ({
        status: group.processingStatus,
        count: group._count,
      })),
      recentUploads: await this.prisma.labResult.count({
        where: {
          uploadedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    };
  }

  async getActionPlanAnalytics() {
    const totalPlans = await this.prisma.actionPlan.count();
    const plansByStatus = await this.prisma.actionPlan.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalItems = await this.prisma.actionItem.count();
    const completedItems = await this.prisma.actionItem.count({
      where: {
        completedAt: { not: null },
      },
    });

    return {
      totalPlans,
      byStatus: plansByStatus.map(group => ({
        status: group.status,
        count: group._count,
      })),
      totalItems,
      completedItems,
      completionRate: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
    };
  }
}

