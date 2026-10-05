---
title: Evita el anti-pattern Service Locator
impact: CRITICAL
impactDescription: Oculta las dependencias y rompe la testeabilidad
tags: dependency-injection, anti-patterns, testing
---

## Evita el anti-pattern Service Locator

Evita usar `ModuleRef.get()` o contenedores globales para resolver dependencias en runtime. Esto oculta las dependencias, hace que el código sea más difícil de testear y rompe los beneficios de la inyección de dependencias. En su lugar, usa la inyección por constructor.

**Incorrecto (anti-pattern Service Locator):**

```typescript
// Usa ModuleRef para obtener dependencias dinámicamente
@Injectable()
export class OrdersService {
  constructor(private moduleRef: ModuleRef) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Las dependencias están ocultas - no son visibles en el constructor
    const usersService = this.moduleRef.get(UsersService);
    const inventoryService = this.moduleRef.get(InventoryService);
    const paymentService = this.moduleRef.get(PaymentService);

    const user = await usersService.findOne(dto.userId);
    // ... resto de la lógica
  }
}

// Contenedor singleton global
class ServiceContainer {
  private static instance: ServiceContainer;
  private services = new Map<string, any>();

  static getInstance(): ServiceContainer {
    if (!this.instance) {
      this.instance = new ServiceContainer();
    }
    return this.instance;
  }

  get<T>(key: string): T {
    return this.services.get(key);
  }
}
```

**Correcto (inyección por constructor con dependencias explícitas):**

```typescript
// Usa la inyección por constructor - las dependencias son explícitas
@Injectable()
export class OrdersService {
  constructor(
    private usersService: UsersService,
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const user = await this.usersService.findOne(dto.userId);
    const inventory = await this.inventoryService.check(dto.items);
    // Las dependencias son claras y testeables
  }
}

// Fácil de testear con mocks
describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: PaymentService, useValue: mockPaymentService },
      ],
    }).compile();

    service = module.get(OrdersService);
  });
});

// VÁLIDO: Factory pattern para la instanciación dinámica
@Injectable()
export class HandlerFactory {
  constructor(private moduleRef: ModuleRef) {}

  getHandler(type: string): Handler {
    switch (type) {
      case 'email':
        return this.moduleRef.get(EmailHandler);
      case 'sms':
        return this.moduleRef.get(SmsHandler);
      default:
        return this.moduleRef.get(DefaultHandler);
    }
  }
}
```

Referencia: [NestJS Module Reference](https://docs.nestjs.com/fundamentals/module-ref)
