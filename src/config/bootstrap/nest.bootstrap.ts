import {
  API_VERSION,
  GLOBAL_PREFIX,
} from '@/shared/data-types/constants/api.const';
import { log } from '@/shared/data-types/constants/logger.const';
import { INestApplication, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';

// #region Exception Filter
import { GlobalExceptionFilter } from '@/shared/filter/global-exception.filter';
// #endregion Exception Filter

/* **********************************
 * funciones para configurar Nest JS *
 * *********************************** */

/**
ExceptionFilter */
export function configExceptionFilter(app: INestApplication): void {
  app.useGlobalFilters(app.get(GlobalExceptionFilter));
}

/**
Pipes */
export function configPipes(app: INestApplication): void {
  app.useGlobalPipes(new ZodValidationPipe());
}

/**
Cookie Parser */
export function configCookies(app: INestApplication): void {
  app.use(cookieParser());
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
