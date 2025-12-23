import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '../../shared/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization format');
    }

    try {
      const payload = verifyToken(token);
      request['user'] = { id: payload.sub, ...payload };
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
