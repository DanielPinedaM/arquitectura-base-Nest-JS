import { AppModule } from '@/app/modules/app.module';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ENV_VARS, EnvironmentClass } from 'environments/env-config';
import { json } from 'express';

// #region configuracion de Nest JS
import {
  configCore,
  configExceptionFilter,
  configPipes,
} from '@/config/bootstrap/nest.bootstrap';
import { routesLogger } from '@/config/bootstrap/routes-logger.bootstrap';
import { configSwagger } from '@/config/bootstrap/swagger.bootstrap';
// #endregion configuracion de Nest JS

// #region logs
import { log } from '@/shared/data-types/constants/logger.const';
import { LoggerService } from '@/shared/services/logger.service';
// #endregion logs

/* *********************
 * inicializar Nest JS *
 * ********************* */
async function bootstrap(): Promise<void> {
  log.info('\n');

  const app: INestApplication = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const env: ConfigService<EnvironmentClass> = app.get(ConfigService);

  const loggerService: LoggerService = app.get(LoggerService);
  loggerService.ensureLogDirectories();

  configExceptionFilter(app);
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

void bootstrap();
