---
title: Valida todo el input con DTOs y pipes
impact: HIGH
impactDescription: Primera línea de defensa contra los ataques
tags: security, validation, dto, pipes
---

## Valida todo el input con DTOs y pipes

Valida siempre los datos entrantes usando schemas de zod convertidos en DTOs con `createZodDto` y el `ZodValidationPipe` global de nestjs-zod. Nunca confíes en el input del usuario. Valida todos los bodies de las peticiones, los query parameters y los route parameters antes de procesarlos.

**Incorrecto (confiar en el input en bruto sin validación):**

```typescript
// Confía en el input en bruto sin validación
@Controller('users')
export class UsersController {
  @Post()
  create(@Body() body: any) {
    // body podría contener cualquier cosa - SQL injection, XSS, etc.
    return this.usersService.create(body);
  }

  @Get()
  findAll(@Query() query: any) {
    // query.limit podría ser "'; DROP TABLE users; --"
    return this.usersService.findAll(query.limit);
  }
}

// DTOs sin un schema de zod
export class CreateUserDto {
  name: string;    // Sin validación
  email: string;   // Podría ser "not-an-email"
  age: number;     // Podría ser "abc" o -999
}
```

**Correcto (DTOs validados con un ZodValidationPipe global):**

```typescript
// Habilita ZodValidationPipe globalmente en main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Transforma automáticamente a los tipos declarados en cada schema de zod
  app.useGlobalPipes(new ZodValidationPipe());

  await app.listen(3000);
}

// Crea DTOs bien validados
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// z.object() elimina las propiedades desconocidas, z.strictObject() lanza una excepción ante ellas
const createUserSchema = z.strictObject({
  name: z.string().trim().min(2).max(100),

  email: z.string().trim().toLowerCase().check(z.email()),

  age: z.coerce.number().int().min(0).max(150),

  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain uppercase, lowercase, and number',
    }),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}

// DTO de query con valores por defecto y transformación
const findUsersQuerySchema = z.object({
  search: z.string().max(100).optional(),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  offset: z.coerce.number().int().min(0).default(0),
});

export class FindUsersQueryDto extends createZodDto(findUsersQuerySchema) {}

// Validación de parámetros
const userIdParamSchema = z.object({
  id: z.uuidv4(),
});

export class UserIdParamDto extends createZodDto(userIdParamSchema) {}

@Controller('users')
export class UsersController {
  @Post()
  create(@Body() dto: CreateUserDto): Promise<User> {
    // Se garantiza que dto es válido
    return this.usersService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindUsersQueryDto): Promise<User[]> {
    // query.limit es un número, query.search está sanitizado
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param() params: UserIdParamDto): Promise<User> {
    // params.id es un UUID válido
    return this.usersService.findById(params.id);
  }
}
```

Referencia: [NestJS Validation](https://docs.nestjs.com/techniques/validation)
