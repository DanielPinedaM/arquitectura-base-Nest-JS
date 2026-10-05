---
title: Usa una arquitectura basada en eventos para el desacoplamiento
impact: CRITICAL
impactDescription: Permite el procesamiento asíncrono y la modularidad
tags: architecture, events, decoupling
---

## Usa una arquitectura basada en eventos para el desacoplamiento

Usa `@nestjs/event-emitter` para los eventos dentro de un servicio y message brokers para la comunicación entre servicios. Los eventos permiten que los módulos reaccionen a los cambios sin dependencias directas, lo que mejora la modularidad y permite el procesamiento asíncrono.

**Incorrecto (acoplamiento directo entre servicios):**

```typescript
// Acoplamiento directo entre servicios
@Injectable()
export class OrdersService {
  constructor(
    private inventoryService: InventoryService,
    private emailService: EmailService,
    private analyticsService: AnalyticsService,
    private notificationService: NotificationService,
    private loyaltyService: LoyaltyService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.repo.save(dto);

    // Acoplamiento fuerte - OrdersService conoce a todos los consumidores
    await this.inventoryService.reserve(order.items);
    await this.emailService.sendConfirmation(order);
    await this.analyticsService.track('order_created', order);
    await this.notificationService.push(order.userId, 'Order placed');
    await this.loyaltyService.addPoints(order.userId, order.total);

    // Agregar un nuevo comportamiento requiere modificar este servicio
    return order;
  }
}
```

**Correcto (desacoplamiento basado en eventos):**

```typescript
// Usa EventEmitter para el desacoplamiento
import { EventEmitter2 } from '@nestjs/event-emitter';

// Define el evento
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly total: number,
  ) {}
}

// El servicio emite eventos
@Injectable()
export class OrdersService {
  constructor(
    private eventEmitter: EventEmitter2,
    private repo: Repository<Order>,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.repo.save(dto);

    // Emite el evento - sin conocer a los consumidores
    this.eventEmitter.emit(
      'order.created',
      new OrderCreatedEvent(order.id, order.userId, order.items, order.total),
    );

    return order;
  }
}

// Listeners en módulos separados
@Injectable()
export class InventoryListener {
  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.inventoryService.reserve(event.items);
  }
}

@Injectable()
export class EmailListener {
  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.emailService.sendConfirmation(event.orderId);
  }
}

@Injectable()
export class AnalyticsListener {
  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.analyticsService.track('order_created', {
      orderId: event.orderId,
      total: event.total,
    });
  }
}
```

Referencia: [NestJS Events](https://docs.nestjs.com/techniques/events)
