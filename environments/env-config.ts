import { log } from '@/shared/data-types/constants/logger.const';
import { plainToInstance, Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsString, validateSync } from 'class-validator';

/* *************************************
 * NOMBRES DE LAS VARIABLES DE ENTORNO *
 * ************************************* */
export enum ENV_VARS {
  // #region configurar Nest JS
  NODE_ENV  = 'NODE_ENV',
  PORT = 'PORT',
  SHOW_LOGS = 'SHOW_LOGS',
  // #endregion configurar Nest JS

  // #region JWT
  JWT_SECRET_KEY = 'JWT_SECRET_KEY',
  // #endregion JWT

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

/* *******************************
 * TIPAR LAS VARIABLES DE ENTORNO *
 * ******************************** */
export class EnvironmentClass {
  // #region configurar Nest JS
  @IsString()
  @IsIn(['localhost', 'production', 'test'])
  NODE_ENV!: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  PORT!: number;

  @Transform(({ value }) => String(value).trim().toLowerCase() === 'true')
  @IsBoolean()
  SHOW_LOGS!: boolean;
  // #endregion configurar Nest JS

  // #region JWT
  @IsString()
  JWT_SECRET_KEY!: string;
  // #endregion JWT

  // #region conexion a la base de datos
  @IsString()
  DB_TYPE!: string;

  @IsString()
  DB_HOST!: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  DB_PORT!: number;

  @IsString()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_NAME!: string;

  @IsString()
  DB_SCHEMA!: string;

  @Transform(({ value }) => String(value).trim().toLowerCase() === 'true')
  @IsBoolean()
  DB_SSL!: boolean;

  @Transform(({ value }) => String(value).trim().toLowerCase() === 'true')
  @IsBoolean()
  DB_SYNCHRONIZE!: boolean;

  @Transform(({ value }) => String(value).trim().toLowerCase() === 'true')
  @IsBoolean()
  DB_AUTO_LOAD_ENTITIES!: boolean;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  DB_RETRY_ATTEMPTS!: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  DB_RETRY_DELAY!: number;
  // #endregion conexion a la base de datos
}

export function validateEnvironment(
  config: Record<string, any>,
): EnvironmentClass {
  const validatedConfig = plainToInstance(EnvironmentClass, config, {
    enableImplicitConversion: false,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors?.length > 0) {
    const errorsStringify = JSON.stringify(errors);
    log.error(
      `\x1b[31m error al configurar tipos de datos a las variables de entorno, verifique que las keys del enum ENV_VARS y la class EnvironmentClass q hay en env-config.ts coincida con los archivos env q estan dentro de la carpeta envinronments ${errorsStringify}\x1b[0m`,
    );
    throw new Error(errorsStringify);
  }

  return validatedConfig;
}
