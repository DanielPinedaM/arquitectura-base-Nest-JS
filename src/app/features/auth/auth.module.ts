import { AuthController } from '@/app/features/auth/auth.controller';
import { AuthService } from '@/app/features/auth/auth.service';
import { Users } from '@/app/features/auth/entities/users.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
