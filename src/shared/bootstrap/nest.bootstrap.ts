import {
  API_VERSION,
  GLOBAL_PREFIX,
} from '@/shared/data-types/constants/api.const';
import { log } from '@/shared/data-types/constants/logger.const';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

// #region Exception Filter
import { GlobalExceptionFilter } from '@/shared/filter/global-exception.filter';
// #endregion Exception Filter

// #region Interceptor
import { StandardizeSuccessResponseInterceptor } from '@/shared/interceptor/standardize-success-response.interceptor';
import { SuccessLogsInterceptor } from '@/shared/interceptor/success-logs.interceptor';
// #endregion Interceptor

/* **********************************
 * funciones para configurar Nest JS *
 * *********************************** */

/**
ExceptionFilter */
export function configExceptionFilter(app: INestApplication): void {
  app.useGlobalFilters(app.get(GlobalExceptionFilter));
}

/**
Interceptor */
export function configInterceptor(app: INestApplication): void {
  app.useGlobalInterceptors(app.get(StandardizeSuccessResponseInterceptor));
  app.useGlobalInterceptors(app.get(SuccessLogsInterceptor));
}

/**
Pipes */
export function configPipes(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
}

/**
CORS, prefijos y versionamiento */
export function configCore(app: INestApplication): void {
  const allowedOrigins: string = '*';
  log.info(`\x1b[34morigenes permitidos: ${allowedOrigins}\x1b[0m`);
  app.enableCors({
    origin: true,
  });
  app.setGlobalPrefix(GLOBAL_PREFIX);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION,
  });
}
