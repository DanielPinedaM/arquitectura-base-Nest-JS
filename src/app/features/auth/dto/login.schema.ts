import { createZodDto, type ZodDto } from 'nestjs-zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z
    .string({ error: 'Correo es obligatorio' })
    .min(1, 'Correo es obligatorio')
    .pipe(z.email('Correo invalido')),

  password: z
    .string({ error: 'Contraseña es obligatoria' })
    .min(1, 'Contraseña es obligatoria'),
});

const LoginDtoBase: ZodDto<typeof loginSchema, false> = createZodDto(loginSchema);

export class LoginDto extends LoginDtoBase {}
