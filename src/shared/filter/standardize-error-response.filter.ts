/**
Nest js - typescript - ExceptionFilter
devolver dentro de data cualquier tipo de dato

message tiene q ser string

error siempre tiene q estar en la key error, separada, sin importar sin importar su tipo

solamente concatenar error + message cuando se defina manualmente la key error

si solamente existe message tipo string entonces agregarlo a key message

siempre para message y error accederlos de forma segura con ?. optional chaining

siempre para message y error usar operador coalesente nulo asi, esto es solo un ejemplo
   const message =
          newData?.mensaje ??
          newData?.message ??
          newData?.msg ??
          'Internal server error'

lo mismo para error
   const message =
          newData?.error ??
          newData?.err ??
          AQUI VA EL OBJETO ERROR

NO usar ternarias anidadas, ni switch case, siempre usar if else con let para los condicionales

error, message y data son keys totalmente a parte, son diferentes

no quiero q  dentro de la key error.message este lo mismo q en message, los message solamente van en message 

hacer q los status code correspondan a los de las excepciones de next,
no quiero q las excepciones de nest me den un status y q  despues defina otro status manualmente y se reemplace en objeto,

controlar con optional chaining y operador coalesente nulo el acceso a status asi, ejemplo

   const status =
          newData?.status ??
          newData?.statusCode ??
          AQUI VA EL STATUS REAL DEL EXCEPTION DE NEST

siempre dar prioridad al status q devuelve el exception de nest y detectar otros status

mucho cuidado, los status tienen q coincidir, la key de status en este interceptor y la q se muestra en navegador inspecionar elemento tienen q ser las mismas

Ejemplo
✔️ Si usas throw new BadRequestException() → status será 400.
❌ Si usas throw new Error() o throw { message: '...' } → no hay status definido → usas 500 por defecto.

la respuesta tiene q ser esta 
response.status(status).json({
      success: false, // esto esta quemado porque la respuesta es erronea
      status, // obtener numero de status
      statusText: getHttpStatusMessage(status), // esto es un acceso a un objeto literal
      message, // siempre tipo string
      errorDescription: {
        timestamp: new Date().toISOString(),
        path: request.url,
        error, // es objeto o array
      },
      data, // cualquier tipo de dato
    });


muestrame las excepciones mas usadas y como responde con el interceptor

con el interceptor anterior dame ejemplo de esto:
solamente concatenar error + message cuando se defina manualmente la key error */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { DateTime } from 'luxon';
import { getHttpStatusMessage } from '../data-types/constants/http-status-messages.const';

@Catch()
export class StandardizeErrorResponseFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();
    const request = ctx.getRequest<ExpressRequest>();

    const baseStatus: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const initialRaw: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error', error: 'Unknown Error' };

    const status =
      baseStatus ??
      initialRaw?.status ??
      initialRaw?.statusCode ??
      HttpStatus.INTERNAL_SERVER_ERROR;

    // Detectamos mensajes
    let message: string = '';
    let messagesArray: string[] = [];

    if (Array.isArray(initialRaw?.message)) {
      messagesArray = initialRaw.message; // <- errores de DTO
      message = messagesArray.join(', ');
    } else if (typeof initialRaw?.message === 'string') {
      message = initialRaw.message;
    } else {
      message = 'Internal server error';
    }

    // Error separado
    let error: any = {};
    if (
      (typeof initialRaw?.error === 'object' && initialRaw.error !== null) ||
      Array.isArray(initialRaw?.error)
    ) {
      error = initialRaw.error;
    } else if (typeof initialRaw?.error === 'string') {
      error = initialRaw.error;
    }

    // Data genérica
    let data: any = [];
    if (typeof initialRaw === 'object' && initialRaw !== null)
      data = initialRaw?.data ?? initialRaw?.payload ?? [];

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
