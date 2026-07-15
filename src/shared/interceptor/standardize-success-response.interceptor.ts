import { IResponse } from '@/shared/data-types/interface/response.interfaces';
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getHttpStatusMessage } from '../data-types/constants/http-status-messages.const';

@Injectable()
export class StandardizeSuccessResponseInterceptor<
  T,
> implements NestInterceptor<T, IResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    const ctx: HttpArgumentsHost = context.switchToHttp();
    const response = ctx.getResponse();
    const isFile = response.getHeader('Content-Disposition');

    return next.handle().pipe(
      map((data: any) => {
        // obtener data
        const newData: any = this.#searchData(data);

        // responder directo con tipo archivo
        if (isFile) return newData;

        // paginacion
        const pagination = this.#searchPagination(newData);
        const resultData = pagination ? newData?.items : newData;

        // obtener http status
        const status =
          newData?.status ??
          newData?.statusCode ??
          response?.statusCode ??
          HttpStatus.OK;

        this.#clearData(newData);

        // obtener mensaje
        const message =
          this.#searchMessage(data) ??
          this.#searchMessage(newData) ??
          'Operación exitosa';

        return {
          success: true,
          status,
          statusText: getHttpStatusMessage(status),
          message,
          data: resultData,
          ...(pagination && { pagination }),
        };
      }),
    );
  }

  #searchData(data: any): any {
    return (
      data?.data?.data ??
      data?.data ??
      data?.datos?.datos ??
      data?.datos ??
      data?.dato?.dato ??
      data?.dato ??
      data?.result?.result ??
      data?.result ??
      data?.results?.results ??
      data?.results ??
      data?.payload?.payload ??
      data?.payload ??
      data?.respuesta?.respuesta ??
      data?.respuesta ??
      data?.respuestas?.respuestas ??
      data?.respuestas ??
      data?.response?.response ??
      data?.response ??
      data?.responses?.responses ??
      data?.responses ??
      data?.content?.content ??
      data?.content ??
      data?.contenido?.contenido ??
      data?.contenido ??
      data?.value?.value ??
      data?.value ??
      data?.valor?.valor ??
      data?.valor ??
      data
    );
  }

  #searchPagination(data: any): any {
    return data?.pagination ?? data?.paginacion ?? data?.paginador ?? undefined;
  }

  #searchMessage(data: any): any {
    return (
      data?.mensaje ??
      data?.message ??
      data?.msg ??
      data?.mensajeUsuario ??
      data?.mensajeExito ??
      data?.mensajeError ??
      data?.descripcion ??
      data?.descripcionError ??
      data?.detalle ??
      data?.detalles ??
      data?.texto ??
      data?.textoError ??
      data?.userMessage ??
      data?.successMessage ??
      data?.errorMessage ??
      data?.description ??
      data?.errorDescription ??
      data?.detail ??
      data?.details ??
      data?.text ??
      data?.texto ??
      data?.errorText ??
      undefined
    );
  }

  /**
  ¿la variable es un objeto literal? */
  #isLiteralObject = (literalObject: any): boolean => {
    return (
      typeof literalObject === 'object' &&
      literalObject !== null &&
      (Object.getPrototypeOf(literalObject) === Object.prototype ||
        Object.prototype.toString.call(literalObject) === '[object Object]')
    );
  };

  #clearData(data: any): void {
    if (!this.#isLiteralObject(data)) return;

    const keysToDelete: string[] = [
      'status',
      'statusCode',
      'mensaje',
      'message',
      'msg',
      'mensajeUsuario',
      'mensajeExito',
      'mensajeError',
      'descripcion',
      'descripcionError',
      'detalle',
      'detalles',
      'texto',
      'textoError',
      'userMessage',
      'successMessage',
      'errorMessage',
      'description',
      'errorDescription',
      'detail',
      'details',
      'text',
      'texto',
      'errorText',
    ];

    keysToDelete.forEach((key: string) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        delete data[key];
      }
    });
  }
}
