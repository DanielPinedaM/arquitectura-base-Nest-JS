---
title: Implementa el graceful shutdown
impact: LOW-MEDIUM
impactDescription: Un manejo correcto del apagado asegura deployments sin tiempo de inactividad
tags: devops, graceful-shutdown, lifecycle, kubernetes
---

## Implementa el graceful shutdown

Maneja las señales SIGTERM y SIGINT para apagar de forma ordenada tu aplicación de NestJS. Deja de aceptar nuevas peticiones, espera a que terminen las peticiones en curso, cierra las conexiones a la base de datos y libera los recursos. Esto evita la pérdida de datos y los errores de conexión durante los deployments.

**Incorrecto (ignorar las señales de apagado):**

```typescript
// Ignora las señales de apagado
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  // La app hace crash de inmediato con SIGTERM
  // Las peticiones en curso fallan
  // Las conexiones a la base de datos se cierran abruptamente
}

// Tareas de larga duración sin cancelación
@Injectable()
export class ProcessingService {
  async processLargeFile(file: File): Promise<void> {
    // No hay forma de interrumpir esto durante el apagado
    for (let i = 0; i < file.chunks.length; i++) {
      await this.processChunk(file.chunks[i]);
      // Puede ejecutarse durante minutos, bloqueando el apagado
    }
  }
}
```

**Correcto (habilita los shutdown hooks y maneja la limpieza):**

```typescript
// Habilita los shutdown hooks en main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita los shutdown hooks
  app.enableShutdownHooks();

  // Opcional: agrega un timeout para el apagado forzado
  const server = await app.listen(3000);
  server.setTimeout(30000); // Timeout de 30 segundos

  // Maneja el graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, starting graceful shutdown...`);

      // Deja de aceptar nuevas conexiones
      server.close(async () => {
        console.log('HTTP server closed');
        await app.close();
        process.exit(0);
      });

      // Fuerza la salida después del timeout
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    });
  });
}

// Lifecycle hooks para la limpieza
@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  private readonly connections: Connection[] = [];

  async onApplicationShutdown(signal?: string): Promise<void> {
    console.log(`Database service shutting down on ${signal}`);

    // Cierra todas las conexiones de forma ordenada
    await Promise.all(
      this.connections.map((conn) => conn.close()),
    );

    console.log('All database connections closed');
  }
}

// Procesador de colas con graceful shutdown
@Injectable()
export class QueueService implements OnApplicationShutdown, OnModuleDestroy {
  private isShuttingDown = false;

  onModuleDestroy(): void {
    this.isShuttingDown = true;
  }

  async onApplicationShutdown(): Promise<void> {
    // Espera a que terminen los trabajos actuales
    await this.queue.close();
  }

  async processJob(job: Job): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('Service is shutting down');
    }
    await this.doWork(job);
  }
}

// Limpieza del gateway de WebSocket
@WebSocketGateway()
export class EventsGateway implements OnApplicationShutdown {
  @WebSocketServer()
  server: Server;

  async onApplicationShutdown(): Promise<void> {
    // Notifica a todos los clientes conectados
    this.server.emit('shutdown', { message: 'Server is shutting down' });

    // Cierra todas las conexiones
    this.server.disconnectSockets();
  }
}

// Integración con el health check
@Injectable()
export class ShutdownService {
  private isShuttingDown = false;

  startShutdown(): void {
    this.isShuttingDown = true;
  }

  isShutdown(): boolean {
    return this.isShuttingDown;
  }
}

@Controller('health')
export class HealthController {
  constructor(private shutdownService: ShutdownService) {}

  @Get('ready')
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    // Devuelve 503 durante el apagado - k8s deja de enviar tráfico
    if (this.shutdownService.isShutdown()) {
      throw new ServiceUnavailableException('Shutting down');
    }

    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}

// Integración con el apagado
@Injectable()
export class AppShutdownService implements OnApplicationShutdown {
  constructor(private shutdownService: ShutdownService) {}

  async onApplicationShutdown(): Promise<void> {
    // Primero lo marca como no sano
    this.shutdownService.startShutdown();

    // Espera a que k8s actualice los endpoints
    await this.sleep(5000);

    // Luego procede con la limpieza
  }
}

// Seguimiento de las peticiones en curso
@Injectable()
export class RequestTracker implements NestMiddleware, OnApplicationShutdown {
  private activeRequests = 0;
  private isShuttingDown = false;
  private shutdownPromise: Promise<void> | null = null;
  private resolveShutdown: (() => void) | null = null;

  use(req: Request, res: Response, next: NextFunction): void {
    if (this.isShuttingDown) {
      res.status(503).send('Service Unavailable');
      return;
    }

    this.activeRequests++;

    res.on('finish', () => {
      this.activeRequests--;
      if (this.isShuttingDown && this.activeRequests === 0 && this.resolveShutdown) {
        this.resolveShutdown();
      }
    });

    next();
  }

  async onApplicationShutdown(): Promise<void> {
    this.isShuttingDown = true;

    if (this.activeRequests > 0) {
      console.log(`Waiting for ${this.activeRequests} requests to complete`);
      this.shutdownPromise = new Promise((resolve) => {
        this.resolveShutdown = resolve;
      });

      // Espera con un timeout
      await Promise.race([
        this.shutdownPromise,
        new Promise((resolve) => setTimeout(resolve, 30000)),
      ]);
    }

    console.log('All requests completed');
  }
}
```

Referencia: [NestJS Lifecycle Events](https://docs.nestjs.com/fundamentals/lifecycle-events)
