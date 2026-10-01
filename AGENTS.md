# Descripción del Proyecto
Arquitectura base agnóstica a las features para iniciar un nuevo proyecto en Nest.js, configurada para trabajar con IA

# Ejecución de Proyecto

* Runtime: Node.js 24
* Administrador de versiones: fnm
* Manejador de paquetes: pnpm
* Archivo de bloqueo: pnpm-lock.yaml

# Ante Cualquier Error o Ambigüedad
Si encuentras un error, inconsistencia, duda o ambigüedad, detente y pregúntame antes de modificar código. No asumas ni deduzcas implementaciones.

**Razón**: una suposición incorrecta genera código que después hay que revisar y deshacer; preguntar cuesta menos que corregir una implementación equivocada.

# Reglas **OBLIGATORIAS** de Nest.js
Este proyecto usa Nest.js 11. Antes de editar código y responder, consultar estas fuentes. Cuando las fuentes se contradicen, gana la de número menor:

1. [Skill `nestjs-conventions`](.agents/skills/nestjs-conventions/SKILL.md): Reglas propias del proyecto que definen su arquitectura. Ignorarla genera código inescalable.

2. [Skill `nestjs-best-practices`](.agents/skills/nestjs-best-practices/): Buenas prácticas generales de NestJS

3. Datos de entrenamiento: válidos, pero ceden ante todo lo anterior.

# Resumen de la Skill `nestjs-conventions`

## Validaciones
* Usar `nestjs-zod` para validar DTOs: definir el schema con Zod (`z.object({...})`), crear el DTO con `createZodDto(schema)` como clase (no como `type`/`z.infer`), y aplicar la validación global con el `ZodValidationPipe` de `nestjs-zod` en lugar del `ValidationPipe` nativo

* **PROHIBIDO** usar `class-validator` y `class-transformer` (`@IsString()`, `@IsNotEmpty()`, `@IsEmail()`, `class-transformer`, `ValidationPipe` nativo de `@nestjs/common`, o cualquier DTO basado en decoradores) para validar requests, params o body

* **PROHIBIDO** usar Zod sin `nestjs-zod`: pipes de validación custom hechos a mano, DTOs como `type`/`z.infer` sin pasar por `createZodDto`, o `safeParse`/`parse` manual dentro de controllers o handlers

* Los Zod schema deben definirse en un archivo `.schema.ts` separado, ubicado en la carpeta mas cercana del módulo o recurso donde se utiliza el DTO.