import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";
import { Prisma } from "@prisma/client";

type ErrorBody = {
  status: "error";
  message: string;
  details: unknown;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === "string") {
        message = res;
        details = undefined;
      } else if (res && typeof res === "object") {
        const body = res as Record<string, unknown>;
        const msg = body.message;

        if (Array.isArray(msg)) {
          message = "Validation failed";
          details = { errors: msg };
        } else if (typeof msg === "string") {
          message = msg;
          details = (body.details as Record<string, unknown>) ?? null;
        } else if (exception.message) {
          message = exception.message;
          details = undefined;
        }

        if (details === undefined && body.error && typeof body.error === "string") {
          details = { error: body.error };
        }
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      statusCode = this.mapPrismaStatus(exception);
      message = this.mapPrismaMessage(exception);
      details = { code: exception.code, meta: exception.meta };
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = "Database validation error";
      details = { name: exception.name };
    } else if (exception instanceof Error) {
      message = exception.message || message;
      details = { name: exception.name };
    }

    const payload: ErrorBody = {
      status: "error",
      message,
      details: details ?? {},
    };

    response.status(statusCode).json(payload);
  }

  private mapPrismaStatus(err: Prisma.PrismaClientKnownRequestError): number {
    switch (err.code) {
      case "P2002":
        return HttpStatus.CONFLICT;
      case "P2025":
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }

  private mapPrismaMessage(err: Prisma.PrismaClientKnownRequestError): string {
    switch (err.code) {
      case "P2002":
        return "A record with this value already exists";
      case "P2025":
        return "Record not found";
      default:
        return "Database request failed";
    }
  }
}
