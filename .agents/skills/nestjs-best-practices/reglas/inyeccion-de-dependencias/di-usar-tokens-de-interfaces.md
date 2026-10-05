---
title: Usa injection tokens para las interfaces
impact: HIGH
impactDescription: Permite una DI basada en interfaces en runtime
tags: dependency-injection, tokens, interfaces
---

## Usa injection tokens para las interfaces

Las interfaces de TypeScript se eliminan en tiempo de compilación y no pueden usarse como injection tokens. Usa tokens de tipo string, symbols o clases abstractas cuando quieras inyectar implementaciones de interfaces. Esto permite intercambiar implementaciones para el testing o para diferentes entornos.

**Incorrecto (la interfaz no puede usarse como token):**

```typescript
// La interfaz no puede usarse como injection token
interface PaymentGateway {
  charge(amount: number): Promise<PaymentResult>;
}

@Injectable()
export class StripeService implements PaymentGateway {
  charge(amount: number) { /* ... */ }
}

@Injectable()
export class OrdersService {
  // Esto NO funcionará - PaymentGateway no existe en runtime
  constructor(private payment: PaymentGateway) {}
}
```

**Correcto (tokens symbol o clases abstractas):**

```typescript
// Opción 1: Tokens string/Symbol (lo más flexible)
export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface PaymentGateway {
  charge(amount: number): Promise<PaymentResult>;
}

@Injectable()
export class StripeService implements PaymentGateway {
  async charge(amount: number): Promise<PaymentResult> {
    // Implementación de Stripe
  }
}

@Injectable()
export class MockPaymentService implements PaymentGateway {
  async charge(amount: number): Promise<PaymentResult> {
    return { success: true, id: 'mock-id' };
  }
}

// Registro en el módulo
@Module({
  providers: [
    {
      provide: PAYMENT_GATEWAY,
      useClass: process.env.NODE_ENV === 'test'
        ? MockPaymentService
        : StripeService,
    },
  ],
  exports: [PAYMENT_GATEWAY],
})
export class PaymentModule {}

// Inyección
@Injectable()
export class OrdersService {
  constructor(
    @Inject(PAYMENT_GATEWAY) private payment: PaymentGateway,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    await this.payment.charge(dto.amount);
  }
}

// Opción 2: Clase abstracta (conserva la información del tipo en runtime)
export abstract class PaymentGateway {
  abstract charge(amount: number): Promise<PaymentResult>;
}

@Injectable()
export class StripeService extends PaymentGateway {
  async charge(amount: number): Promise<PaymentResult> {
    // Implementación
  }
}

// No se necesita @Inject con una clase abstracta
@Injectable()
export class OrdersService {
  constructor(private payment: PaymentGateway) {}
}
```

Referencia: [NestJS Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers)
