---
title: Usa guards para la autenticación y la autorización
impact: HIGH
impactDescription: Aplica el control de acceso antes de que se ejecuten los handlers
tags: security, guards, authentication, authorization
---

## Usa guards para la autenticación y la autorización

Los guards determinan si una petición debe manejarse en función del estado de autenticación, los roles, los permisos u otras condiciones. Se ejecutan después del middleware pero antes de los pipes y los interceptors, lo que los hace ideales para el control de acceso. Usa guards en lugar de verificaciones manuales en los controllers.

**Incorrecto (verificaciones de autenticación manuales en cada handler):**

```typescript
// Verificaciones de autenticación manuales en cada handler
@Controller('admin')
export class AdminController {
  @Get('users')
  async getUsers(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    if (!req.user.roles.includes('admin')) {
      throw new ForbiddenException();
    }
    return this.adminService.getUsers();
  }

  @Delete('users/:id')
  async deleteUser(@Request() req, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    if (!req.user.roles.includes('admin')) {
      throw new ForbiddenException();
    }
    return this.adminService.deleteUser(id);
  }
}
```

**Correcto (guards con decoradores declarativos):**

```typescript
// Guard de autenticación JWT
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verifica si existe el decorador @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      request.user = await this.jwtService.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

// Guard de roles
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Decoradores
export const Public = () => SetMetadata('isPublic', true);
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// Registra los guards globalmente
@Module({
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

// Controller limpio
@Controller('admin')
@Roles(Role.Admin) // Se aplica a todas las rutas
export class AdminController {
  @Get('users')
  getUsers(): Promise<User[]> {
    return this.adminService.getUsers();
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteUser(id);
  }

  @Public() // Sobrescritura: no requiere autenticación
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
```

Referencia: [NestJS Guards](https://docs.nestjs.com/guards)
