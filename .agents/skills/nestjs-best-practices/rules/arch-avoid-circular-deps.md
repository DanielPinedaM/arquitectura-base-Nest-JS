---
title: Evita las dependencias circulares
impact: CRITICAL
impactDescription: "Causa número 1 de crashes en runtime"
tags: architecture, modules, dependencies
---

## Evita las dependencias circulares

Las dependencias circulares ocurren cuando el Módulo A importa el Módulo B, y el Módulo B importa el Módulo A (directa o transitivamente). A veces NestJS puede resolverlas mediante forward references, pero indican problemas de arquitectura y deben evitarse. Esta es la causa número 1 de crashes en runtime en las aplicaciones de NestJS.

**Incorrecto (imports circulares entre módulos):**

```typescript
// users.module.ts
@Module({
  imports: [OrdersModule], // Orders necesita a Users, Users necesita a Orders = circular
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// orders.module.ts
@Module({
  imports: [UsersModule], // ¡Dependencia circular!
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
```

**Correcto (extrae la lógica compartida o usa eventos):**

```typescript
// Opción 1: Extrae la lógica compartida a un tercer módulo
// shared.module.ts
@Module({
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {}

// users.module.ts
@Module({
  imports: [SharedModule],
  providers: [UsersService],
})
export class UsersModule {}

// orders.module.ts
@Module({
  imports: [SharedModule],
  providers: [OrdersService],
})
export class OrdersModule {}

// Opción 2: Usa eventos para una comunicación desacoplada
// users.service.ts
@Injectable()
export class UsersService {
  constructor(private eventEmitter: EventEmitter2) {}

  async createUser(data: CreateUserDto) {
    const user = await this.userRepo.save(data);
    this.eventEmitter.emit('user.created', user);
    return user;
  }
}

// orders.service.ts
@Injectable()
export class OrdersService {
  @OnEvent('user.created')
  handleUserCreated(user: User) {
    // Reacciona a la creación del usuario sin una dependencia directa
  }
}
```

Referencia: [NestJS Circular Dependency](https://docs.nestjs.com/fundamentals/circular-dependency)
