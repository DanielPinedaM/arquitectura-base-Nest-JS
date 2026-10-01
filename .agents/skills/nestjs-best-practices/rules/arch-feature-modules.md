---
title: Organiza por feature modules
impact: CRITICAL
impactDescription: "Onboarding y desarrollo de 3 a 5 veces más rápidos"
tags: architecture, modules, organization
---

## Organiza por feature modules

Organiza tu aplicación en feature modules que encapsulen la funcionalidad relacionada. Cada feature module debe ser autocontenido, con sus propios controllers, servicios, entidades y DTOs. Evita organizar por capa técnica (todos los controllers juntos, todos los servicios juntos). Esto permite un onboarding y un desarrollo de features de 3 a 5 veces más rápidos.

**Incorrecto (organización por capa técnica):**

```typescript
// Organización por capa técnica (anti-pattern)
src/
├── controllers/
│   ├── users.controller.ts
│   ├── orders.controller.ts
│   └── products.controller.ts
├── services/
│   ├── users.service.ts
│   ├── orders.service.ts
│   └── products.service.ts
├── entities/
│   ├── user.entity.ts
│   ├── order.entity.ts
│   └── product.entity.ts
└── app.module.ts  // Importa todo directamente
```

**Correcto (organización por feature modules):**

```typescript
// Organización por feature modules
src/
├── users/
│   ├── dto/
│   │   ├── create-user.schema.ts
│   │   └── update-user.schema.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   └── users.module.ts
├── orders/
│   ├── dto/
│   ├── entities/
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
├── shared/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── shared.module.ts
└── app.module.ts

// users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService], // Exporta solo lo que otros necesitan
})
export class UsersModule {}

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(),
    UsersModule,
    OrdersModule,
    SharedModule,
  ],
})
export class AppModule {}
```

Referencia: [NestJS Modules](https://docs.nestjs.com/modules)
