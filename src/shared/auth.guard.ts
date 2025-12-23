import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from './jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Missing Bearer token');
    const token = auth.slice('Bearer '.length);
    try {
      const payload = verifyToken(token);
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
