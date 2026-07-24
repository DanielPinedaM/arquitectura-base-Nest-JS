import { AuthModule } from '@/app/features/auth/auth.module';
import { DatabaseModule } from '@/app/modules/database.module';
import { log } from '@/shared/data-types/constants/logger.const';
import { FilterModule } from '@/shared/filter/filter.module';
import { InterceptorModule } from '@/shared/interceptor/interceptor.module';
import { ServiceModule } from '@/shared/services/service.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import {
  ENV_VARS,
  EnvironmentClass,
  validateEnvironment,
} from 'environments/env-config';
import { existsSync } from 'fs-extra';

/** ruta del archivo de variables de entorno segun el NODE_ENV actual */
const ENV_FILE_PATH: string = `environments/.env.${process.env.NODE_ENV}`;

/**
 * si el archivo no existe, avisar con un mensaje claro en vez de fallar despues
 * con el error generico de validacion de variables de entorno
 */
if (!existsSync(ENV_FILE_PATH)) {
  const ERROR_MESSAGE = `no existe el archivo de variables de entorno NODE_ENV=${process.env.NODE_ENV}, verifique que el script haya recibido el flag --env-file correcto`;
  log.error(ERROR_MESSAGE);
  throw new Error(ERROR_MESSAGE);
}

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ENV_FILE_PATH,
      isGlobal: true,
      validate: (config: Record<string, any>) => validateEnvironment(config),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (env: ConfigService<EnvironmentClass>) => ({
        secret: env.get(ENV_VARS.JWT_SECRET_KEY, { infer: true }),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    //DatabaseModule,
    ServiceModule,
    AuthModule,
    FilterModule,
    InterceptorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
