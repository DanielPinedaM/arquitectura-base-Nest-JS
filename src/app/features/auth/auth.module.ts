import { AuthController } from '@/app/features/auth/auth.controller';
import { AuthService } from '@/app/features/auth/auth.service';
import { CryptoModule } from '@/shared/services/crypto.module';
import { Module } from '@nestjs/common';

/**
 * la feature de auth se apoya en CryptoModule para desencriptar las
 * credenciales. la dependencia se declara aqui, no se resuelve por @Global().
 *
 * cuando se habilite la base de datos hay que agregar a imports[]
 * TypeOrmModule.forFeature([Users]) para poder inyectar el repository de Users
 * dentro de AuthService */
@Module({
  imports: [CryptoModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
