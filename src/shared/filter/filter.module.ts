import { Module } from '@nestjs/common';
import { ErrorLogsFilter } from '@/shared/filter/error-logs.filter';
import { GlobalExceptionFilter } from '@/shared/filter/global-exception.filter';
import { StandardizeErrorResponseFilter } from '@/shared/filter/standardize-error-response.filter';

/**
 * solamente se exporta GlobalExceptionFilter porque es el unico que se registra
 * de forma global en main.ts. los otros dos son sus colaboradores internos */
@Module({
  providers: [
    ErrorLogsFilter,
    GlobalExceptionFilter,
    StandardizeErrorResponseFilter,
  ],
  exports: [GlobalExceptionFilter],
})
export class FilterModule {}
