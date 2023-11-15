import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../user/entities/user.entity';

export type AuthUserData = User;

export interface RequestWithUser extends Request {
  user: User;
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user
      ? {
          id: request.user.id,
          username: request.user.username,
          role: request.user.role,
        }
      : null;
  },
);
