import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

describe('ProfileController', () => {
  let controller: ProfileController;
  let service: ProfileService;

  const mockProfileService = {
    getProfile: jest.fn(),
    getHealthStats: jest.fn(),
  };

  const mockUser = {
    userId: 'user-123',
    systemId: 'system-123',
  };

  const mockProfile = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    profileType: 'patient',
    journeyType: 'prenatal',
    systemId: 'system-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockHealthStats = {
    totalLabResults: 5,
    totalActionPlans: 3,
    completedActionItems: 10,
    pendingActionItems: 5,
    criticalInsights: 2,
    lastLabUpload: new Date(),
    lastActionPlanUpdate: new Date(),
    memberSince: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockProfileService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockUser);

      expect(service.getProfile).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(mockProfile);
    });
  });

  describe('getHealthStats', () => {
    it('should return health statistics', async () => {
      mockProfileService.getHealthStats.mockResolvedValue(mockHealthStats);

      const result = await controller.getHealthStats(mockUser);

      expect(service.getHealthStats).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(mockHealthStats);
    });
  });
});
