import { log } from '@/shared/data-types/constants/logger.const';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request as ExpressRequest } from 'express';

/** cookies que la guard necesita leer de la peticion */
interface IAuthCookies {
  token?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  /* eslint-disable-next-line @typescript-eslint/require-await --
     CanActivate admite un resultado sincrono o una promesa; se conserva la
     firma asincrona porque es la que expone la guard hacia Nest */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: ExpressRequest = context
      .switchToHttp()
      .getRequest<ExpressRequest>();
    const cookies: IAuthCookies = request.cookies as IAuthCookies;
    const token: string | undefined = cookies.token;

    if (!token) {
      log.error('no se encontró el token de acceso en las cookies');

      throw new HttpException(
        'No tienes una sesión activa. Inicia sesión para continuar.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const payload: Record<string, unknown> =
        this.jwtService.verify<Record<string, unknown>>(token);

      if (!payload) {
        log.error('el token de autenticación no es válido o ha expirado');

        throw new HttpException(
          'El token de autenticación no es válido o ha expirado.',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (error: unknown) {
      log.error('error al verificar el token');
      log.error(error);

      throw new HttpException(
        'No se pudo verificar la sesión. Es posible que el token haya expirado o sea inválido',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}
