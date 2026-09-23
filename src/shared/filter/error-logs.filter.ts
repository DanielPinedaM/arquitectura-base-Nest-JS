import { getHttpStatusMessage } from '@/shared/data-types/constants/http-status-messages.const';
import { LoggerService } from '@/shared/services/logger.service';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

@Catch()
export class ErrorLogsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req: ExpressRequest = ctx.getRequest<ExpressRequest>();

    this.#logError(exception, req);
  }

  #logError(exception: unknown, req: ExpressRequest): void {
    const statusCode: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const statusMessage: string = getHttpStatusMessage(statusCode);

    const { method, originalUrl, protocol } = req;
    const hostHeader: string | undefined = req.get('Host');

    const fullURL: string = `${protocol}://${hostHeader}${originalUrl}`;

    const logMessage: string =
      `[${method.toUpperCase()}]` +
      ` ${statusCode}` +
      ` ${fullURL}` +
      ` ${statusMessage}`;

    const meta: Record<string, unknown> = {
      statusCode,
      statusMessage,
      method,
      originalUrl,
    };

    this.logger.logError(logMessage, meta);
  }
}
