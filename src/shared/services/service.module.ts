import { CryptoService } from '@/shared/services/crypto.service';
import { LoggerService } from '@/shared/services/logger.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [LoggerService, CryptoService],
  exports: [LoggerService, CryptoService],
})
export class ServiceModule {}
