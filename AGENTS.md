# Descripción del Proyecto
Arquitectura base agnóstica a las features para iniciar un nuevo proyecto en Nest.js, configurada para trabajar con IA

# Ejecución de Proyecto

* Runtime: Node.js 24
* Administrador de versiones: fnm
* Manejador de paquetes: pnpm
* Archivo de bloqueo: pnpm-lock.yaml

# Reglas **OBLIGATORIAS** de Nest.js

## Fuentes de consulta
Antes de editar código y responder, consulta solo las fuentes cuya columna **¿Cuándo leerlo?** coincida con la tarea, y aplica a la vez las reglas y la documentación consultadas.

Cuando las fuentes se contradicen, gana la de número menor en la columna **Prioridad**:

| Prioridad | Fuente | ¿Qué es? | ¿Cuándo leerlo? |
| --- | --- | --- | --- |
| 1 | [Skill `nestjs-conventions`](.agents/skills/nestjs-conventions/SKILL.md) | Reglas propias del proyecto | Antes de crear, mover, modificar o revisar código, y al responder cómo se hace algo en este proyecto. |
| 2 | [Skill `nestjs-best-practices`](.agents/skills/nestjs-best-practices/SKILL.md) | Reglas de terceros: buenas prácticas generales de Nest.js | Al crear, modificar o revisar código de Nest.js. |
| 3 | tool `search_prisma_documentation` del Prisma MCP server | [Documentación oficial completa de Prisma ORM](https://www.prisma.io/docs) | Al responder y usar APIs de Prisma (aunque creas conocerla) y ante errores |
| 4 | Datos de entrenamiento | Tu conocimiento previo | Puedes usarlo, pero las fuentes anteriores tienen prioridad: este proyecto usa Nest.js 11 y Prisma 8, cuyos breaking changes pueden haberlo dejado desactualizado. Que esté desactualizado no significa que esté mal; solo que puede no aplicar a esta versión. |

## Preguntar
Si detectas un error, una inconsistencia o una ambigüedad, o tienes alguna duda, detente y pregúntame antes de escribir o modificar código. No supongas cómo debe implementarse algo.

**Razón:** preguntar cuesta menos que revisar y deshacer código basado en una suposición incorrecta.

# Resumen de la Skill `nestjs-conventions`

## Validaciones
* Usar `nestjs-zod` para validar DTOs: definir el schema con Zod (`z.object({...})`), crear el DTO con `createZodDto(schema)` como clase (no como `type`/`z.infer`), y aplicar la validación global con el `ZodValidationPipe` de `nestjs-zod` en lugar del `ValidationPipe` nativo

* **PROHIBIDO** usar `class-validator` y `class-transformer` (`@IsString()`, `@IsNotEmpty()`, `@IsEmail()`, `class-transformer`, `ValidationPipe` nativo de `@nestjs/common`, o cualquier DTO basado en decoradores) para validar requests, params o body

* **PROHIBIDO** usar Zod sin `nestjs-zod`: pipes de validación custom hechos a mano, DTOs como `type`/`z.infer` sin pasar por `createZodDto`, o `safeParse`/`parse` manual dentro de controllers o handlers

* Los Zod schema deben definirse en un archivo `.schema.ts` separado, ubicado en la carpeta mas cercana del módulo o recurso donde se utiliza el DTO.