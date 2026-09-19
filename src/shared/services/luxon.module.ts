import { LuxonService } from '@/shared/services/luxon.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [LuxonService],
  exports: [LuxonService],
})
export class LuxonModule {}
