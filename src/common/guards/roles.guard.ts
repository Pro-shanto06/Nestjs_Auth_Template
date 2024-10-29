import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/modules/user/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ExceptionHelper } from '../helpers/exception.helper';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasRole = () => user.role && requiredRoles.includes(user.role);
    if (!hasRole()) {
      ExceptionHelper.getInstance().defaultError(
        'Access denied',
        'access_denied',
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }
}
