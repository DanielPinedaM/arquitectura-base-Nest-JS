---
title: Usa transacciones para las operaciones de múltiples pasos
impact: MEDIUM-HIGH
impactDescription: Asegura la consistencia de los datos en las operaciones de múltiples pasos
tags: database, transactions, typeorm, consistency
---

## Usa transacciones para las operaciones de múltiples pasos

Cuando múltiples operaciones de base de datos deben tener éxito o fallar juntas, envuélvelas en una transacción. Esto evita actualizaciones parciales que dejan tus datos en un estado inconsistente. Usa las APIs de transacciones de TypeORM o el query runner del DataSource para los escenarios complejos.

**Incorrecto (múltiples saves sin transacción):**

```typescript
// Múltiples saves sin transacción
@Injectable()
export class OrdersService {
  async createOrder(userId: string, items: OrderItem[]): Promise<Order> {
    // Si cualquier paso falla, los datos quedan inconsistentes
    const order = await this.orderRepo.save({ userId, status: 'pending' });

    for (const item of items) {
      await this.orderItemRepo.save({ orderId: order.id, ...item });
      await this.inventoryRepo.decrement({ productId: item.productId }, 'stock', item.quantity);
    }

    await this.paymentService.charge(order.id);
    // Si el pago falla, ¡la orden y el inventario ya fueron modificados!

    return order;
  }
}
```

**Correcto (usa DataSource.transaction para un rollback automático):**

```typescript
// Usa DataSource.transaction() para un rollback automático
@Injectable()
export class OrdersService {
  constructor(private dataSource: DataSource) {}

  async createOrder(userId: string, items: OrderItem[]): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      // Todas las operaciones usan el mismo manager transaccional
      const order = await manager.save(Order, { userId, status: 'pending' });

      for (const item of items) {
        await manager.save(OrderItem, { orderId: order.id, ...item });
        await manager.decrement(
          Inventory,
          { productId: item.productId },
          'stock',
          item.quantity,
        );
      }

      // Si esto lanza una excepción, se hace rollback de todo
      await this.paymentService.chargeWithManager(manager, order.id);

      return order;
    });
  }
}

// QueryRunner para el control manual de la transacción
@Injectable()
export class TransferService {
  constructor(private dataSource: DataSource) {}

  async transfer(fromId: string, toId: string, amount: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Debita la cuenta de origen
      await queryRunner.manager.decrement(
        Account,
        { id: fromId },
        'balance',
        amount,
      );

      // Verifica que haya fondos suficientes
      const source = await queryRunner.manager.findOne(Account, {
        where: { id: fromId },
      });
      if (source.balance < 0) {
        throw new BadRequestException('Insufficient funds');
      }

      // Acredita la cuenta de destino
      await queryRunner.manager.increment(
        Account,
        { id: toId },
        'balance',
        amount,
      );

      // Registra la transacción
      await queryRunner.manager.save(TransactionLog, {
        fromId,
        toId,
        amount,
        timestamp: new Date(),
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

// Método del repository con soporte de transacciones
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async createWithProfile(
    userData: CreateUserDto,
    profileData: CreateProfileDto,
  ): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.save(User, userData);
      await manager.save(Profile, { ...profileData, userId: user.id });
      return user;
    });
  }
}
```

Referencia: [TypeORM Transactions](https://typeorm.io/transactions)
