---
title: Usa DTOs y serialización para las respuestas de la API
impact: MEDIUM
impactDescription: Los DTOs de respuesta evitan la exposición accidental de datos y aseguran la consistencia
tags: api, dto, serialization, nestjs-zod
---

## Usa DTOs y serialización para las respuestas de la API

Nunca devuelvas objetos de entidad directamente desde los controllers. Usa DTOs de respuesta creados con `createZodDto` y aplicados con `@ZodSerializerDto()` para controlar exactamente qué datos se envían a los clientes. Esto evita la exposición accidental de campos sensibles y proporciona un contrato de API estable.

**Incorrecto (devolver entidades directamente o hacer spread manual):**

```typescript
// Devuelve las entidades directamente
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
    // Devuelve: { id, email, passwordHash, ssn, internalNotes, ... }
    // ¡Expone datos sensibles!
  }
}

// Spread manual del objeto (propenso a errores)
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.usersService.findById(id);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    // Es fácil olvidar excluir los campos sensibles
    // Difícil de mantener entre endpoints
  };
}
```

**Correcto (usa la serialización de nestjs-zod con DTOs de respuesta):**

```typescript
// Habilita la serialización de zod globalmente
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)));
  await app.listen(3000);
}

// Schema de respuesta con control de la serialización
const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  createdAt: z.date(),
});
// passwordHash, ssn e internalNotes no forman parte del schema, por lo que
// nunca se incluyen en las respuestas. isAdmin sigue estando permitido en los DTOs de petición

export class UserResponseDto extends createZodDto(userResponseSchema) {}

// Ahora devolver la entidad es seguro
@Controller('users')
export class UsersController {
  @Get(':id')
  @ZodSerializerDto(UserResponseDto)
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
    // Devuelve: { id, email, name, createdAt }
    // Los campos sensibles se excluyen automáticamente
  }
}

// Para estructuras de respuesta diferentes, usa DTOs explícitos
const userBaseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
});

const userSummarySchema = userBaseSchema
  .extend({ posts: z.array(postResponseSchema).optional() })
  .transform(({ posts, ...user }) => ({
    ...user,
    postCount: posts?.length ?? 0,
  }));

export class UserSummaryResponseDto extends createZodDto(userSummarySchema) {}

const userDetailSchema = userBaseSchema.extend({
  createdAt: z.date(),
  posts: z.array(postResponseSchema),
});

export class UserDetailResponseDto extends createZodDto(userDetailSchema) {}

// Controller con DTOs explícitos
@Controller('users')
export class UsersController {
  @Get()
  @ZodSerializerDto([UserSummaryResponseDto])
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ZodSerializerDto(UserDetailResponseDto)
  async findOne(@Param('id') id: string): Promise<User> {
    // El schema elimina los valores sobrantes
    return this.usersService.findByIdWithPosts(id);
  }
}

// Schemas separados para la serialización condicional
const publicUserSchema = userBaseSchema.pick({ id: true, name: true });

const adminUserSchema = publicUserSchema.extend({
  email: z.email(),
  createdAt: z.date(),
});

const ownerUserSchema = publicUserSchema.extend({
  settings: userSettingsSchema,
});

export class PublicUserDto extends createZodDto(publicUserSchema) {}

export class AdminUserDto extends createZodDto(adminUserSchema) {}

export class OwnerUserDto extends createZodDto(ownerUserSchema) {}

@Controller('users')
export class UsersController {
  @Get()
  @ZodSerializerDto([PublicUserDto])
  async findAllPublic(): Promise<User[]> {
    // Devuelve: { id, name }
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  @ZodSerializerDto([AdminUserDto])
  async findAllAdmin(): Promise<User[]> {
    // Devuelve: { id, name, email, createdAt }
  }

  @Get('me')
  @ZodSerializerDto(OwnerUserDto)
  async getProfile(@CurrentUser() user: User): Promise<User> {
    // Devuelve: { id, name, settings }
  }
}
```

Referencia: [NestJS Serialization](https://docs.nestjs.com/techniques/serialization)
