import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RESPONSE_MESSAGE_KEY } from "../decorators/response-message.decorator";

export type PaginatedPayload<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const defaultMessage = "Request completed successfully";
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ??
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getClass()) ??
      defaultMessage;

    return next.handle().pipe(
      map((body: unknown) => {
        if (body === null || body === undefined) {
          return { status: "success" as const, message, data: null };
        }

        if (this.isPaginatedPayload(body)) {
          return {
            status: "success" as const,
            message,
            data: body.data,
            meta: body.meta,
          };
        }

        return { status: "success" as const, message, data: body };
      }),
    );
  }

  private isPaginatedPayload(body: unknown): body is PaginatedPayload<unknown> {
    if (!body || typeof body !== "object") return false;
    const b = body as Record<string, unknown>;
    return Array.isArray(b.data) && b.meta !== null && typeof b.meta === "object";
  }
}
