import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TENANT_ISOLATION_KEY } from '../decorators/tenant-isolation.decorator';

@Injectable()
export class TenantIsolationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isTenantIsolationEnabled = this.reflector.getAllAndOverride<boolean>(
      TENANT_ISOLATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isTenantIsolationEnabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.systemId) {
      throw new ForbiddenException('User system information not found');
    }

    const requestSystemId = request.params?.systemId || request.body?.systemId;

    if (requestSystemId && requestSystemId !== user.systemId) {
      throw new ForbiddenException('Access denied to this system resource');
    }

    return true;
  }
}
