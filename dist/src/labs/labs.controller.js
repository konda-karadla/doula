"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_isolation_guard_1 = require("../common/guards/tenant-isolation.guard");
const tenant_isolation_decorator_1 = require("../common/decorators/tenant-isolation.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const labs_service_1 = require("./labs.service");
let LabsController = class LabsController {
    labsService;
    constructor(labsService) {
        this.labsService = labsService;
    }
    async uploadLab(file, notes, user) {
        return this.labsService.uploadLab(file, user.userId, user.systemId, notes);
    }
    async getLabResults(user) {
        return this.labsService.getLabResults(user.userId, user.systemId);
    }
    async getLabResult(id, user) {
        return this.labsService.getLabResult(id, user.userId, user.systemId);
    }
    async getBiomarkers(id, user) {
        return this.labsService.getBiomarkers(id, user.userId, user.systemId);
    }
    async deleteLabResult(id, user) {
        await this.labsService.deleteLabResult(id, user.userId, user.systemId);
        return { message: 'Lab result deleted successfully' };
    }
};
exports.LabsController = LabsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload lab result PDF for OCR processing' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                notes: {
                    type: 'string',
                },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: 'application/pdf' }),
        ],
    }))),
    __param(1, (0, common_1.Body)('notes')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LabsController.prototype, "uploadLab", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all lab results for current user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LabsController.prototype, "getLabResults", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific lab result by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LabsController.prototype, "getLabResult", null);
__decorate([
    (0, common_1.Get)(':id/biomarkers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get parsed biomarkers from lab result' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LabsController.prototype, "getBiomarkers", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete lab result and associated biomarkers' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LabsController.prototype, "deleteLabResult", null);
exports.LabsController = LabsController = __decorate([
    (0, swagger_1.ApiTags)('labs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('labs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_isolation_guard_1.TenantIsolationGuard),
    (0, tenant_isolation_decorator_1.TenantIsolation)(),
    __metadata("design:paramtypes", [labs_service_1.LabsService])
], LabsController);
//# sourceMappingURL=labs.controller.js.map