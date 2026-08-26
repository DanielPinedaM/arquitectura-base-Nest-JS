import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ENV_VARS, EnvironmentClass } from 'environments/env-config';

/**
 * ConfigModule ya se registra como global en AppModule junto con la validacion
 * de las variables de entorno, por eso aqui no se vuelve a llamar a forRoot():
 * duplicarlo crearia providers repetidos y abriria la puerta a que convivan dos
 * configuraciones distintas.
 *
 * TypeOrmModuleOptions es una union discriminada por la key type y el motor solo
 * se conoce en runtime (DB_TYPE), por eso se afirma el tipo al final del objeto
 * en vez de tipar type como any */
const databaseConnection = (
  env: ConfigService<EnvironmentClass>,
): TypeOrmModuleOptions =>
  ({
    type: env.get<TypeOrmModuleOptions['type']>(ENV_VARS.DB_TYPE),
    host: env.get<string>(ENV_VARS.DB_HOST),
    port: env.get<number>(ENV_VARS.DB_PORT),
    username: env.get<string>(ENV_VARS.DB_USERNAME),
    password: env.get<string>(ENV_VARS.DB_PASSWORD),
    database: env.get<string>(ENV_VARS.DB_NAME),
    schema: env.get<string>(ENV_VARS.DB_SCHEMA),
    synchronize: env.get<boolean>(ENV_VARS.DB_SYNCHRONIZE),
    ssl: env.get<boolean>(ENV_VARS.DB_SSL),
    autoLoadEntities: env.get<boolean>(ENV_VARS.DB_AUTO_LOAD_ENTITIES),
    retryAttempts: env.get<number>(ENV_VARS.DB_RETRY_ATTEMPTS),
    retryDelay: env.get<number>(ENV_VARS.DB_RETRY_DELAY),
  }) as TypeOrmModuleOptions;

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (env: ConfigService<EnvironmentClass>) =>
        databaseConnection(env),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
