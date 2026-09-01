import { log } from '@/shared/data-types/constants/logger.const';
import { createZodDto, type ZodDto } from 'nestjs-zod';
import { z } from 'zod';

/* *************************************
 * NOMBRES DE LAS VARIABLES DE ENTORNO *
 * ************************************* */
export enum ENV_VARS {
  // #region configurar Nest JS
  NODE_ENV = 'NODE_ENV',
  PORT = 'PORT',
  SHOW_LOGS = 'SHOW_LOGS',
  // #endregion configurar Nest JS

  // #region JWT
  JWT_SECRET_KEY = 'JWT_SECRET_KEY',
  // #endregion JWT

  // #region encriptar y desencriptar texto
  CRYPTO_SECRET_KEY = 'CRYPTO_SECRET_KEY',
  CRYPTO_IV = 'CRYPTO_IV',
  // #endregion encriptar y desencriptar texto

  // #region conexion a la base de datos
  DB_TYPE = 'DB_TYPE',
  DB_HOST = 'DB_HOST',
  DB_PORT = 'DB_PORT',
  DB_USERNAME = 'DB_USERNAME',
  DB_PASSWORD = 'DB_PASSWORD',
  DB_NAME = 'DB_NAME',
  DB_SCHEMA = 'DB_SCHEMA',
  DB_SSL = 'DB_SSL',
  DB_SYNCHRONIZE = 'DB_SYNCHRONIZE',
  DB_AUTO_LOAD_ENTITIES = 'DB_AUTO_LOAD_ENTITIES',
  DB_RETRY_ATTEMPTS = 'DB_RETRY_ATTEMPTS',
  DB_RETRY_DELAY = 'DB_RETRY_DELAY',
  // #endregion conexion a la base de datos
}

/** AES-128-CBC exige que la llave y el vector midan exactamente 16 bytes */
const AES_KEY_LENGTH: number = 16;

const envNumber = z.coerce.number();

const toBoolean = (value: unknown): boolean =>
  String(value).trim().toLowerCase() === 'true';

const envBoolean = z.preprocess(
  (value) => (value === undefined ? value : toBoolean(value)),
  z.boolean(),
);

/* *******************************
 * TIPAR LAS VARIABLES DE ENTORNO *
 * ******************************** */
const environmentSchema = z.object({
  // #region configurar Nest JS
  NODE_ENV: z.enum(['localhost', 'production', 'test']),

  PORT: envNumber,

  SHOW_LOGS: envBoolean,
  // #endregion configurar Nest JS

  // #region JWT
  JWT_SECRET_KEY: z.string(),
  // #endregion JWT

  // #region encriptar y desencriptar texto
  CRYPTO_SECRET_KEY: z
    .string()
    .length(
      AES_KEY_LENGTH,
      `CRYPTO_SECRET_KEY debe tener exactamente ${AES_KEY_LENGTH} caracteres porque AES-128-CBC usa una llave de ${AES_KEY_LENGTH} bytes`,
    ),

  CRYPTO_IV: z
    .string()
    .length(
      AES_KEY_LENGTH,
      `CRYPTO_IV debe tener exactamente ${AES_KEY_LENGTH} caracteres porque AES-128-CBC usa un vector de inicializacion de ${AES_KEY_LENGTH} bytes`,
    ),
  // #endregion encriptar y desencriptar texto

  // #region conexion a la base de datos
  DB_TYPE: z.string(),

  DB_HOST: z.string(),

  DB_PORT: envNumber,

  DB_USERNAME: z.string(),

  DB_PASSWORD: z.string(),

  DB_NAME: z.string(),

  DB_SCHEMA: z.string(),

  DB_SSL: envBoolean,

  DB_SYNCHRONIZE: envBoolean,

  DB_AUTO_LOAD_ENTITIES: envBoolean,

  DB_RETRY_ATTEMPTS: envNumber,

  DB_RETRY_DELAY: envNumber,
  // #endregion conexion a la base de datos
});

const EnvironmentClassBase: ZodDto<typeof environmentSchema, false> =
  createZodDto(environmentSchema);

export class EnvironmentClass extends EnvironmentClassBase {}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentClass {
  const validatedConfig = EnvironmentClass.schema.safeParse(config);

  if (!validatedConfig.success) {
    const errorsStringify = JSON.stringify(validatedConfig.error.issues);
    log.error(
      `\x1b[31m error al configurar tipos de datos a las variables de entorno, verifique que las keys del enum ENV_VARS y la class EnvironmentClass q hay en env-config.ts coincida con los archivos env q estan dentro de la carpeta envinronments ${errorsStringify}\x1b[0m`,
    );
    throw new Error(errorsStringify);
  }

  return validatedConfig.data;
}
