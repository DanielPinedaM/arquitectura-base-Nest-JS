---
title: Implementa health checks para los microservicios
impact: MEDIUM-HIGH
impactDescription: Los health checks permiten que los orquestadores gestionen el ciclo de vida de los servicios
tags: microservices, health-checks, terminus, kubernetes
---

## Implementa health checks para los microservicios

Implementa liveness y readiness probes usando `@nestjs/terminus`. Los liveness checks determinan si el servicio debe reiniciarse. Los readiness checks determinan si el servicio puede aceptar tráfico. Unos health checks correctos permiten que Kubernetes y los load balancers enruten el tráfico correctamente.

**Incorrecto (un ping simple que no verifica las dependencias):**

```typescript
// Ping simple que no verifica las dependencias
@Controller('health')
export class HealthController {
  @Get()
  check(): string {
    return 'OK'; // El servicio podría no estar sano, pero devuelve OK
  }
}

// Health check que se bloquea con dependencias lentas
@Controller('health')
export class HealthController {
  @Get()
  async check(): Promise<string> {
    // Si la base de datos está lenta, el health check excede el timeout
    await this.userRepo.findOne({ where: { id: '1' } });
    await this.redis.ping();
    await this.externalApi.healthCheck();
    return 'OK';
  }
}
```

**Correcto (usa @nestjs/terminus para health checks completos):**

```typescript
// Usa @nestjs/terminus para health checks completos
import {
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  HealthCheck,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  // Liveness probe - ¿está vivo el servicio?
  @Get('live')
  @HealthCheck()
  liveness() {
    return this.health.check([
      // Solo verificaciones básicas
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB
    ]);
  }

  // Readiness probe - ¿puede el servicio manejar tráfico?
  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () =>
        this.http.pingCheck('redis', 'http://redis:6379', { timeout: 1000 }),
      () =>
        this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }

  // Health check profundo para depuración
  @Get('deep')
  @HealthCheck()
  deepCheck() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      () =>
        this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
      () =>
        this.http.pingCheck('external-api', 'https://api.example.com/health'),
    ]);
  }
}

// Indicador personalizado para la salud específica del negocio
@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  constructor(private queueService: QueueService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const queueStats = await this.queueService.getStats();

    const isHealthy = queueStats.failedCount < 100;
    const result = this.getStatus(key, isHealthy, {
      waiting: queueStats.waitingCount,
      active: queueStats.activeCount,
      failed: queueStats.failedCount,
    });

    if (!isHealthy) {
      throw new HealthCheckError('Queue unhealthy', result);
    }

    return result;
  }
}

// Indicador de salud de Redis
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@InjectRedis() private redis: Redis) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redis.ping();
      return this.getStatus(key, pong === 'PONG');
    } catch (error) {
      throw new HealthCheckError('Redis check failed', this.getStatus(key, false));
    }
  }
}

// Usa los indicadores personalizados
@Get('ready')
@HealthCheck()
readiness() {
  return this.health.check([
    () => this.db.pingCheck('database'),
    () => this.redis.isHealthy('redis'),
    () => this.queue.isHealthy('job-queue'),
  ]);
}

// Manejo del graceful shutdown
@Injectable()
export class GracefulShutdownService implements OnApplicationShutdown {
  private isShuttingDown = false;

  isShutdown(): boolean {
    return this.isShuttingDown;
  }

  async onApplicationShutdown(signal: string): Promise<void> {
    this.isShuttingDown = true;
    console.log(`Shutting down on ${signal}`);

    // Espera a las peticiones en curso
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

// El health check respeta el estado de apagado
@Get('ready')
@HealthCheck()
readiness() {
  if (this.shutdownService.isShutdown()) {
    throw new ServiceUnavailableException('Shutting down');
  }

  return this.health.check([
    () => this.db.pingCheck('database'),
  ]);
}
```

### Configuración de Kubernetes

```yaml
# Deployment de Kubernetes con probes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
spec:
  template:
    spec:
      containers:
        - name: api
          image: api-service:latest
          ports:
            - containerPort: 3000
          livenessProbe:
            httpGet:
              path: /health/live
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /health/live
              port: 3000
            initialDelaySeconds: 0
            periodSeconds: 5
            failureThreshold: 30
```

Referencia: [NestJS Terminus](https://docs.nestjs.com/recipes/terminus)
