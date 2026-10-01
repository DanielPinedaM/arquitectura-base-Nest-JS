---
title: Maneja correctamente los errores asíncronos
impact: HIGH
impactDescription: Evita que el proceso haga crash por rejections no manejadas
tags: error-handling, async, promises
---

## Maneja correctamente los errores asíncronos

NestJS captura automáticamente los errores de los route handlers asíncronos, pero los errores de las tareas en segundo plano, de los event handlers y de las promises creadas manualmente pueden hacer que tu aplicación haga crash. Maneja siempre los errores asíncronos de forma explícita y usa handlers globales como red de seguridad.

**Incorrecto (fire-and-forget sin manejo de errores):**

```typescript
// Fire-and-forget sin manejo de errores
@Injectable()
export class UsersService {
  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.repo.save(dto);

    // Fire and forget - si esto falla, ¡el error no se maneja!
    this.emailService.sendWelcome(user.email);

    return user;
  }
}

// Promise no manejada en un event handler
@Injectable()
export class OrdersService {
  @OnEvent('order.created')
  handleOrderCreated(event: OrderCreatedEvent) {
    // ¡Esto devuelve una promise pero no se hace await!
    this.processOrder(event);
    // Los errores harán crash del proceso
  }

  private async processOrder(event: OrderCreatedEvent): Promise<void> {
    await this.inventoryService.reserve(event.items);
    await this.notificationService.send(event.userId);
  }
}

// Falta un try-catch en las tareas programadas
@Cron('0 0 * * *')
async dailyCleanup(): Promise<void> {
  await this.cleanupService.run();
  // Si esto lanza una excepción, no hay manejo de errores
}
```

**Correcto (manejo explícito de errores asíncronos):**

```typescript
// Maneja el fire-and-forget con un catch explícito
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.repo.save(dto);

    // Captura y registra los errores de forma explícita
    this.emailService.sendWelcome(user.email).catch((error) => {
      this.logger.error('Failed to send welcome email', error.stack);
      // Opcionalmente, encólalo para reintentar
    });

    return user;
  }
}

// Maneja correctamente los event handlers asíncronos
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      await this.processOrder(event);
    } catch (error) {
      this.logger.error('Failed to process order', { event, error });
      // No vuelvas a lanzarlo - haría crash del proceso
      await this.deadLetterQueue.add('order.created', event);
    }
  }
}

// Tareas programadas seguras
@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  @Cron('0 0 * * *')
  async dailyCleanup(): Promise<void> {
    try {
      await this.cleanupService.run();
      this.logger.log('Daily cleanup completed');
    } catch (error) {
      this.logger.error('Daily cleanup failed', error.stack);
      // Lógica de alerta o de reintento
    }
  }
}

// Handler global de rejections no manejadas en main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  await app.listen(3000);
}
```

Referencia: [Node.js Unhandled Rejections](https://nodejs.org/api/process.html#event-unhandledrejection)
