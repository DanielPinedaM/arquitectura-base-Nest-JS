import { ErrorLogsFilter } from '@/shared/filter/error-logs.filter';
import { StandardizeErrorResponseFilter } from '@/shared/filter/standardize-error-response.filter';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

/**
 * Nest ejecuta un unico exception filter por cada excepcion, nunca los encadena,
 * porque los busca con Array.find() y se detiene en el primero que coincida. por
 * eso este es el unico filter que se registra de forma global y su unica
 * responsabilidad es delegar en los demas, que conservan la suya:
 *
 * - ErrorLogsFilter                 -> registra el log del error
 * - StandardizeErrorResponseFilter  -> construye la respuesta http */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly errorLogsFilter: ErrorLogsFilter,
    private readonly standardizeErrorResponseFilter: StandardizeErrorResponseFilter,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    /* el log va primero porque construir la respuesta finaliza la peticion */
    this.errorLogsFilter.catch(exception, host);
    this.standardizeErrorResponseFilter.catch(exception, host);
  }
}
