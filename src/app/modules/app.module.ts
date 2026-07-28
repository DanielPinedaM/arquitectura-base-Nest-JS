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

/**
 * el flag --env-file de los scripts de package.json es el unico que carga el
 * archivo de variables de entorno, y lo hace antes de que se ejecute esta linea.
 * si NODE_ENV no existe es porque el script no recibio el flag, entonces avisar
 * con un mensaje claro en vez de fallar despues con el error generico de
 * validacion de variables de entorno */
if (!process.env.NODE_ENV) {
  throw new Error('❌ Error: no esta definida la variable de entorno NODE_ENV, verifique que el script haya recibido el flag --env-file correcto');
}

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      /**
       * no volver a leer ningun archivo .env porque el flag --env-file ya cargo
       * las variables en process.env, que de todas formas tiene prioridad sobre
       * lo que lea ConfigModule. asi solo hay una fuente de verdad y es imposible
       * que se carguen dos ambientes distintos al mismo tiempo */
      ignoreEnvFile: true,
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
