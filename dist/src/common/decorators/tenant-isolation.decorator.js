"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantIsolation = exports.TENANT_ISOLATION_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.TENANT_ISOLATION_KEY = 'tenantIsolation';
const TenantIsolation = (enable = true) => (0, common_1.SetMetadata)(exports.TENANT_ISOLATION_KEY, enable);
exports.TenantIsolation = TenantIsolation;
//# sourceMappingURL=tenant-isolation.decorator.js.map