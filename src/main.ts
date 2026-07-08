import { AppModule } from '@/app/modules/app.module';
import {
    INestApplication,
    ValidationPipe,
    VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ENV_VARS } from 'environments/env-config';
import { json } from 'express';

// #region Exception Filter
import { ErrorLogsFilter } from '@/shared/filter/error-logs.filter';
import { StandardizeErrorResponseFilter } from '@/shared/filter/standardize-error-response.filter';
// #endregion Exception Filter

// #region Interceptor
import { StandardizeSuccessResponseInterceptor } from '@/shared/interceptor/standardize-success-response.interceptor';
import { SuccessLogsInterceptor } from '@/shared/interceptor/success-logs.interceptor';
// #endregion Interceptor

// #region logs
import { log } from '@/shared/data-types/constants/logger.const';
import { LoggerService } from '@/shared/services/logger.service';
// #endregion logs

const GLOBAL_PREFIX: string = 'api';

/* **********************************
 * funciones para configurar Nest JS *
 * *********************************** */

/**
ExceptionFilter */
function configExceptionFilter(app: INestApplication): void {
  app.useGlobalFilters(app.get(StandardizeErrorResponseFilter));
  app.useGlobalFilters(app.get(ErrorLogsFilter));
}

/**
Interceptor */
function configInterceptor(app: INestApplication): void {
  app.useGlobalInterceptors(app.get(StandardizeSuccessResponseInterceptor));
  app.useGlobalInterceptors(app.get(SuccessLogsInterceptor));
}

/**
Pipes */
function configPipes(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
}

/**
CORS, prefijos y versionamiento */
function configCore(app: INestApplication): void {
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

/* *********************************
 * swagger: documentación de la API *
 * ********************************** */

const API_TITLE: string = 'Base';
const API_DESCRIPTION: string = 'Descripción de API para base';
const API_VERSION: string = '1';

function configSwagger(app: INestApplication): void {
  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle(API_TITLE)
    .setDescription(API_DESCRIPTION)
    .setVersion(API_VERSION)
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: false,
  });
}

/* ****************************************************************************************************************************
 * listar rutas (URL endpoints) disponibles en consola                                                                         *
 * https://stackoverflow.com/questions/58255000/how-can-i-get-all-the-routes-from-all-the-modules-and-controllers-available-on *
 * ***************************************************************************************************************************** */
interface IRoute {
  path: string;
  methods: string;
}
function normalizePath(path: string): string {
  return path
    .replace(new RegExp(`^/${GLOBAL_PREFIX}(/v\\d+)?`), '')
    .replace(/:\w+/g, '');
}
function routesLogger(app: INestApplication): void {
  const server = app.getHttpAdapter().getInstance();
  const router = server.router;

  const availableRoutes: IRoute[] = router.stack
    .filter((layer: any) => layer?.route)
    .map(
      (layer: any): IRoute => ({
        path: layer?.route?.path,
        methods: Object.keys(layer?.route?.methods)
          .map((method: string) => method?.toUpperCase())
          .join(', '),
      }),
    )
    .filter((item: IRoute) => (item?.path ?? '').includes(`/${GLOBAL_PREFIX}`));

  if (availableRoutes.length === 0) {
    log.info(`\x1b[33mNo hay endpoints\x1b[0m`);
    return;
  }

  log.info(`\x1b[34mtotal de rutas: ${availableRoutes.length}\x1b[0m`);
  log.info('\x1b[34mlista de endpoints:\x1b[0m');

  const sortedRoutes: IRoute[] = availableRoutes.sort(
    (a: IRoute, b: IRoute) => {
      const cleanA: string = normalizePath(a.path);
      const cleanB: string = normalizePath(b.path);

      return cleanA.localeCompare(cleanB);
    },
  );

  const header: string = `METODO${' '.repeat(20 - 6)} | URL`;
  const table: string = sortedRoutes
    .map((route: IRoute) => `${route.methods.padEnd(20)} | ${route.path}`)
    .join('\n');

  log.info(`\n${header}\n${'-'.repeat(50)}\n${table}`);
}

/* *********************
 * inicializar Nest JS *
 * ********************* */
async function bootstrap(): Promise<void> {
  log.info('\n');

  const app: INestApplication<any> = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const env: ConfigService<unknown, boolean> = app.get(ConfigService);

  const loggerService: LoggerService = app.get(LoggerService);
  loggerService.ensureLogDirectories();

  configExceptionFilter(app);
  configInterceptor(app);
  configPipes(app);

  app.use(json({ limit: '5mb' }));

  configCore(app);
  configSwagger(app);

  const PORT: number = env.get<number>(ENV_VARS.PORT)!;
  const ENVIRONMENT: string = env.get<string>(ENV_VARS.ENVIRONMENT)!;

  await app.listen(PORT);
  routesLogger(app);

  log.info(
    `\x1b[34mbackend ejecutandose en el puerto ${PORT} y apuntando al entorno env ${ENVIRONMENT}\x1b[0m`,
  );

  log.info('\n');
}

bootstrap();
