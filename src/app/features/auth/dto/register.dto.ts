import { createZodDto, type ZodDto } from 'nestjs-zod';
import { z } from 'zod';

const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .check(z.email('el correo es inválido'))
    .meta({ description: 'correo electrónico del usuario' }),

  username: z.string().meta({ description: 'Nombre de usuario' }),

  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .meta({ description: 'Contraseña del usuario' }),
});

const RegisterDtoBase: ZodDto<typeof registerSchema, false> =
  createZodDto(registerSchema);

export class RegisterDto extends RegisterDtoBase {}
