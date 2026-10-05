---
title: Lanza HTTP exceptions desde los servicios
impact: HIGH
impactDescription: Mantiene los controllers delgados y simplifica el manejo de errores
tags: error-handling, exceptions, services
---

## Lanza HTTP exceptions desde los servicios

Es aceptable (y a menudo preferible) lanzar subclases de `HttpException` desde los servicios en las aplicaciones HTTP. Esto mantiene los controllers delgados y permite que los servicios comuniquen los estados de error apropiados. Para los servicios verdaderamente independientes de la capa, usa excepciones de dominio que se mapeen a códigos de estado HTTP.

**Incorrecto (devolver objetos de error en lugar de lanzar excepciones):**

```typescript
// Devuelve objetos de error en lugar de lanzar excepciones
@Injectable()
export class UsersService {
  async findById(id: string): Promise<{ user?: User; error?: string }> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      return { error: 'User not found' }; // El controller debe verificar esto
    }
    return { user };
  }
}

@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.usersService.findById(id);
    if (result.error) {
      throw new NotFoundException(result.error);
    }
    return result.user;
  }
}
```

**Correcto (lanza las excepciones directamente desde el servicio):**

```typescript
// Lanza las excepciones directamente desde el servicio
@Injectable()
export class UsersService {
  constructor(private readonly repo: UserRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    return this.repo.save(dto);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id); // Lanza una excepción si no lo encuentra
    Object.assign(user, dto);
    return this.repo.save(user);
  }
}

// El controller se mantiene delgado
@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }
}

// Para servicios independientes de la capa, usa excepciones de dominio
export class EntityNotFoundException extends Error {
  constructor(
    public readonly entity: string,
    public readonly id: string,
  ) {
    super(`${entity} with ID "${id}" not found`);
  }
}

// Mapéala a HTTP en un exception filter
@Catch(EntityNotFoundException)
export class EntityNotFoundFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(404).json({
      statusCode: 404,
      message: exception.message,
      entity: exception.entity,
      id: exception.id,
    });
  }
}
```

Referencia: [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
