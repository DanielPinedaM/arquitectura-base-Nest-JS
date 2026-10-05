---
title: Usa patrones correctos para compartir módulos
impact: CRITICAL
impactDescription: Evita instancias duplicadas, fugas de memoria e inconsistencias de estado
tags: architecture, modules, sharing, exports
---

## Usa patrones correctos para compartir módulos

Los módulos de NestJS son singletons por defecto. Cuando un servicio se exporta correctamente desde un módulo y ese módulo se importa en otro lugar, se comparte la misma instancia. Sin embargo, proveer un servicio en múltiples módulos crea instancias separadas, lo que provoca desperdicio de memoria, inconsistencias de estado y un comportamiento confuso. Encapsula siempre los servicios en módulos dedicados, expórtalos explícitamente e importa el módulo donde se necesite.

**Incorrecto (servicio provisto en múltiples módulos):**

```typescript
// StorageService provisto directamente en múltiples módulos - INCORRECTO
// storage.service.ts
@Injectable()
export class StorageService {
  private cache = new Map(); // ¡Cada instancia tiene un estado separado!

  store(key: string, value: any) {
    this.cache.set(key, value);
  }
}

// app.module.ts
@Module({
  providers: [StorageService], // Instancia #1
  controllers: [AppController],
})
export class AppModule {}

// videos.module.ts
@Module({
  providers: [StorageService], // Instancia #2 - ¡diferente de la de AppModule!
  controllers: [VideosController],
})
export class VideosModule {}

// Problemas:
// 1. Existen dos instancias separadas de StorageService
// 2. cache.set() en VideosModule no afecta a la caché de AppModule
// 3. Memoria desperdiciada en instancias duplicadas
// 4. Pesadillas de depuración cuando el estado no se sincroniza
```

**Correcto (módulo dedicado con exports):**

```typescript
// storage/storage.module.ts
@Module({
  providers: [StorageService],
  exports: [StorageService], // Lo hace disponible para quienes lo importen
})
export class StorageModule {}

// videos/videos.module.ts
@Module({
  imports: [StorageModule], // Importa el módulo, no el servicio
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}

// channels/channels.module.ts
@Module({
  imports: [StorageModule], // Se comparte la misma instancia
  controllers: [ChannelsController],
  providers: [ChannelsService],
})
export class ChannelsModule {}

// app.module.ts
@Module({
  imports: [
    StorageModule, // Solo si el propio AppModule necesita StorageService
    VideosModule,
    ChannelsModule,
  ],
})
export class AppModule {}

// Ahora todos los módulos comparten la MISMA instancia de StorageService
```

**Cuándo usar @Global() (con moderación):**

```typescript
// SOLO para cross-cutting concerns verdaderamente transversales
@Global()
@Module({
  providers: [ConfigService, LoggerService],
  exports: [ConfigService, LoggerService],
})
export class CoreModule {}

// Impórtalo una sola vez en AppModule
@Module({
  imports: [CoreModule], // Registrado globalmente, disponible en todas partes
})
export class AppModule {}

// Los demás módulos no necesitan importar CoreModule
@Module({
  controllers: [UsersController],
  providers: [UsersService], // Puede inyectar ConfigService sin importarlo
})
export class UsersModule {}

// ADVERTENCIA: ¡No hagas todo global!
// - Oculta las dependencias (no se puede ver qué necesita un módulo a partir de sus imports)
// - Hace más difícil el testing
// - Resérvalo para: configuración, logging, conexiones a la base de datos
```

**Patrón de re-exportación de módulos:**

```typescript
// common.module.ts - utilidades compartidas
@Module({
  providers: [DateService, ValidationService],
  exports: [DateService, ValidationService],
})
export class CommonModule {}

// core.module.ts - re-exporta common por conveniencia
@Module({
  imports: [CommonModule, DatabaseModule],
  exports: [CommonModule, DatabaseModule], // Re-exporta para los consumidores
})
export class CoreModule {}

// feature.module.ts - importa CoreModule y obtiene ambos
@Module({
  imports: [CoreModule], // Obtiene CommonModule + DatabaseModule
  controllers: [FeatureController],
})
export class FeatureModule {}
```

Referencia: [NestJS Modules](https://docs.nestjs.com/modules#shared-modules)
