"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
describe('AuthController', () => {
    let controller;
    let authService;
    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        refreshToken: jest.fn(),
        logout: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [auth_controller_1.AuthController],
            providers: [
                {
                    provide: auth_service_1.AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();
        controller = module.get(auth_controller_1.AuthController);
        authService = module.get(auth_service_1.AuthService);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    describe('register', () => {
        it('should call authService.register with correct parameters', async () => {
            const registerDto = {
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
                profileType: 'patient',
                journeyType: 'prenatal',
                systemSlug: 'doula',
            };
            mockAuthService.register.mockResolvedValue({
                user: { id: '1', email: 'test@example.com' },
                accessToken: 'token',
                refreshToken: 'refresh',
            });
            await controller.register(registerDto);
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });
    });
    describe('login', () => {
        it('should call authService.login with correct parameters', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'password123',
            };
            mockAuthService.login.mockResolvedValue({
                user: { id: '1', email: 'test@example.com' },
                accessToken: 'token',
                refreshToken: 'refresh',
            });
            await controller.login(loginDto);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });
});
//# sourceMappingURL=auth.controller.spec.js.map