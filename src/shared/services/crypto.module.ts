import { CryptoService } from '@/shared/services/crypto.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
