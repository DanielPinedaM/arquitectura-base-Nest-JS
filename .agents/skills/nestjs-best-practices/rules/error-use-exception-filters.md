---
title: Usa exception filters para el manejo de errores
impact: HIGH
impactDescription: Manejo de errores consistente y centralizado
tags: error-handling, exception-filters, consistency
---

## Usa exception filters para el manejo de errores

Nunca captures excepciones ni formatees manualmente las respuestas de error en los controllers. Usa los exception filters de NestJS para manejar los errores de forma consistente en toda tu aplicación. Crea exception filters personalizados para tipos de error específicos y un filter global para las excepciones no manejadas.

**Incorrecto (manejo manual de errores en los controllers):**

```typescript
// Manejo manual de errores en los controllers
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.usersService.findById(id);
      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          message: 'User not found',
        });
      }
      return res.json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }
}
```

**Correcto (exception filters con un manejo consistente):**

```typescript
// Usa excepciones integradas y personalizadas
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }
}

// Excepción de dominio personalizada
export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super({
      statusCode: 404,
      error: 'Not Found',
      message: `User with ID "${userId}" not found`,
      code: 'USER_NOT_FOUND',
    });
  }
}

// Exception filter personalizado para los errores de dominio
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus?.() || 400;

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

// Exception filter global para los errores no manejados
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

// Regístralos globalmente en main.ts
app.useGlobalFilters(
  new AllExceptionsFilter(app.get(Logger)),
  new DomainExceptionFilter(),
);

// O mediante el módulo
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
```

Referencia: [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
