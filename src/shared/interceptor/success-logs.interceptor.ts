import { LoggerService } from '@/shared/services/logger.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { getHttpStatusMessage } from '../data-types/constants/http-status-messages.const';

@Injectable()
export class SuccessLogsInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now: number = Date.now();

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        this.logSuccess(req, res, now);
      }),
    );
  }

  private logSuccess(req: any, res: any, startTime: number): void {
    const duration: number = Date.now() - startTime;
    const statusCode: number = res.statusCode;

    // solo loguear si es éxito (2xx ó 3xx)
    if (statusCode >= 400) return;

    const { method, originalUrl, protocol } = req;
    const host: string = req.get('Host');

    const statusMessage: string = getHttpStatusMessage(statusCode);
    const fullURL: string = `${protocol}://${host}${originalUrl}`;

    const logMessage: string =
      `[${method.toUpperCase()}]` +
      ` ${statusCode}` +
      ` ${fullURL}` +
      ` ${statusMessage}` +
      ` ${duration}ms`;

    const meta = {
      statusCode,
      statusMessage,
      method,
      originalUrl,
      duration,
    };

    this.loggerService.logInfo(logMessage, meta);
  }
}
