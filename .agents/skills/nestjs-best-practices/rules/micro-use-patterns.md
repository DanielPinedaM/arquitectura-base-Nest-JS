---
title: Usa correctamente los patrones de mensajes y eventos
impact: MEDIUM
impactDescription: Los patrones correctos aseguran una comunicación confiable entre microservicios
tags: microservices, message-pattern, event-pattern, communication
---

## Usa correctamente los patrones de mensajes y eventos

Los microservicios de NestJS soportan dos patrones de comunicación: request-response (MessagePattern) y basado en eventos (EventPattern). Usa MessagePattern cuando necesites una respuesta, y EventPattern para las notificaciones fire-and-forget. Comprender la diferencia evita bugs de comunicación.

**Incorrecto (usar el patrón equivocado para el caso de uso):**

```typescript
// Usa @MessagePattern para fire-and-forget
@Controller()
export class NotificationsController {
  @MessagePattern('user.created')
  async handleUserCreated(data: UserCreatedEvent) {
    // Esto ESPERA una respuesta, bloqueando al emisor
    await this.emailService.sendWelcome(data.email);
    // Si el email falla, el emisor recibe un error (¡acoplamiento!)
  }
}

// Usa @EventPattern esperando una respuesta
@Controller()
export class OrdersController {
  @EventPattern('inventory.check')
  async checkInventory(data: CheckInventoryDto) {
    const available = await this.inventory.check(data);
    return available; // ¡Este valor de retorno se IGNORA con @EventPattern!
  }
}

// Acoplamiento fuerte en el cliente
@Injectable()
export class UsersService {
  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.repo.save(dto);

    // Se bloquea hasta que el servicio de notificaciones responda
    await this.client.send('user.created', user).toPromise();
    // Si el servicio de notificaciones está caído, ¡la creación del usuario falla!

    return user;
  }
}
```

**Correcto (usa MessagePattern para request-response y EventPattern para fire-and-forget):**

```typescript
// MessagePattern: Request-Response (cuando NECESITAS una respuesta)
@Controller()
export class InventoryController {
  @MessagePattern({ cmd: 'check_inventory' })
  async checkInventory(data: CheckInventoryDto): Promise<InventoryResult> {
    const result = await this.inventoryService.check(data.productId, data.quantity);
    return result; // La respuesta se envía de vuelta a quien llamó
  }
}

// El cliente espera la respuesta
@Injectable()
export class OrdersService {
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Verifica el inventario - NECESITAMOS esta respuesta para continuar
    const inventory = await firstValueFrom(
      this.inventoryClient.send<InventoryResult>(
        { cmd: 'check_inventory' },
        { productId: dto.productId, quantity: dto.quantity },
      ),
    );

    if (!inventory.available) {
      throw new BadRequestException('Insufficient inventory');
    }

    return this.repo.save(dto);
  }
}

// EventPattern: Fire-and-Forget (para notificaciones, efectos secundarios)
@Controller()
export class NotificationsController {
  @EventPattern('user.created')
  async handleUserCreated(data: UserCreatedEvent): Promise<void> {
    // No se necesita un valor de retorno - solo procesa el evento
    await this.emailService.sendWelcome(data.email);
    await this.analyticsService.track('user_signup', data);
    // Si esto falla, no afecta al emisor
  }
}

// El cliente emite el evento sin esperar
@Injectable()
export class UsersService {
  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.repo.save(dto);

    // Fire and forget - no bloquea, no espera
    this.eventClient.emit('user.created', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });

    return user; // La creación del usuario tiene éxito independientemente del manejo del evento
  }
}

// Patrón híbrido para los eventos críticos
@Injectable()
export class OrdersService {
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.repo.save(dto);

    // Crítico: reserva del inventario (usa MessagePattern)
    const reserved = await firstValueFrom(
      this.inventoryClient.send({ cmd: 'reserve_inventory' }, {
        orderId: order.id,
        items: dto.items,
      }),
    );

    if (!reserved.success) {
      await this.repo.delete(order.id);
      throw new BadRequestException('Could not reserve inventory');
    }

    // No crítico: notificaciones (usa EventPattern)
    this.eventClient.emit('order.created', {
      orderId: order.id,
      userId: dto.userId,
      total: dto.total,
    });

    return order;
  }
}

// Patrones de manejo de errores
// Los errores de MessagePattern se propagan a quien llamó
@MessagePattern({ cmd: 'get_user' })
async getUser(userId: string): Promise<User> {
  const user = await this.repo.findOne({ where: { id: userId } });
  if (!user) {
    throw new RpcException('User not found'); // Lo recibe quien llamó
  }
  return user;
}

// Los errores de EventPattern deben manejarse localmente
@EventPattern('order.created')
async handleOrderCreated(data: OrderCreatedEvent): Promise<void> {
  try {
    await this.processOrder(data);
  } catch (error) {
    // Registra y potencialmente reintenta - no lances la excepción
    this.logger.error('Failed to process order event', error);
    await this.deadLetterQueue.add(data);
  }
}
```

Referencia: [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
