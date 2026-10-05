---
title: Comprende los scopes de los providers
impact: CRITICAL
impactDescription: Evita fugas de datos y problemas de rendimiento
tags: dependency-injection, scopes, request-context
---

## Comprende los scopes de los providers

NestJS tiene tres scopes de providers: DEFAULT (singleton), REQUEST (una instancia por petición) y TRANSIENT (una nueva instancia por cada inyección). La mayoría de los providers deben ser singletons. Los providers con scope de petición tienen implicaciones de rendimiento, ya que se propagan hacia arriba por el árbol de dependencias. Comprender los scopes evita fugas de memoria y que los datos se compartan de forma incorrecta.

**Incorrecto (uso incorrecto del scope):**

```typescript
// Scope de petición cuando no es necesario (impacto en el rendimiento)
@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  // Esto crea una nueva instancia para CADA petición
  // Todas las dependencias también pasan a tener scope de petición
  async findAll() {
    return this.userRepo.find();
  }
}

// Singleton con estado mutable de la petición
@Injectable() // Por defecto: singleton
export class RequestContextService {
  private userId: string; // PELIGRO: ¡Compartido entre todas las peticiones!

  setUser(userId: string) {
    this.userId = userId; // Lo sobrescribe para todas las peticiones concurrentes
  }

  getUser() {
    return this.userId; // ¡Devuelve el usuario equivocado!
  }
}
```

**Correcto (scope apropiado para cada caso de uso):**

```typescript
// Singleton para servicios sin estado (por defecto, lo más común)
@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UserRepository) {}

  async findById(id: string): Promise<User> {
    return this.userRepo.findOne({ where: { id } });
  }
}

// Scope de petición SOLO cuando necesitas el contexto de la petición
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private userId: string;

  setUser(userId: string) {
    this.userId = userId;
  }

  getUser(): string {
    return this.userId;
  }
}

// Mejor: usa el contexto de petición integrado de NestJS
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class AuditService {
  constructor(@Inject(REQUEST) private request: Request) {}

  log(action: string) {
    console.log(`User ${this.request.user?.id} performed ${action}`);
  }
}

// Lo mejor: usa ClsModule para el contexto asíncrono (sin propagación del scope)
import { ClsService } from 'nestjs-cls';

@Injectable() // ¡Sigue siendo singleton!
export class AuditService {
  constructor(private cls: ClsService) {}

  log(action: string) {
    const userId = this.cls.get('userId');
    console.log(`User ${userId} performed ${action}`);
  }
}
```

Referencia: [NestJS Injection Scopes](https://docs.nestjs.com/fundamentals/injection-scopes)
