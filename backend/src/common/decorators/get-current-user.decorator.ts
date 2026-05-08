import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';

export const GetCurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);