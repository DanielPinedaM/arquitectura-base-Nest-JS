---
title: Usa lazy loading para los módulos grandes
impact: HIGH
impactDescription: Mejora el tiempo de arranque de las aplicaciones grandes
tags: performance, lazy-loading, modules, optimization
---

## Usa lazy loading para los módulos grandes

NestJS soporta el lazy loading de módulos, que difiere la inicialización hasta el primer uso. Esto es valioso para aplicaciones grandes donde algunas funcionalidades se usan rara vez, para deployments serverless donde importa el tiempo de cold start, o cuando ciertos módulos tienen costos de inicialización altos.

**Incorrecto (cargar todo de forma eager):**

```typescript
// Carga todo de forma eager en una app grande
@Module({
  imports: [
    UsersModule,
    OrdersModule,
    PaymentsModule,
    ReportsModule, // Pesado, se usa rara vez
    AnalyticsModule, // Pesado, se usa rara vez
    AdminModule, // Solo lo usan los administradores
    LegacyModule, // Módulo de migración, se usa rara vez
    BulkImportModule, // Se usa una vez al mes
  ],
})
export class AppModule {}

// Todos los módulos se inicializan al arrancar, aunque nunca se usen
// Cold starts lentos en serverless
// Memoria desperdiciada en módulos sin usar
```

**Correcto (lazy loading de los módulos que se usan rara vez):**

```typescript
// Usa LazyModuleLoader para los módulos opcionales
import { LazyModuleLoader } from '@nestjs/core';

@Injectable()
export class ReportsService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}

  async generateReport(type: string): Promise<Report> {
    // Carga el módulo solo cuando es necesario
    const { ReportsModule } = await import('./reports/reports.module');
    const moduleRef = await this.lazyModuleLoader.load(() => ReportsModule);

    const reportsService = moduleRef.get(ReportsGeneratorService);
    return reportsService.generate(type);
  }
}

// Lazy loading de las funcionalidades de administración con caché
@Injectable()
export class AdminService {
  private adminModule: ModuleRef | null = null;

  constructor(private lazyModuleLoader: LazyModuleLoader) {}

  private async getAdminModule(): Promise<ModuleRef> {
    if (!this.adminModule) {
      const { AdminModule } = await import('./admin/admin.module');
      this.adminModule = await this.lazyModuleLoader.load(() => AdminModule);
    }
    return this.adminModule;
  }

  async runAdminTask(task: string): Promise<void> {
    const moduleRef = await this.getAdminModule();
    const taskRunner = moduleRef.get(AdminTaskRunner);
    await taskRunner.run(task);
  }
}

// Servicio reutilizable de lazy loading
@Injectable()
export class ModuleLoaderService {
  private loadedModules = new Map<string, ModuleRef>();

  constructor(private lazyModuleLoader: LazyModuleLoader) {}

  async load<T>(
    key: string,
    importFn: () => Promise<{ default: Type<T> } | Type<T>>,
  ): Promise<ModuleRef> {
    if (!this.loadedModules.has(key)) {
      const module = await importFn();
      const moduleType = 'default' in module ? module.default : module;
      const moduleRef = await this.lazyModuleLoader.load(() => moduleType);
      this.loadedModules.set(key, moduleRef);
    }
    return this.loadedModules.get(key)!;
  }
}

// Precarga los módulos en segundo plano después del arranque
@Injectable()
export class ModulePreloader implements OnApplicationBootstrap {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}

  async onApplicationBootstrap(): Promise<void> {
    setTimeout(async () => {
      await this.preloadModule(() => import('./reports/reports.module'));
    }, 5000); // 5 segundos después del arranque
  }

  private async preloadModule(importFn: () => Promise<any>): Promise<void> {
    try {
      const module = await importFn();
      const moduleType = module.default || Object.values(module)[0];
      await this.lazyModuleLoader.load(() => moduleType);
    } catch (error) {
      console.warn('Failed to preload module', error);
    }
  }
}
```

Referencia: [NestJS Lazy Loading Modules](https://docs.nestjs.com/fundamentals/lazy-loading-modules)
