import { getHttpStatusMessage } from '@/shared/data-types/constants/http-status-messages.const';
import {
  DATA_KEYS,
  MESSAGE_KEYS,
  PAGINATION_KEYS,
  RESPONSE_METADATA_KEYS,
} from '@/shared/data-types/constants/response-keys.const';
import {
  IPagination,
  IResponse,
} from '@/shared/data-types/interface/response.interfaces';
import {
  isLiteralObject,
  readFirstKey,
  readKey,
} from '@/shared/utils/object.util';
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import type { Response as ExpressResponse } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * normaliza toda respuesta exitosa al contrato IResponse: extrae el contenido
 * util, el mensaje, el status y la paginacion sin importar con que alias los
 * haya nombrado el service (ver response-keys.const.ts) */
@Injectable()
export class StandardizeSuccessResponseInterceptor<
  T,
> implements NestInterceptor<T, IResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    const ctx: HttpArgumentsHost = context.switchToHttp();
    const response: ExpressResponse = ctx.getResponse<ExpressResponse>();
    const isFile: number | string | string[] | undefined = response.getHeader(
      'Content-Disposition',
    );

    return next.handle().pipe(
      map((data: unknown): IResponse<T> => {
        // obtener data
        const newData: unknown = this.#searchData(data);

        /* responder directo con tipo archivo: la descarga viaja tal cual, sin
           envolverse en IResponse */
        if (isFile) return newData as IResponse<T>;

        // paginacion
        const pagination: unknown = readFirstKey(newData, PAGINATION_KEYS);
        const resultData: unknown = pagination
          ? readKey(newData, 'items')
          : newData;

        // obtener http status
        const status: number = (readKey(newData, 'status') ??
          readKey(newData, 'statusCode') ??
          response.statusCode ??
          HttpStatus.OK) as number;

        this.#clearData(newData);

        // obtener mensaje
        const message: string = (readFirstKey(data, MESSAGE_KEYS) ??
          readFirstKey(newData, MESSAGE_KEYS) ??
          'Operación exitosa') as string;

        return {
          success: true,
          status,
          statusText: getHttpStatusMessage(status),
          message,
          data: resultData as T,
          ...(pagination ? { pagination: pagination as IPagination } : {}),
        };
      }),
    );
  }

  /**
  busca el contenido util recorriendo los alias de DATA_KEYS.

  por cada alias mira primero el valor anidado (data.data) y luego el directo
  (data). si ningun alias existe devuelve el dato original sin tocar */
  #searchData(data: unknown): unknown {
    for (const key of DATA_KEYS) {
      const value: unknown = readKey(data, key);
      if (value === undefined || value === null) continue;

      return readKey(value, key) ?? value;
    }

    return data;
  }

  /**
  borra del contenido las keys que ya viajan en la raiz de IResponse */
  #clearData(data: unknown): void {
    if (!isLiteralObject(data)) return;

    const target: Record<string, unknown> = data as Record<string, unknown>;

    RESPONSE_METADATA_KEYS.forEach((key: string) => {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        delete target[key];
      }
    });
  }
}
