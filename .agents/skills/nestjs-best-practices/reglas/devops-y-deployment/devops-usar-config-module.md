---
title: Usa ConfigModule para la configuración de entornos
impact: LOW-MEDIUM
impactDescription: Una configuración correcta evita fallos en los deployments
tags: devops, configuration, environment, validation
---

## Usa ConfigModule para la configuración de entornos

Usa `@nestjs/config` para la configuración basada en entornos. Valida la configuración al arrancar para fallar rápido ante configuraciones incorrectas. Usa configuración con namespaces para la organización y la type safety.

**Incorrecto (acceder a process.env directamente):**

```typescript
// Accede a process.env directamente
@Injectable()
export class DatabaseService {
  constructor() {
    // Sin validación, puede fallar en runtime
    this.connection = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT), // NaN si falta
      password: process.env.DB_PASSWORD, // undefined si falta
    });
  }
}

// Acceso disperso a las variables de entorno
@Injectable()
export class EmailService {
  sendEmail() {
    // Distintos servicios acceden al entorno de forma diferente
    const apiKey = process.env.SENDGRID_API_KEY || 'default';
    // Los errores tipográficos pasan desapercibidos: process.env.SENDGRID_API_KY
  }
}
```

**Correcto (usa @nestjs/config con validación):**

```typescript
// Configura una configuración validada
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import * as Joi from 'joi';

// config/database.config.ts
export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}));

// config/app.config.ts
export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
}));

// config/validation.schema.ts
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  REDIS_URL: Joi.string().uri().required(),
});

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en todas partes sin importarlo
      load: [databaseConfig, appConfig],
      validationSchema,
      validationOptions: {
        abortEarly: true, // Se detiene en el primer error
        allowUnknown: true, // Permite otras variables de entorno
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class AppModule {}

// Acceso a la configuración con type safety
export interface AppConfig {
  port: number;
  environment: 'development' | 'production' | 'test';
  apiPrefix: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

// Acceso con type safety
@Injectable()
export class AppService {
  constructor(private config: ConfigService) {}

  getPort(): number {
    // Type safety con genéricos
    return this.config.get<number>('app.port');
  }

  getDatabaseConfig(): DatabaseConfig {
    return this.config.get<DatabaseConfig>('database');
  }
}

// Inyecta directamente la configuración con namespace
@Injectable()
export class DatabaseService {
  constructor(
    @Inject(databaseConfig.KEY)
    private dbConfig: ConfigType<typeof databaseConfig>,
  ) {
    // ¡Inferencia de tipos completa!
    const host = this.dbConfig.host; // string
    const port = this.dbConfig.port; // number
  }
}

// Soporte de archivos de entorno
ConfigModule.forRoot({
  envFilePath: [
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    '.env.local',
    '.env',
  ],
});

// .env.development
// DB_HOST=localhost
// DB_PORT=5432

// .env.production
// DB_HOST=prod-db.example.com
// DB_PORT=5432
```

Referencia: [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
