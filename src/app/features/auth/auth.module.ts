import { AuthController } from '@/app/features/auth/auth.controller';
import { AuthService } from '@/app/features/auth/auth.service';
import { Users } from '@/app/features/auth/entities/users.entity';
import { CryptoModule } from '@/shared/services/crypto.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * la feature de auth se apoya en CryptoModule para desencriptar las
 * credenciales. la dependencia se declara aqui, no se resuelve por @Global().
 *
 * TypeOrmModule.forFeature([Users]) registra el repository de Users en el scope
 * de este modulo para poder inyectarlo dentro de AuthService */
@Module({
  imports: [CryptoModule, TypeOrmModule.forFeature([Users])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
