import { AppModule } from '@/app/modules/app.module';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ENV_VARS, EnvironmentClass } from 'environments/env-config';
import { json } from 'express';

// #region Exception Filter
import { GlobalExceptionFilter } from '@/shared/filter/global-exception.filter';
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
  app.useGlobalFilters(app.get(GlobalExceptionFilter));
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
  const env: ConfigService<EnvironmentClass> = app.get(ConfigService);
  const NODE_ENV: string = env.get<string>(ENV_VARS.NODE_ENV)!;

  /**
   * no montar la documentacion de la API en produccion para no exponerla
   * publicamente. el ambiente se lee desde ConfigService, no desde process.env */
  if (NODE_ENV === 'production') return;

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

// #region estilos de la tabla de endpoints

/** codigos de color ANSI para la consola */
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
} as const;

/** color con el que se pinta cada verbo HTTP */
const METHOD_COLOR: Record<string, string> = {
  GET: ANSI.green,
  POST: ANSI.blue,
  PUT: ANSI.yellow,
  PATCH: ANSI.magenta,
  DELETE: ANSI.red,
  OPTIONS: ANSI.cyan,
  HEAD: ANSI.cyan,
};

/**
 * la tabla se dibuja solo con ASCII (+ - | = ) y sin tildes a proposito.
 *
 * pino-pretty corre en un worker que escribe los bytes directo al descriptor de
 * archivo, sin pasar por la capa TTY de node que convierte a UTF-16. la consola
 * de windows decodifica esos bytes con su codepage OEM, asi que cualquier
 * caracter fuera de ASCII (bordes de caja unicode, tildes) se veria como basura.
 *
 * los colores ANSI si funcionan, por eso el estilo se apoya en color y no en
 * caracteres especiales */
const METHOD_HEADER: string = 'METODO';
const URL_HEADER: string = 'URL';

/**
rellena con espacios a la derecha hasta completar el ancho de la columna.
el texto se mide sin colores para que el borde de la tabla quede alineado */
function padCell(coloredText: string, plainText: string, width: number): string {
  return `${coloredText}${' '.repeat(Math.max(0, width - plainText.length))}`;
}

/** pinta cada verbo HTTP de la celda con su propio color */
function colorMethods(methods: string): string {
  return methods
    .split(', ')
    .map(
      (method: string) =>
        `${METHOD_COLOR[method] ?? ANSI.gray}${method}${ANSI.reset}`,
    )
    .join(`${ANSI.gray}, ${ANSI.reset}`);
}

/** atenua el prefijo global y la version, y resalta los parametros de la URL */
function colorPath(path: string): string {
  return path
    .replace(
      new RegExp(`^/${GLOBAL_PREFIX}(/v\\d+)?`),
      (prefix: string) => `${ANSI.gray}${prefix}${ANSI.reset}`,
    )
    .replace(/:\w+/g, (param: string) => `${ANSI.cyan}${param}${ANSI.reset}`);
}

// #endregion estilos de la tabla de endpoints
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

  // ancho de cada columna segun su contenido mas largo
  const methodWidth: number = Math.max(
    METHOD_HEADER.length,
    ...sortedRoutes.map((route: IRoute) => route.methods.length),
  );
  const urlWidth: number = Math.max(
    URL_HEADER.length,
    ...sortedRoutes.map((route: IRoute) => route.path.length),
  );

  /** borde horizontal de la tabla con el caracter de relleno que reciba */
  const border = (fill: string): string =>
    `${ANSI.gray}+${fill.repeat(methodWidth + 2)}+${fill.repeat(
      urlWidth + 2,
    )}+${ANSI.reset}`;

  /** separador vertical entre celdas */
  const pipe: string = `${ANSI.gray}|${ANSI.reset}`;

  const headerRow: string =
    `${pipe} ${ANSI.bold}${padCell(METHOD_HEADER, METHOD_HEADER, methodWidth)}${ANSI.reset} ` +
    `${pipe} ${ANSI.bold}${padCell(URL_HEADER, URL_HEADER, urlWidth)}${ANSI.reset} ${pipe}`;

  const rows: string[] = sortedRoutes.map(
    (route: IRoute) =>
      `${pipe} ${padCell(colorMethods(route.methods), route.methods, methodWidth)} ` +
      `${pipe} ${padCell(colorPath(route.path), route.path, urlWidth)} ${pipe}`,
  );

  const table: string = [
    border('-'),
    headerRow,
    // el borde con '=' separa el encabezado de los datos
    border('='),
    ...rows,
    border('-'),
  ].join('\n');

  log.info(`\n${table}`);
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
  const NODE_ENV: string = env.get<string>(ENV_VARS.NODE_ENV)!;

  await app.listen(PORT);
  routesLogger(app);

  log.info(
    `\x1b[34mbackend ejecutandose en el puerto ${PORT} y apuntando a variable de entorno .env.${NODE_ENV}\x1b[0m`,
  );

  log.info('\n');
}

bootstrap();
