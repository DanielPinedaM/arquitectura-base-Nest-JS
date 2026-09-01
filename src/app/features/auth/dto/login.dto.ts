import { createZodDto, type ZodDto } from 'nestjs-zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .check(z.email('El correo es inválido'))
    .meta({ description: 'Correo electrónico del usuario' }),

  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .meta({ description: 'Contraseña del usuario' }),
});

const LoginDtoBase: ZodDto<typeof loginSchema, false> =
  createZodDto(loginSchema);

export class LoginDto extends LoginDtoBase {}
