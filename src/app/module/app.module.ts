import { AuthModule } from '@/app/features/auth/auth.module';
import { DatabaseModule } from '@/app/module/database.module';
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

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: `environments/.env.${process?.env?.ENVIRONMENT ?? 'test'}`,
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
