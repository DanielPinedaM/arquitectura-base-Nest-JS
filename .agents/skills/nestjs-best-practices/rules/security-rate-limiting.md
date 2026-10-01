---
title: Implementa rate limiting
impact: HIGH
impactDescription: Protege contra el abuso y asegura un uso justo de los recursos
tags: security, rate-limiting, throttler, protection
---

## Implementa rate limiting

Usa `@nestjs/throttler` para limitar la tasa de peticiones por cliente. Aplica límites diferentes para endpoints diferentes: más estrictos para los endpoints de autenticación y más relajados para las operaciones de lectura. Considera usar Redis para un rate limiting distribuido en deployments en clúster.

**Incorrecto (sin rate limiting en los endpoints sensibles):**

```typescript
// Sin rate limiting en los endpoints sensibles
@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<TokenResponse> {
    // Los atacantes pueden hacer fuerza bruta sobre las credenciales
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    // Se puede abusar para enviar spam de emails a los usuarios
    return this.authService.sendResetEmail(dto.email);
  }
}

// Los mismos límites para todos los endpoints
@UseGuards(ThrottlerGuard)
@Controller('api')
export class ApiController {
  @Get('public-data')
  async getPublic() {} // Debería permitir más peticiones

  @Post('process-payment')
  async payment() {} // Debería ser más restrictivo
}
```

**Correcto (throttler configurado con límites específicos por endpoint):**

```typescript
// Configura el throttler globalmente con múltiples límites
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 3, // 3 peticiones por segundo
      },
      {
        name: 'medium',
        ttl: 10000, // 10 segundos
        limit: 20, // 20 peticiones cada 10 segundos
      },
      {
        name: 'long',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 peticiones por minuto
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

// Sobrescribe los límites por endpoint
@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  async login(@Body() dto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @Throttle({ short: { limit: 3, ttl: 3600000 } }) // 3 por hora
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.authService.sendResetEmail(dto.email);
  }
}

// Omite el throttling para ciertas rutas
@Controller('health')
export class HealthController {
  @Get()
  @SkipThrottle()
  check(): string {
    return 'OK';
  }
}

// Throttle personalizado por tipo de usuario
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    // Usa el ID del usuario si está autenticado; de lo contrario, la IP
    return req.user?.id || req.ip;
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    const request = context.switchToHttp().getRequest();

    // Límites más altos para los usuarios autenticados
    if (request.user) {
      return request.user.isPremium ? 1000 : 200;
    }

    return 50; // Usuarios anónimos
  }
}
```

Referencia: [NestJS Throttler](https://docs.nestjs.com/security/rate-limiting)
