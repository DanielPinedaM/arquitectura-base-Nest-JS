import { ErrorLogsFilter } from '@/shared/filter/error-logs.filter';
import { GlobalExceptionFilter } from '@/shared/filter/global-exception.filter';
import { Module } from '@nestjs/common';

/**
 * solamente se exporta GlobalExceptionFilter porque es el unico que se registra
 * de forma global en main.ts. ErrorLogsFilter es su colaborador interno */
@Module({
  providers: [ErrorLogsFilter, GlobalExceptionFilter],
  exports: [GlobalExceptionFilter],
})
export class FilterModule {}
