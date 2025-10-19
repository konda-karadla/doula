import { Test, TestingModule } from '@nestjs/testing';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

describe('LabsController', () => {
  let controller: LabsController;
  let labsService: LabsService;

  const mockLabsService = {
    uploadLab: jest.fn(),
    getLabResults: jest.fn(),
    getLabResult: jest.fn(),
    getBiomarkers: jest.fn(),
    deleteLabResult: jest.fn(),
  };

  const mockUser: CurrentUserData = {
    userId: 'user-123',
    email: 'test@example.com',
    systemId: 'system-123',
    system: {
      id: 'system-123',
      name: 'Doula Care',
      slug: 'doula',
    },
  };

  const mockFile = {
    originalname: 'test-lab.pdf',
    buffer: Buffer.from('test'),
    mimetype: 'application/pdf',
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabsController],
      providers: [
        {
          provide: LabsService,
          useValue: mockLabsService,
        },
      ],
    }).compile();

    controller = module.get<LabsController>(LabsController);
    labsService = module.get<LabsService>(LabsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadLab', () => {
    it('should upload a lab and return lab result', async () => {
      const mockLabResult = {
        id: 'lab-123',
        fileName: 'test-lab.pdf',
        uploadedAt: new Date(),
        processingStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLabsService.uploadLab.mockResolvedValue(mockLabResult);

      const result = await controller.uploadLab(mockFile, 'test notes', mockUser);

      expect(labsService.uploadLab).toHaveBeenCalledWith(
        mockFile,
        mockUser.userId,
        mockUser.systemId,
        'test notes',
      );
      expect(result).toEqual(mockLabResult);
    });
  });

  describe('getLabResults', () => {
    it('should return array of lab results', async () => {
      const mockLabResults = [
        {
          id: 'lab-123',
          fileName: 'test-lab.pdf',
          uploadedAt: new Date(),
          processingStatus: 'completed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockLabsService.getLabResults.mockResolvedValue(mockLabResults);

      const result = await controller.getLabResults(mockUser);

      expect(labsService.getLabResults).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(mockLabResults);
    });
  });

  describe('getBiomarkers', () => {
    it('should return array of biomarkers for a lab result', async () => {
      const labId = 'lab-123';
      const mockBiomarkers = [
        {
          id: 'bio-123',
          labResultId: labId,
          testName: 'Glucose',
          value: '95',
          unit: 'mg/dL',
          referenceRangeLow: '70',
          referenceRangeHigh: '100',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockLabsService.getBiomarkers.mockResolvedValue(mockBiomarkers);

      const result = await controller.getBiomarkers(labId, mockUser);

      expect(labsService.getBiomarkers).toHaveBeenCalledWith(
        labId,
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual(mockBiomarkers);
    });
  });

  describe('deleteLabResult', () => {
    it('should delete lab result and return success message', async () => {
      const labId = 'lab-123';
      mockLabsService.deleteLabResult.mockResolvedValue(undefined);

      const result = await controller.deleteLabResult(labId, mockUser);

      expect(labsService.deleteLabResult).toHaveBeenCalledWith(
        labId,
        mockUser.userId,
        mockUser.systemId,
      );
      expect(result).toEqual({ message: 'Lab result deleted successfully' });
    });
  });
});
