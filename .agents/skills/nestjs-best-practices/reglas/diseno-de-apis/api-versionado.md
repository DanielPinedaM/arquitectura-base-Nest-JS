---
title: Usa el versionado de la API para los breaking changes
impact: MEDIUM
impactDescription: El versionado te permite evolucionar las APIs sin romper a los clientes existentes
tags: api, versioning, breaking-changes, compatibility
---

## Usa el versionado de la API para los breaking changes

Usa el versionado integrado de NestJS al hacer breaking changes en tu API. Elige una estrategia de versionado (URI, header o media type) y aplícala de forma consistente. Esto permite que los clientes antiguos sigan funcionando mientras los clientes nuevos usan los endpoints actualizados.

**Incorrecto (breaking changes sin versionado):**

```typescript
// Breaking changes sin versionado
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    // Respuesta original: { id, name, email }
    // Más adelante cambió a: { id, firstName, lastName, emailAddress }
    // ¡Los clientes antiguos se rompen!
    return this.usersService.findOne(id);
  }
}

// Versionado manual en las rutas
@Controller('v1/users')
export class UsersV1Controller {}

@Controller('v2/users')
export class UsersV2Controller {}
// Inconsistente, propenso a errores, difícil de mantener
```

**Correcto (usa el versionado integrado de NestJS):**

```typescript
// Habilita el versionado en main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Versionado por URI: /v1/users, /v2/users
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // O versionado por header: X-API-Version: 1
  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'X-API-Version',
    defaultVersion: '1',
  });

  // O por media type: Accept: application/json;v=1
  app.enableVersioning({
    type: VersioningType.MEDIA_TYPE,
    key: 'v=',
    defaultVersion: '1',
  });

  await app.listen(3000);
}

// Controllers específicos de cada versión
@Controller('users')
@Version('1')
export class UsersV1Controller {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserV1Response> {
    const user = await this.usersService.findOne(id);
    // Formato de respuesta V1
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}

@Controller('users')
@Version('2')
export class UsersV2Controller {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserV2Response> {
    const user = await this.usersService.findOne(id);
    // Formato de respuesta V2 con breaking changes
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.email,
      createdAt: user.createdAt,
    };
  }
}

// Versionado por ruta - versiones diferentes para rutas diferentes
@Controller('users')
export class UsersController {
  @Get()
  @Version('1')
  findAllV1(): Promise<UserV1Response[]> {
    return this.usersService.findAllV1();
  }

  @Get()
  @Version('2')
  findAllV2(): Promise<UserV2Response[]> {
    return this.usersService.findAllV2();
  }

  @Get(':id')
  @Version(['1', '2']) // El mismo handler para múltiples versiones
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  @Version(VERSION_NEUTRAL) // Disponible en todas las versiones
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }
}

// Servicio compartido con lógica específica de cada versión
@Injectable()
export class UsersService {
  async findOne(id: string, version: string): Promise<any> {
    const user = await this.repo.findOne({ where: { id } });

    if (version === '1') {
      return this.toV1Response(user);
    }
    return this.toV2Response(user);
  }

  private toV1Response(user: User): UserV1Response {
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    };
  }

  private toV2Response(user: User): UserV2Response {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.email,
      createdAt: user.createdAt,
    };
  }
}

// El controller extrae la versión
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('X-API-Version') version: string = '1',
  ): Promise<any> {
    return this.usersService.findOne(id, version);
  }
}

// Estrategia de deprecación - marca las versiones antiguas como deprecadas
@Controller('users')
@Version('1')
@UseInterceptors(DeprecationInterceptor)
export class UsersV1Controller {
  // Todas las rutas V1 incluirán una advertencia de deprecación
}

@Injectable()
export class DeprecationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    response.setHeader('Deprecation', 'true');
    response.setHeader('Sunset', 'Sat, 1 Jan 2025 00:00:00 GMT');
    response.setHeader('Link', '</v2/users>; rel="successor-version"');

    return next.handle();
  }
}
```

Referencia: [NestJS Versioning](https://docs.nestjs.com/techniques/versioning)
