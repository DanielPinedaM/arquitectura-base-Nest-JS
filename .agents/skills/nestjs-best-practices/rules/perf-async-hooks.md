---
title: Usa correctamente los lifecycle hooks asíncronos
impact: HIGH
impactDescription: Un manejo asíncrono incorrecto bloquea el arranque de la aplicación
tags: performance, lifecycle, async, hooks
---

## Usa correctamente los lifecycle hooks asíncronos

Los lifecycle hooks de NestJS (`onModuleInit`, `onApplicationBootstrap`, etc.) soportan operaciones asíncronas. Sin embargo, usarlos mal puede bloquear el arranque de la aplicación o provocar race conditions. Comprende el orden del ciclo de vida y usa los hooks de forma apropiada.

**Incorrecto (async fire-and-forget sin await):**

```typescript
// Async fire-and-forget sin await
@Injectable()
export class DatabaseService implements OnModuleInit {
  onModuleInit() {
    // Esto se ejecuta pero no bloquea - ¡la app arranca antes de que la base de datos esté lista!
    this.connect();
  }

  private async connect() {
    await this.pool.connect();
    console.log('Database connected');
  }
}

// Operaciones bloqueantes pesadas en el constructor
@Injectable()
export class ConfigService {
  private config: Config;

  constructor() {
    // BLOQUEA de forma síncrona toda la instanciación del módulo
    this.config = fs.readFileSync('config.json');
  }
}
```

**Correcto (devuelve promises desde los hooks asíncronos):**

```typescript
// Devuelve una promise desde los hooks asíncronos
@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;

  async onModuleInit(): Promise<void> {
    // NestJS espera a que esto termine antes de continuar
    await this.pool.connect();
    console.log('Database connected');
  }

  async onModuleDestroy(): Promise<void> {
    // Libera los recursos al apagar
    await this.pool.end();
    console.log('Database disconnected');
  }
}

// Usa onApplicationBootstrap para las dependencias entre módulos
@Injectable()
export class CacheWarmerService implements OnApplicationBootstrap {
  constructor(
    private cache: CacheService,
    private products: ProductsService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Todos los módulos están inicializados, es seguro precalentar la caché
    const products = await this.products.findPopular();
    await this.cache.warmup(products);
  }
}

// Inicialización pesada en hooks asíncronos, no en el constructor
@Injectable()
export class ConfigService implements OnModuleInit {
  private config: Config;

  constructor() {
    // Mantén el constructor síncrono y rápido
  }

  async onModuleInit(): Promise<void> {
    // Carga asíncrona en el lifecycle hook
    this.config = await this.loadConfig();
  }

  private async loadConfig(): Promise<Config> {
    const file = await fs.promises.readFile('config.json');
    return JSON.parse(file.toString());
  }

  get<T>(key: string): T {
    return this.config[key];
  }
}

// Habilita los shutdown hooks en main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks(); // Habilita el manejo de SIGTERM/SIGINT
  await app.listen(3000);
}
```

Referencia: [NestJS Lifecycle Events](https://docs.nestjs.com/fundamentals/lifecycle-events)
