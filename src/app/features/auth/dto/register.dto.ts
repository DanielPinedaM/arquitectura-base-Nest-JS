import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ type: String, description: 'correo electrónico del usuario' })
  @IsEmail({}, { message: 'el correo es inválido' })
  @IsString()
  @Transform((params: TransformFnParams): string =>
    (params.value as string).trim(),
  )
  email!: string;

  @ApiProperty({ type: String, description: 'Nombre de usuario' })
  @IsString()
  username!: string;

  @ApiProperty({ type: String, description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
