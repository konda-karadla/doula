import { Test, TestingModule } from '@nestjs/testing';
import { ActionPlansController } from './action-plans.controller';
import { ActionPlansService } from './action-plans.service';
import { ActionPlanStatus } from './dto/create-action-plan.dto';
import { ActionItemPriority } from './dto/create-action-item.dto';

describe('ActionPlansController', () => {
  let controller: ActionPlansController;
  let service: ActionPlansService;

  const mockActionPlansService = {
    createActionPlan: jest.fn(),
    findAllActionPlans: jest.fn(),
    findActionPlanById: jest.fn(),
    updateActionPlan: jest.fn(),
    deleteActionPlan: jest.fn(),
    createActionItem: jest.fn(),
    findActionItemsByPlanId: jest.fn(),
    findActionItemById: jest.fn(),
    updateActionItem: jest.fn(),
    completeActionItem: jest.fn(),
    uncompleteActionItem: jest.fn(),
    deleteActionItem: jest.fn(),
  };

  const mockUser = {
    userId: 'user-123',
    systemId: 'system-123',
  };

  const mockActionPlan = {
    id: 'plan-123',
    userId: 'user-123',
    systemId: 'system-123',
    title: 'My Health Plan',
    description: 'Track my health goals',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    actionItems: [],
  };

  const mockActionItem = {
    id: 'item-123',
    actionPlanId: 'plan-123',
    title: 'Take vitamin D',
    description: 'Take 2000 IU daily',
    dueDate: new Date(),
    completedAt: null,
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionPlansController],
      providers: [
        {
          provide: ActionPlansService,
          useValue: mockActionPlansService,
        },
      ],
    }).compile();

    controller = module.get<ActionPlansController>(ActionPlansController);
    service = module.get<ActionPlansService>(ActionPlansService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createActionPlan', () => {
    it('should create an action plan', async () => {
      const dto = {
        title: 'My Health Plan',
        description: 'Track my health goals',
        status: ActionPlanStatus.ACTIVE,
      };

      mockActionPlansService.createActionPlan.mockResolvedValue(mockActionPlan);

      const result = await controller.createActionPlan(mockUser, dto);

      expect(service.createActionPlan).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.systemId,
        dto,
      );
      expect(result).toEqual(mockActionPlan);
    });
  });

  describe('getAllActionPlans', () => {
    it('should return all action plans for user', async () => {
      const plans = [mockActionPlan];
      mockActionPlansService.findAllActionPlans.mockResolvedValue(plans);

      const result = await controller.getAllActionPlans(mockUser);

      expect(service.findAllActionPlans).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(plans);
    });
  });

  describe('getActionPlanById', () => {
    it('should return action plan by id', async () => {
      mockActionPlansService.findActionPlanById.mockResolvedValue(
        mockActionPlan,
      );

      const result = await controller.getActionPlanById(
        mockUser,
        mockActionPlan.id,
      );

      expect(service.findActionPlanById).toHaveBeenCalledWith(
        mockActionPlan.id,
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(mockActionPlan);
    });
  });

  describe('updateActionPlan', () => {
    it('should update action plan', async () => {
      const dto = { title: 'Updated Plan' };
      const updated = { ...mockActionPlan, ...dto };

      mockActionPlansService.updateActionPlan.mockResolvedValue(updated);

      const result = await controller.updateActionPlan(
        mockUser,
        mockActionPlan.id,
        dto,
      );

      expect(service.updateActionPlan).toHaveBeenCalledWith(
        mockActionPlan.id,
        mockUser.userId,
        mockUser.systemId,
        dto,
      );
      expect(result).toEqual(updated);
    });
  });

  describe('deleteActionPlan', () => {
    it('should delete action plan', async () => {
      const response = { message: 'Action plan deleted successfully' };
      mockActionPlansService.deleteActionPlan.mockResolvedValue(response);

      const result = await controller.deleteActionPlan(
        mockUser,
        mockActionPlan.id,
      );

      expect(service.deleteActionPlan).toHaveBeenCalledWith(
        mockActionPlan.id,
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(response);
    });
  });

  describe('createActionItem', () => {
    it('should create an action item', async () => {
      const dto = {
        title: 'Take vitamin D',
        description: 'Take 2000 IU daily',
        dueDate: new Date().toISOString(),
        priority: ActionItemPriority.MEDIUM,
      };

      mockActionPlansService.createActionItem.mockResolvedValue(mockActionItem);

      const result = await controller.createActionItem(
        mockUser,
        mockActionPlan.id,
        dto,
      );

      expect(service.createActionItem).toHaveBeenCalledWith(
        mockActionPlan.id,
        mockUser.userId,
        mockUser.systemId,
        dto,
      );
      expect(result).toEqual(mockActionItem);
    });
  });

  describe('getActionItems', () => {
    it('should return all action items for plan', async () => {
      const items = [mockActionItem];
      mockActionPlansService.findActionItemsByPlanId.mockResolvedValue(items);

      const result = await controller.getActionItems(
        mockUser,
        mockActionPlan.id,
      );

      expect(service.findActionItemsByPlanId).toHaveBeenCalledWith(
        mockActionPlan.id,
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(items);
    });
  });

  describe('getActionItemById', () => {
    it('should return action item by id', async () => {
      mockActionPlansService.findActionItemById.mockResolvedValue(
        mockActionItem,
      );

      const result = await controller.getActionItemById(
        mockUser,
        mockActionPlan.id,
        mockActionItem.id,
      );

      expect(service.findActionItemById).toHaveBeenCalledWith(
        mockActionItem.id,
        mockActionPlan.id,
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(mockActionItem);
    });
  });

  describe('updateActionItem', () => {
    it('should update action item', async () => {
      const dto = { title: 'Updated item' };
      const updated = { ...mockActionItem, ...dto };

      mockActionPlansService.updateActionItem.mockResolvedValue(updated);

      const result = await controller.updateActionItem(
        mockUser,
        mockActionPlan.id,
        mockActionItem.id,
        dto,
      );

      expect(service.updateActionItem).toHaveBeenCalledWith(
        mockActionItem.id,
        mockActionPlan.id,
        mockUser.userId,
        mockUser.systemId,
        dto,
      );
      expect(result).toEqual(updated);
    });
  });

  describe('completeActionItem', () => {
    it('should mark action item as completed', async () => {
      const completed = { ...mockActionItem, completedAt: new Date() };
      mockActionPlansService.completeActionItem.mockResolvedValue(completed);

      const result = await controller.completeActionItem(
        mockUser,
        mockActionPlan.id,
        mockActionItem.id,
      );

      expect(service.completeActionItem).toHaveBeenCalledWith(
        mockActionItem.id,
        mockActionPlan.id,
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(completed);
    });
  });

  describe('uncompleteActionItem', () => {
    it('should mark action item as not completed', async () => {
      const uncompleted = { ...mockActionItem, completedAt: null };
      mockActionPlansService.uncompleteActionItem.mockResolvedValue(
        uncompleted,
      );

      const result = await controller.uncompleteActionItem(
        mockUser,
        mockActionPlan.id,
        mockActionItem.id,
      );

      expect(service.uncompleteActionItem).toHaveBeenCalledWith(
        mockActionItem.id,
        mockActionPlan.id,
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(uncompleted);
    });
  });

  describe('deleteActionItem', () => {
    it('should delete action item', async () => {
      const response = { message: 'Action item deleted successfully' };
      mockActionPlansService.deleteActionItem.mockResolvedValue(response);

      const result = await controller.deleteActionItem(
        mockUser,
        mockActionPlan.id,
        mockActionItem.id,
      );

      expect(service.deleteActionItem).toHaveBeenCalledWith(
        mockActionItem.id,
        mockActionPlan.id,
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(response);
    });
  });
});
