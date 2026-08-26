import { getHttpStatusMessage } from '@/shared/data-types/constants/http-status-messages.const';
import { readKey } from '@/shared/utils/object.util';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { DateTime } from 'luxon';

/**
 * unifica el cuerpo de toda respuesta de error. el contrato es:
 *
 * - `success`: siempre false, la respuesta es erronea
 * - `status`: manda el status real de la excepcion de Nest, para que coincida
 *   con el que ve el navegador. las excepciones que no son HttpException caen en
 *   500 (throw new Error(), throw { message: '...' }, etc.)
 * - `statusText`: se resuelve contra la tabla de HTTP_STATUS_MESSAGES
 * - `message`: siempre string. si la excepcion trae un arreglo de mensajes
 *   (errores de validacion del DTO) se unen separados por coma
 * - `data`: cualquier tipo de dato, sale de la key data o payload
 * - `description.error`: va en su propia key, separada de message y sin
 *   repetirlo. si hubo errores de DTO aqui viaja el arreglo completo
 * - `description.requestInfo` y `description.networkInfo`: contexto de la
 *   peticion para depurar
 *
 * message y error se leen siempre de forma segura, sin asumir la forma de la
 * excepcion */
@Catch()
export class StandardizeErrorResponseFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: ExpressResponse = ctx.getResponse<ExpressResponse>();
    const request: ExpressRequest = ctx.getRequest<ExpressRequest>();

    /* el status de la excepcion de Nest manda; lo que no es HttpException es 500 */
    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawResponse: unknown =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error', error: 'Unknown Error' };

    // Detectamos mensajes
    const rawMessage: unknown = readKey(rawResponse, 'message');

    let message: string;
    let messagesArray: string[] = [];

    if (Array.isArray(rawMessage)) {
      messagesArray = rawMessage as string[]; // <- errores de DTO
      message = messagesArray.join(', ');
    } else if (typeof rawMessage === 'string') {
      message = rawMessage;
    } else {
      message = 'Internal server error';
    }

    // Error separado
    const rawError: unknown = readKey(rawResponse, 'error');

    let error: unknown = {};
    if (rawError !== null && typeof rawError === 'object') {
      error = rawError;
    } else if (typeof rawError === 'string') {
      error = rawError;
    }

    // Data genérica
    let data: unknown = [];
    if (typeof rawResponse === 'object' && rawResponse !== null)
      data =
        readKey(rawResponse, 'data') ?? readKey(rawResponse, 'payload') ?? [];

    response.status(status).json({
      success: false,
      status,
      statusText: getHttpStatusMessage(status),
      message,
      data,
      description: {
        error: messagesArray.length > 0 ? messagesArray : error, // aquí guardamos el array del DTO si existe

        requestInfo: {
          method: request.method,
          contentType: request.headers['content-type'],
          userAgent: request.headers['user-agent'],
          timestamp: DateTime.now()
            .setLocale('es')
            .toFormat(
              "cccc, dd 'de' LLLL 'de' yyyy hh:mm:ss.SSS a ZZZZ 'UTC' Z",
            ),
        },

        networkInfo: {
          ip: request.ip,
          fullEndpointUrl: `${request.protocol}://${request?.get('host') ?? request?.hostname}${request.originalUrl}`,
          path: request.url,
        },
      },
    });
  }
}
