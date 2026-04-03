import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Role, Status } from "@prisma/client";

export type RequestUser = {
  userId: string;
  email: string;
  role: Role;
  status?: Status;
};

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as RequestUser;
});

