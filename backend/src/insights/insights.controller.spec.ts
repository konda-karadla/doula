import { Test, TestingModule } from '@nestjs/testing';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { InsightType, InsightPriority } from './dto/health-insight.dto';

describe('InsightsController', () => {
  let controller: InsightsController;
  let service: InsightsService;

  const mockInsightsService = {
    getInsightsSummary: jest.fn(),
    generateInsightsForLabResult: jest.fn(),
    getBiomarkerTrends: jest.fn(),
  };

  const mockUser = {
    userId: 'user-123',
    systemId: 'system-123',
  };

  const mockInsight = {
    id: 'insight-123',
    biomarkerId: 'biomarker-123',
    testName: 'Glucose',
    currentValue: '110',
    type: InsightType.HIGH,
    priority: InsightPriority.MEDIUM,
    message: 'Your Glucose is above the optimal range at 110 mg/dL.',
    recommendation:
      'Your blood glucose is elevated. Consider reducing sugar intake, increasing physical activity, and monitoring regularly.',
    createdAt: new Date(),
  };

  const mockSummary = {
    totalInsights: 5,
    criticalCount: 1,
    highPriorityCount: 2,
    normalCount: 2,
    insights: [mockInsight],
    lastAnalyzedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsController],
      providers: [
        {
          provide: InsightsService,
          useValue: mockInsightsService,
        },
      ],
    }).compile();

    controller = module.get<InsightsController>(InsightsController);
    service = module.get<InsightsService>(InsightsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getInsightsSummary', () => {
    it('should return insights summary', async () => {
      mockInsightsService.getInsightsSummary.mockResolvedValue(mockSummary);

      const result = await controller.getInsightsSummary(mockUser);

      expect(service.getInsightsSummary).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(mockSummary);
    });
  });

  describe('getInsightsForLabResult', () => {
    it('should return insights for specific lab result', async () => {
      const labResultId = 'lab-123';
      const insights = [mockInsight];
      mockInsightsService.generateInsightsForLabResult.mockResolvedValue(
        insights,
      );

      const result = await controller.getInsightsForLabResult(
        mockUser,
        labResultId,
      );

      expect(service.generateInsightsForLabResult).toHaveBeenCalledWith(
        labResultId,
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(insights);
    });
  });

  describe('getBiomarkerTrends', () => {
    it('should return biomarker trends over time', async () => {
      const testName = 'glucose';
      const trends = [
        {
          value: '95',
          unit: 'mg/dL',
          date: new Date('2025-01-01'),
          testName: 'Glucose',
        },
        {
          value: '110',
          unit: 'mg/dL',
          date: new Date('2025-02-01'),
          testName: 'Glucose',
        },
      ];
      mockInsightsService.getBiomarkerTrends.mockResolvedValue(trends);

      const result = await controller.getBiomarkerTrends(mockUser, testName);

      expect(service.getBiomarkerTrends).toHaveBeenCalledWith(
        testName,
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(trends);
    });
  });
});
