---
title: Prefiere la inyección por constructor
impact: CRITICAL
impactDescription: Necesaria para una DI y un testing correctos
tags: dependency-injection, constructor, testing
---

## Prefiere la inyección por constructor

Usa siempre la inyección por constructor en lugar de la inyección por propiedad. La inyección por constructor hace explícitas las dependencias, permite la verificación de tipos de TypeScript, asegura que las dependencias estén disponibles cuando se instancia la clase y mejora la testeabilidad. Es necesaria para una DI correcta, para el testing y para el soporte de TypeScript.

**Incorrecto (inyección por propiedad con dependencias ocultas):**

```typescript
// Inyección por propiedad - evítala a menos que sea necesaria
@Injectable()
export class UsersService {
  @Inject()
  private userRepo: UserRepository; // Dependencia oculta

  @Inject('CONFIG')
  private config: ConfigType; // También oculta

  async findAll() {
    return this.userRepo.find();
  }
}

// Problemas:
// 1. Las dependencias no son visibles en el constructor
// 2. El servicio puede instanciarse sin dependencias en los tests
// 3. TypeScript no puede hacer cumplir los tipos de las dependencias al instanciar
```

**Correcto (inyección por constructor con dependencias explícitas):**

```typescript
// Inyección por constructor - explícita y testeable
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepo: UserRepository,
    @Inject('CONFIG') private readonly config: ConfigType,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }
}

// El testing es sencillo
describe('UsersService', () => {
  let service: UsersService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepo = {
      find: jest.fn(),
      save: jest.fn(),
    } as any;

    service = new UsersService(mockRepo, { dbUrl: 'test' });
  });

  it('should find all users', async () => {
    mockRepo.find.mockResolvedValue([{ id: '1', name: 'Test' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });
});

// Usa la inyección por propiedad solo para dependencias opcionales
@Injectable()
export class LoggingService {
  @Optional()
  @Inject('ANALYTICS')
  private analytics?: AnalyticsService;

  log(message: string) {
    console.log(message);
    this.analytics?.track('log', message); // Mejora opcional
  }
}
```

Referencia: [NestJS Providers](https://docs.nestjs.com/providers)
