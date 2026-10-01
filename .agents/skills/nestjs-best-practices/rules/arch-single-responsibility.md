---
title: Responsabilidad única para los servicios
impact: CRITICAL
impactDescription: "Más de un 40% de mejora en la testeabilidad"
tags: architecture, services, single-responsibility
---

## Responsabilidad única para los servicios

Cada servicio debe tener una responsabilidad única y bien definida. Evita los "god services" que manejan múltiples asuntos no relacionados. Si el nombre de un servicio incluye "And" o maneja más de un concepto del dominio, probablemente viola la responsabilidad única. Esto reduce la complejidad y mejora la testeabilidad en más de un 40%.

**Incorrecto (anti-pattern de god service):**

```typescript
// Anti-pattern de god service
@Injectable()
export class UserAndOrderService {
  constructor(
    private userRepo: UserRepository,
    private orderRepo: OrderRepository,
    private mailer: MailService,
    private payment: PaymentService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.userRepo.save(dto);
    await this.mailer.sendWelcome(user);
    return user;
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const order = await this.orderRepo.save({ userId, ...dto });
    await this.payment.charge(order);
    await this.mailer.sendOrderConfirmation(order);
    return order;
  }

  async calculateOrderStats(userId: string) {
    // Lógica de estadísticas mezclada
  }

  async validatePayment(orderId: string) {
    // Lógica de pagos mezclada
  }
}
```

**Correcto (servicios enfocados con responsabilidad única):**

```typescript
// Servicios enfocados con responsabilidad única
@Injectable()
export class UsersService {
  constructor(private userRepo: UserRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    return this.userRepo.save(dto);
  }

  async findById(id: string): Promise<User> {
    return this.userRepo.findOneOrFail({ where: { id } });
  }
}

@Injectable()
export class OrdersService {
  constructor(private orderRepo: OrderRepository) {}

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    return this.orderRepo.save({ userId, ...dto });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.find({ where: { userId } });
  }
}

@Injectable()
export class OrderStatsService {
  constructor(private orderRepo: OrderRepository) {}

  async calculateForUser(userId: string): Promise<OrderStats> {
    // Cálculo de estadísticas enfocado
  }
}

// Orquestación en el controller o en un orquestador dedicado
@Controller('orders')
export class OrdersController {
  constructor(
    private orders: OrdersService,
    private payment: PaymentService,
    private notifications: NotificationService,
  ) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    const order = await this.orders.create(user.id, dto);
    await this.payment.charge(order);
    await this.notifications.sendOrderConfirmation(order);
    return order;
  }
}
```

Referencia: [NestJS Providers](https://docs.nestjs.com/providers)
