---
title: Implementa una autenticación JWT segura
impact: CRITICAL
impactDescription: Esencial para APIs seguras
tags: security, jwt, authentication, tokens
---

## Implementa una autenticación JWT segura

Usa `@nestjs/jwt` con `@nestjs/passport` para la autenticación. Almacena los secretos de forma segura, usa tiempos de vida apropiados para los tokens, implementa refresh tokens y valida correctamente los tokens. Nunca expongas datos sensibles en los payloads de los JWT.

**Incorrecto (implementación de JWT insegura):**

```typescript
// Secretos hardcodeados
@Module({
  imports: [
    JwtModule.register({
      secret: 'my-secret-key', // Expuesto en el código
      signOptions: { expiresIn: '7d' }, // Demasiado largo
    }),
  ],
})
export class AuthModule {}

// Almacena datos sensibles en el JWT
async login(user: User): Promise<{ accessToken: string }> {
  const payload = {
    sub: user.id,
    email: user.email,
    password: user.password, // ¡NUNCA incluyas la contraseña!
    ssn: user.ssn, // ¡NUNCA incluyas datos sensibles!
    isAdmin: user.isAdmin, // Puede ser manipulado si no se verifica
  };
  return { accessToken: this.jwtService.sign(payload) };
}

// Omite la validación del token
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'my-secret',
    });
  }

  async validate(payload: any): Promise<any> {
    return payload; // No valida que el usuario exista
  }
}
```

**Correcto (JWT seguro con refresh tokens):**

```typescript
// Configuración segura de JWT
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m', // Access tokens de corta duración
          issuer: config.get<string>('JWT_ISSUER'),
          audience: config.get<string>('JWT_AUDIENCE'),
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
})
export class AuthModule {}

// Payload mínimo del JWT
@Injectable()
export class AuthService {
  async login(user: User): Promise<TokenResponse> {
    // Incluye solo los datos necesarios y no sensibles
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id);

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);

    await this.refreshTokenRepo.save({
      userId,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    });

    return token;
  }
}

// Estrategia JWT correcta con validación
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
      issuer: config.get<string>('JWT_ISSUER'),
      audience: config.get<string>('JWT_AUDIENCE'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // Verifica que el usuario todavía exista y esté activo
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Verifica que el token no se haya emitido antes del cambio de contraseña
    if (user.passwordChangedAt) {
      const tokenIssuedAt = new Date(payload.iat * 1000);
      if (tokenIssuedAt < user.passwordChangedAt) {
        throw new UnauthorizedException('Token invalidated by password change');
      }
    }

    return user;
  }
}
```

Referencia: [NestJS Authentication](https://docs.nestjs.com/security/authentication)
