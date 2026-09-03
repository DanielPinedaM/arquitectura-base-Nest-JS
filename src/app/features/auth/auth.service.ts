/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await --
 * la implementacion real de registerUser() esta comentada hasta que se habilite
 * la base de datos, y con ella quedan sin uso su parametro y su await. no se
 * pueden eliminar porque el parametro forma parte de la firma que invoca
 * AuthController y las firmas asincronas son el contrato publico del service */

import {
  IDecryptedCredentials,
  IJwtPayload,
  ILoginResponse,
  ILogoutResponse,
  IRegisterResponse,
} from '@/app/features/auth/data-types/interface/auth.interfaces';
import { RegisterDto } from '@/app/features/auth/dto/register.schema';
import { Users } from '@/app/features/auth/entities/users.entity';
import { CryptoService } from '@/shared/services/crypto.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ENV_VARS, EnvironmentClass } from 'environments/env-config.schema';
import type { Response } from 'express';
import { Repository } from 'typeorm';

/**
 * import que solo consume la implementacion comentada de registerUser(). queda
 * comentado junto a ella para que el archivo no arrastre dependencias sin uso */
// import { ConflictException } from '@nestjs/common';

/** contraseña segura, minimo un caracter y debe contener un caracter especial, un numero, una mayuscula y una minuscula */
const SECURE_PASSWORD_REGEX =
  /^(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])(?=.*[0-9])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*[a-záéíóúüñ]).+$/

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly env: ConfigService<EnvironmentClass>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async decryptCredentials(
    encryptedEmail: string,
    encryptedPassword: string,
  ): Promise<IDecryptedCredentials> {
    const [decryptedEmail, decryptedPassword] = await Promise.all([
      this.cryptoService.decrypt(encryptedEmail),
      this.cryptoService.decrypt(encryptedPassword),
    ]);

    return { decryptedEmail, decryptedPassword };
  }

  generateToken(data: IJwtPayload): string {
    const token: IJwtPayload = {
      id: data?.id,
      email: data?.email,
      username: data?.username,
    };

    return this.jwtService.sign(token);
  }

  async login(
    encryptedEmail: string,
    encryptedPassword: string,
    response: Response,
  ): Promise<ILoginResponse> {
    const { decryptedEmail, decryptedPassword } = await this.decryptCredentials(
      encryptedEmail,
      encryptedPassword,
    );

    if (!SECURE_PASSWORD_REGEX.test(decryptedPassword))
      throw new UnauthorizedException('usuario o correo inválidos');

    const foundUser: Users | null = await this.usersRepository.findOne({
      where: { email: decryptedEmail },
    });

    if (!foundUser)
      throw new UnauthorizedException('El usuario no esta registrado');

    const isPasswordValid: boolean = await bcrypt.compare(
      decryptedPassword,
      foundUser.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Usuario o correo inválidos');

    const token = this.generateToken(foundUser);

    response.cookie('token', token, {
      httpOnly: true,
      secure: this.env.get(ENV_VARS.NODE_ENV) === 'production',
      sameSite:
        this.env.get(ENV_VARS.NODE_ENV) === 'production' ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60,
    });

    const { id, password, creationDate, ...rest } = foundUser;
    const data = { ...rest };

    return { message: 'inicio de sesión exitoso', data };
  }

  async logout(response: Response): Promise<ILogoutResponse> {
    response.clearCookie('token', {
      httpOnly: true,
      secure: this.env.get(ENV_VARS.NODE_ENV) === 'production',
      sameSite:
        this.env.get(ENV_VARS.NODE_ENV) === 'production' ? 'strict' : 'lax',
    });

    return {
      message: 'cierre de sesión exitoso',
    };
  }

  async registerUser(registerDto: RegisterDto): Promise<IRegisterResponse> {
    const {
      email: encryptedEmail,
      password: encryptedPassword,
      username,
    } = registerDto;

    const { decryptedEmail, decryptedPassword } = await this.decryptCredentials(
      encryptedEmail,
      encryptedPassword,
    );

    // Verificar si el email ya existe
    const existingUser: Users | null = await this.usersRepository.findOne({
      where: { email: decryptedEmail },
    });
    if (existingUser)
      throw new ConflictException('el correo ya está registrado');

    const hashedPassword: string = await bcrypt.hash(decryptedPassword, 10);

    const newUser: Users = this.usersRepository.create({
      email: decryptedEmail,
      username,
      password: hashedPassword,
    });

    await this.usersRepository.save(newUser);

    return {
      message: 'usuario registrado exitosamente',
    };
  }
}
