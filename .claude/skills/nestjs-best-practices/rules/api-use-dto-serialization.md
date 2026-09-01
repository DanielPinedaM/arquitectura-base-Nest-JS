---
title: Use DTOs and Serialization for API Responses
impact: MEDIUM
impactDescription: Response DTOs prevent accidental data exposure and ensure consistency
tags: api, dto, serialization, nestjs-zod
---

## Use DTOs and Serialization for API Responses

Never return entity objects directly from controllers. Use response DTOs created with `createZodDto` and applied with `@ZodSerializerDto()` to control exactly what data is sent to clients. This prevents accidental exposure of sensitive fields and provides a stable API contract.

**Incorrect (returning entities directly or manual spreading):**

```typescript
// Return entities directly
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
    // Returns: { id, email, passwordHash, ssn, internalNotes, ... }
    // Exposes sensitive data!
  }
}

// Manual object spreading (error-prone)
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.usersService.findById(id);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    // Easy to forget to exclude sensitive fields
    // Hard to maintain across endpoints
  };
}
```

**Correct (use nestjs-zod serialization with response DTOs):**

```typescript
// Enable zod serialization globally
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)));
  await app.listen(3000);
}

// Response schema with serialization control
const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  createdAt: z.date(),
});
// passwordHash, ssn and internalNotes are not part of the schema, so they are
// never included in responses. isAdmin is still allowed in request DTOs

export class UserResponseDto extends createZodDto(userResponseSchema) {}

// Now returning entity is safe
@Controller('users')
export class UsersController {
  @Get(':id')
  @ZodSerializerDto(UserResponseDto)
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
    // Returns: { id, email, name, createdAt }
    // Sensitive fields excluded automatically
  }
}

// For different response shapes, use explicit DTOs
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

// Controller with explicit DTOs
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
    // Extraneous values are stripped by the schema
    return this.usersService.findByIdWithPosts(id);
  }
}

// Separate schemas for conditional serialization
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
    // Returns: { id, name }
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  @ZodSerializerDto([AdminUserDto])
  async findAllAdmin(): Promise<User[]> {
    // Returns: { id, name, email, createdAt }
  }

  @Get('me')
  @ZodSerializerDto(OwnerUserDto)
  async getProfile(@CurrentUser() user: User): Promise<User> {
    // Returns: { id, name, settings }
  }
}
```

Reference: [NestJS Serialization](https://docs.nestjs.com/techniques/serialization)
