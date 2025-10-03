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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantIsolationGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const tenant_isolation_decorator_1 = require("../decorators/tenant-isolation.decorator");
let TenantIsolationGuard = class TenantIsolationGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isTenantIsolationEnabled = this.reflector.getAllAndOverride(tenant_isolation_decorator_1.TENANT_ISOLATION_KEY, [context.getHandler(), context.getClass()]);
        if (!isTenantIsolationEnabled) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.systemId) {
            throw new common_1.ForbiddenException('User system information not found');
        }
        const requestSystemId = request.params?.systemId || request.body?.systemId;
        if (requestSystemId && requestSystemId !== user.systemId) {
            throw new common_1.ForbiddenException('Access denied to this system resource');
        }
        return true;
    }
};
exports.TenantIsolationGuard = TenantIsolationGuard;
exports.TenantIsolationGuard = TenantIsolationGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], TenantIsolationGuard);
//# sourceMappingURL=tenant-isolation.guard.js.map