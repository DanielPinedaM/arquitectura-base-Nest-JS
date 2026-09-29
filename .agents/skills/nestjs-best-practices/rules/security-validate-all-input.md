---
title: Validate All Input with DTOs and Pipes
impact: HIGH
impactDescription: First line of defense against attacks
tags: security, validation, dto, pipes
---

## Validate All Input with DTOs and Pipes

Always validate incoming data using zod schemas turned into DTOs with `createZodDto` and the global `ZodValidationPipe` from nestjs-zod. Never trust user input. Validate all request bodies, query parameters, and route parameters before processing.

**Incorrect (trust raw input without validation):**

```typescript
// Trust raw input without validation
@Controller('users')
export class UsersController {
  @Post()
  create(@Body() body: any) {
    // body could contain anything - SQL injection, XSS, etc.
    return this.usersService.create(body);
  }

  @Get()
  findAll(@Query() query: any) {
    // query.limit could be "'; DROP TABLE users; --"
    return this.usersService.findAll(query.limit);
  }
}

// DTOs without a zod schema
export class CreateUserDto {
  name: string;    // No validation
  email: string;   // Could be "not-an-email"
  age: number;     // Could be "abc" or -999
}
```

**Correct (validated DTOs with global ZodValidationPipe):**

```typescript
// Enable ZodValidationPipe globally in main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Auto-transform to the types declared in each zod schema
  app.useGlobalPipes(new ZodValidationPipe());

  await app.listen(3000);
}

// Create well-validated DTOs
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// z.object() strips unknown properties, z.strictObject() throws on them
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

// Query DTO with defaults and transformation
const findUsersQuerySchema = z.object({
  search: z.string().max(100).optional(),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  offset: z.coerce.number().int().min(0).default(0),
});

export class FindUsersQueryDto extends createZodDto(findUsersQuerySchema) {}

// Param validation
const userIdParamSchema = z.object({
  id: z.uuidv4(),
});

export class UserIdParamDto extends createZodDto(userIdParamSchema) {}

@Controller('users')
export class UsersController {
  @Post()
  create(@Body() dto: CreateUserDto): Promise<User> {
    // dto is guaranteed to be valid
    return this.usersService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindUsersQueryDto): Promise<User[]> {
    // query.limit is a number, query.search is sanitized
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param() params: UserIdParamDto): Promise<User> {
    // params.id is a valid UUID
    return this.usersService.findById(params.id);
  }
}
```

Reference: [NestJS Validation](https://docs.nestjs.com/techniques/validation)
