import { SetMetadata } from '@nestjs/common';

export const TENANT_ISOLATION_KEY = 'tenantIsolation';

export const TenantIsolation = (enable = true) =>
  SetMetadata(TENANT_ISOLATION_KEY, enable);
