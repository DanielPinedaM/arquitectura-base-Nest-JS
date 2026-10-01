---
title: Respeta el Liskov Substitution Principle
impact: HIGH
impactDescription: Asegura que las implementaciones sean realmente intercambiables sin romper a quienes las llaman
tags: dependency-injection, inheritance, solid, lsp
---

## Respeta el Liskov Substitution Principle

Los subtipos deben poder sustituir a sus tipos base sin alterar la corrección del programa. En NestJS con inyección de dependencias, esto significa que cualquier implementación de una interfaz o clase abstracta debe respetar el contrato por completo. Un servicio de pagos mock usado en los tests debe comportarse como un servicio de pagos real (devolver estructuras similares, manejar los errores de la misma forma). Violar el LSP provoca bugs sutiles al intercambiar implementaciones.

**Incorrecto (la implementación viola el contrato):**

```typescript
// Interfaz base con un contrato claro
interface PaymentGateway {
  /**
   * Cobra el monto especificado.
   * @returns PaymentResult en caso de éxito
   * @throws PaymentFailedException si el pago falla
   */
  charge(amount: number, currency: string): Promise<PaymentResult>;
}

// Implementación de producción - sigue el contrato
@Injectable()
export class StripeService implements PaymentGateway {
  async charge(amount: number, currency: string): Promise<PaymentResult> {
    const response = await this.stripe.charges.create({ amount, currency });
    return { success: true, transactionId: response.id, amount };
  }
}

// Mock que viola el LSP - ¡comportamiento diferente!
@Injectable()
export class MockPaymentService implements PaymentGateway {
  async charge(amount: number, currency: string): Promise<PaymentResult> {
    // VIOLACIÓN 1: Lanza una excepción con un input válido (el contrato dice que devuelve PaymentResult)
    if (amount > 1000) {
      throw new Error('Mock does not support large amounts');
    }

    // VIOLACIÓN 2: Devuelve null en lugar de PaymentResult
    if (currency !== 'USD') {
      return null as any; // El servicio real convertiría o rechazaría correctamente
    }

    // VIOLACIÓN 3: Falta un campo obligatorio
    return { success: true } as PaymentResult; // ¡Falta transactionId!
  }
}

// El consumidor confía en el contrato
@Injectable()
export class OrdersService {
  constructor(@Inject(PAYMENT_GATEWAY) private payment: PaymentGateway) {}

  async checkout(order: Order): Promise<void> {
    const result = await this.payment.charge(order.total, order.currency);
    // Esto falla con MockPaymentService:
    await this.saveTransaction(result.transactionId); // ¡undefined!
    await this.sendReceipt(result); // ¡podría ser null!
  }
}
```

**Correcto (las implementaciones respetan el contrato):**

```typescript
// Interfaz bien definida con el comportamiento documentado
interface PaymentGateway {
  /**
   * Cobra el monto especificado.
   * @param amount - Monto en la unidad monetaria más pequeña (centavos)
   * @param currency - Código de moneda ISO 4217
   * @returns PaymentResult con transactionId, estado de éxito y monto
   * @throws PaymentFailedException si el cobro es rechazado
   * @throws InvalidCurrencyException si la moneda no está soportada
   */
  charge(amount: number, currency: string): Promise<PaymentResult>;

  /**
   * Reembolsa un cobro previo.
   * @throws TransactionNotFoundException si transactionId es inválido
   */
  refund(transactionId: string, amount?: number): Promise<RefundResult>;
}

// Implementación de producción
@Injectable()
export class StripeService implements PaymentGateway {
  async charge(amount: number, currency: string): Promise<PaymentResult> {
    try {
      const response = await this.stripe.charges.create({ amount, currency });
      return {
        success: true,
        transactionId: response.id,
        amount: response.amount,
      };
    } catch (error) {
      if (error.type === 'card_error') {
        throw new PaymentFailedException(error.message);
      }
      throw error;
    }
  }

  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    // Implementación...
  }
}

// Mock que respeta el LSP - mismo contrato, misma forma de comportamiento
@Injectable()
export class MockPaymentService implements PaymentGateway {
  private transactions = new Map<string, PaymentResult>();

  async charge(amount: number, currency: string): Promise<PaymentResult> {
    // Respeta el contrato: valida la moneda como lo haría el servicio real
    if (!['USD', 'EUR', 'GBP'].includes(currency)) {
      throw new InvalidCurrencyException(`Unsupported currency: ${currency}`);
    }

    // Simula un rechazo para escenarios de test específicos
    if (amount === 99999) {
      throw new PaymentFailedException('Card declined (test scenario)');
    }

    // Devuelve la misma estructura que producción
    const result: PaymentResult = {
      success: true,
      transactionId: `mock_${Date.now()}_${Math.random().toString(36)}`,
      amount,
    };

    this.transactions.set(result.transactionId, result);
    return result;
  }

  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    // Respeta el contrato: lanza una excepción si no se encuentra la transacción
    if (!this.transactions.has(transactionId)) {
      throw new TransactionNotFoundException(transactionId);
    }

    return {
      success: true,
      refundId: `refund_${transactionId}`,
      amount: amount ?? this.transactions.get(transactionId)!.amount,
    };
  }
}

// El consumidor puede intercambiar implementaciones de forma segura
@Injectable()
export class OrdersService {
  constructor(@Inject(PAYMENT_GATEWAY) private payment: PaymentGateway) {}

  async checkout(order: Order): Promise<Order> {
    try {
      const result = await this.payment.charge(order.total, order.currency);
      // Funciona tanto con StripeService como con MockPaymentService
      order.transactionId = result.transactionId;
      order.status = 'paid';
      return order;
    } catch (error) {
      if (error instanceof PaymentFailedException) {
        order.status = 'payment_failed';
        return order;
      }
      throw error;
    }
  }
}
```

**Testing del cumplimiento del LSP:**

```typescript
// Suite de tests compartida que cualquier implementación debe pasar
function testPaymentGatewayContract(
  createGateway: () => PaymentGateway,
) {
  describe('PaymentGateway contract', () => {
    let gateway: PaymentGateway;

    beforeEach(() => {
      gateway = createGateway();
    });

    it('returns PaymentResult with all required fields', async () => {
      const result = await gateway.charge(1000, 'USD');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('amount');
      expect(typeof result.transactionId).toBe('string');
    });

    it('throws InvalidCurrencyException for unsupported currency', async () => {
      await expect(gateway.charge(1000, 'INVALID'))
        .rejects.toThrow(InvalidCurrencyException);
    });

    it('throws TransactionNotFoundException for invalid refund', async () => {
      await expect(gateway.refund('nonexistent'))
        .rejects.toThrow(TransactionNotFoundException);
    });
  });
}

// Ejecútalo contra todas las implementaciones
describe('StripeService', () => {
  testPaymentGatewayContract(() => new StripeService(mockStripeClient));
});

describe('MockPaymentService', () => {
  testPaymentGatewayContract(() => new MockPaymentService());
});
```

Referencia: [Liskov Substitution Principle](https://en.wikipedia.org/wiki/Liskov_substitution_principle)
