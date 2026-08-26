import { ErrorLogsFilter } from '@/shared/filter/error-logs.filter';
import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

/**
 * Nest ejecuta un unico exception filter por cada excepcion, nunca los encadena,
 * porque los busca con Array.find() y se detiene en el primero que coincida. por
 * eso este es el unico filter que se registra de forma global y se limita a
 * repartir el trabajo:
 *
 * - ErrorLogsFilter     -> registra el log del error, no responde nada
 * - BaseExceptionFilter -> es el filter por defecto de Nest y el que finaliza la
 *                          peticion con el formato de error del framework */
@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly errorLogsFilter: ErrorLogsFilter) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    /* el log va primero porque construir la respuesta finaliza la peticion */
    this.errorLogsFilter.catch(exception, host);
    super.catch(exception, host);
  }
}
