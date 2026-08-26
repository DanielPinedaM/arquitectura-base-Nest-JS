import { GLOBAL_PREFIX } from '@/shared/data-types/constants/api.const';
import { log } from '@/shared/data-types/constants/logger.const';
import { INestApplication } from '@nestjs/common';

/* ****************************************************************************************************************************
 * listar rutas (URL endpoints) disponibles en consola                                                                         *
 * https://stackoverflow.com/questions/58255000/how-can-i-get-all-the-routes-from-all-the-modules-and-controllers-available-on *
 * ***************************************************************************************************************************** */
interface IRoute {
  path: string;
  methods: string;
}

/** forma minima del router interno de express que necesita este archivo */
interface IRouteLayer {
  route?: {
    path?: string;
    methods?: Record<string, boolean>;
  };
}
interface IExpressApp {
  router: {
    stack: IRouteLayer[];
  };
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
function padCell(
  coloredText: string,
  plainText: string,
  width: number,
): string {
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

export function routesLogger(app: INestApplication): void {
  /* getInstance() devuelve la app de express sin tipar; se acota a la forma
     minima que necesita esta funcion en vez de trabajar sobre any */
  const server: IExpressApp = app.getHttpAdapter().getInstance() as IExpressApp;
  const router: IExpressApp['router'] = server.router;

  const availableRoutes: IRoute[] = router.stack
    .filter((layer: IRouteLayer) => layer?.route)
    .map(
      (layer: IRouteLayer): IRoute => ({
        path: layer?.route?.path ?? '',
        methods: Object.keys(layer?.route?.methods ?? {})
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
