---
title: Usa Supertest para el testing E2E
impact: HIGH
impactDescription: Valida el ciclo completo de petición/respuesta
tags: testing, e2e, supertest, integration
---

## Usa Supertest para el testing E2E

Los tests end-to-end usan Supertest para hacer peticiones HTTP reales contra tu aplicación de NestJS. Testean el stack completo, incluidos el middleware, los guards, los pipes y los interceptors. Los tests E2E detectan problemas de integración que los unit tests pasan por alto.

**Incorrecto (sin un setup o teardown E2E correctos):**

```typescript
// Solo unit tests de los controllers
describe('UsersController', () => {
  it('should return users', async () => {
    const service = { findAll: jest.fn().mockResolvedValue([]) };
    const controller = new UsersController(service as any);

    const result = await controller.findAll();

    expect(result).toEqual([]);
    // No testea: rutas, guards, pipes, serialización
  });
});

// Tests E2E sin un setup/teardown correctos
describe('Users API', () => {
  it('should create user', async () => {
    const app = await NestFactory.create(AppModule);
    // Sin una inicialización correcta
    // Sin limpieza después del test
    // Accede a la base de datos real
  });
});
```

**Correcto (setup E2E correcto con Supertest):**

```typescript
// Setup correcto de los tests E2E
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplica la misma configuración que en producción
    app.useGlobalPipes(new ZodValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John', email: 'john@test.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('John');
          expect(res.body.email).toBe('john@test.com');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John', email: 'invalid-email' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email');
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(404);
    });
  });
});

// Testing con autenticación
describe('Protected Routes (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();

    // Obtiene el token de autenticación
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' });

    authToken = loginResponse.body.accessToken;
  });

  it('should return 401 without token', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .expect(401);
  });

  it('should return user profile with valid token', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('test@test.com');
      });
  });
});

// Aislamiento de la base de datos para los tests E2E
describe('Orders API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test', // Configuración de la base de datos de test
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get(DataSource);
    await app.init();
  });

  beforeEach(async () => {
    // Limpia la base de datos entre tests
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
```

Referencia: [NestJS E2E Testing](https://docs.nestjs.com/fundamentals/testing#end-to-end-testing)
