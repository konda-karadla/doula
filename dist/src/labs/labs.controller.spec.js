"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const labs_controller_1 = require("./labs.controller");
const labs_service_1 = require("./labs.service");
describe('LabsController', () => {
    let controller;
    let labsService;
    const mockLabsService = {
        uploadLab: jest.fn(),
        getLabResults: jest.fn(),
        getLabResult: jest.fn(),
        getBiomarkers: jest.fn(),
        deleteLabResult: jest.fn(),
    };
    const mockUser = {
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
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [labs_controller_1.LabsController],
            providers: [
                {
                    provide: labs_service_1.LabsService,
                    useValue: mockLabsService,
                },
            ],
        }).compile();
        controller = module.get(labs_controller_1.LabsController);
        labsService = module.get(labs_service_1.LabsService);
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
            expect(labsService.uploadLab).toHaveBeenCalledWith(mockFile, mockUser.userId, mockUser.systemId, 'test notes');
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
            expect(labsService.getLabResults).toHaveBeenCalledWith(mockUser.userId, mockUser.systemId);
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
            expect(labsService.getBiomarkers).toHaveBeenCalledWith(labId, mockUser.userId, mockUser.systemId);
            expect(result).toEqual(mockBiomarkers);
        });
    });
    describe('deleteLabResult', () => {
        it('should delete lab result and return success message', async () => {
            const labId = 'lab-123';
            mockLabsService.deleteLabResult.mockResolvedValue(undefined);
            const result = await controller.deleteLabResult(labId, mockUser);
            expect(labsService.deleteLabResult).toHaveBeenCalledWith(labId, mockUser.userId, mockUser.systemId);
            expect(result).toEqual({ message: 'Lab result deleted successfully' });
        });
    });
});
//# sourceMappingURL=labs.controller.spec.js.map