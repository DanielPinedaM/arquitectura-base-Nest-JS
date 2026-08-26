import { getHttpStatusMessage } from '@/shared/data-types/constants/http-status-messages.const';
import { LoggerService } from '@/shared/services/logger.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class SuccessLogsInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now: number = Date.now();

    const ctx: HttpArgumentsHost = context.switchToHttp();
    const req: ExpressRequest = ctx.getRequest<ExpressRequest>();
    const res: ExpressResponse = ctx.getResponse<ExpressResponse>();

    return next.handle().pipe(
      tap(() => {
        this.logSuccess(req, res, now);
      }),
    );
  }

  private logSuccess(
    req: ExpressRequest,
    res: ExpressResponse,
    startTime: number,
  ): void {
    const duration: number = Date.now() - startTime;
    const statusCode: number = res.statusCode;

    // solo loguear si es éxito (2xx ó 3xx)
    if (statusCode >= 400) return;

    const { method, originalUrl, protocol } = req;
    const host: string | undefined = req.get('Host');

    const statusMessage: string = getHttpStatusMessage(statusCode);
    const fullURL: string = `${protocol}://${host}${originalUrl}`;

    const logMessage: string =
      `[${method.toUpperCase()}]` +
      ` ${statusCode}` +
      ` ${fullURL}` +
      ` ${statusMessage}` +
      ` ${duration}ms`;

    const meta: Record<string, unknown> = {
      statusCode,
      statusMessage,
      method,
      originalUrl,
      duration,
    };

    this.loggerService.logInfo(logMessage, meta);
  }
}
