# Ejecución de Proyecto

* Runtime: Node.js 24
* Administrador de versiones: fnm
* Manejador de paquetes: pnpm
* Archivo de bloqueo: pnpm-lock.yaml


# Reglas **OBLIGATORIAS** de Nest.js
Este proyecto usa Nest.js 11. Antes de escribir código o responder, consultar estas fuentes, listadas de mayor a menor precedencia:

1. Skill `nest-conventions` (`.claude/skills/nest-conventions/SKILL.md` y `.claude/skills/nest-conventions/rules/`): Reglas propias del proyecto que definen su arquitectura.

2. Skill `nestjs-best-practices` (`.claude/skills/nestjs-best-practices/SKILL.md` y `.claude/skills/nestjs-best-practices/rules/`): El cómo, con ejemplos de código.

3. Tus datos de entrenamiento: Permitidos, no están prohibidos, pero ceden ante cualquier fuente anterior.

# Resumen de la Skill `nest-conventions`

## Tipado en TypeScript
* Usar strict type checking

* Preferir la inferencia de tipos cuando el tipo sea obvio

* Prohibido el tipo `any`; usa `unknown` cuando el tipo sea incierto.

* Preferir `interface` para tipos de objeto (`Task`) y para el tipo de los elementos en arrays de objetos (`Task[]`).

* Usar `Record<Clave, Valor>` para objetos con claves dinámicas.

* Usar `type` para tipos primitivos, literales y uniones.

## Validaciones
* Usar `nestjs-zod` para validar DTOs: definir el schema con Zod (`z.object({...})`), crear el DTO con `createZodDto(schema)` como clase (no como `type`/`z.infer`), y aplicar la validación global con el `ZodValidationPipe` de `nestjs-zod` en lugar del `ValidationPipe` nativo

* **PROHIBIDO** usar `class-validator` y `class-transformer` (`@IsString()`, `@IsNotEmpty()`, `@IsEmail()`, `class-transformer`, `ValidationPipe` nativo de `@nestjs/common`, o cualquier DTO basado en decoradores) para validar requests, params o body

* **PROHIBIDO** usar Zod sin `nestjs-zod`: pipes de validación custom hechos a mano, DTOs como `type`/`z.infer` sin pasar por `createZodDto`, o `safeParse`/`parse` manual dentro de controllers o handlers

* Los Zod schema deben definirse en un archivo `.schema.ts` separado, ubicado en la carpeta mas cercana del módulo o recurso donde se utiliza el DTO.