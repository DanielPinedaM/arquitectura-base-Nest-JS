---
title: Haz mock de los servicios externos en los tests
impact: MEDIUM-HIGH
impactDescription: Asegura tests rápidos, confiables y deterministas
tags: testing, mocking, external-services, jest
---

## Haz mock de los servicios externos en los tests

Nunca llames a servicios externos reales (APIs, bases de datos, colas de mensajes) en los unit tests. Haz mock de ellos para asegurar que los tests sean rápidos, deterministas y no generen costos. Usa datos mock realistas y testea casos límite como timeouts y errores.

**Incorrecto (llamar a APIs y bases de datos reales):**

```typescript
// Llama a APIs reales en los tests
describe('PaymentService', () => {
  it('should process payment', async () => {
    const service = new PaymentService(new StripeClient(realApiKey));
    // ¡Accede a la API real de Stripe!
    const result = await service.charge('tok_visa', 1000);
    // Lento, cuesta dinero, inestable
  });
});

// Usa la base de datos real
describe('UsersService', () => {
  beforeEach(async () => {
    await connection.query('DELETE FROM users'); // Modifica la base de datos real
  });

  it('should create user', async () => {
    const user = await service.create({ email: 'test@test.com' });
    // Efectos secundarios en una base de datos compartida
  });
});

// Mocks incompletos
const mockHttpService = {
  get: jest.fn().mockResolvedValue({ data: {} }),
  // Faltan los escenarios de error, faltan otros métodos
};
```

**Correcto (haz mock de todas las dependencias externas):**

```typescript
// Haz mock correctamente del servicio HTTP
describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(WeatherService);
    httpService = module.get(HttpService);
  });

  it('should return weather data', async () => {
    const mockResponse = {
      data: { temperature: 72, humidity: 45 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    httpService.get.mockReturnValue(of(mockResponse));

    const result = await service.getWeather('NYC');

    expect(result).toEqual({ temperature: 72, humidity: 45 });
  });

  it('should handle API timeout', async () => {
    httpService.get.mockReturnValue(
      throwError(() => new Error('ETIMEDOUT')),
    );

    await expect(service.getWeather('NYC')).rejects.toThrow('Weather service unavailable');
  });

  it('should handle rate limiting', async () => {
    httpService.get.mockReturnValue(
      throwError(() => ({
        response: { status: 429, data: { message: 'Rate limited' } },
      })),
    );

    await expect(service.getWeather('NYC')).rejects.toThrow(TooManyRequestsException);
  });
});

// Haz mock del repository en lugar de la base de datos
describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should find user by id', async () => {
    const mockUser = { id: '1', name: 'John', email: 'john@test.com' };
    repo.findOne.mockResolvedValue(mockUser);

    const result = await service.findById('1');

    expect(result).toEqual(mockUser);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});

// Crea una factory de mocks para los SDKs complejos
function createMockStripe(): jest.Mocked<Stripe> {
  return {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      confirm: jest.fn(),
      cancel: jest.fn(),
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  } as any;
}

// Haz mock del tiempo para los tests que dependen del tiempo
describe('TokenService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should expire token after 1 hour', async () => {
    const token = await service.createToken();

    // Adelanta el tiempo
    jest.advanceTimersByTime(61 * 60 * 1000);

    expect(await service.isValid(token)).toBe(false);
  });
});
```

Referencia: [Jest Mocking](https://jestjs.io/docs/mock-functions)
