# Ejecución de Proyecto

* Runtime: Node.js 24
* Administrador de versiones: fnm
* Manejador de paquetes: pnpm
* Archivo de bloqueo: pnpm-lock.yaml

# Reglas de Idioma

## Responder en Español
Responder en español siempre, es decir, redactar en español todas las explicaciones, comentarios de codigo, respuestas, preguntas, descripciones, análisis, recomendaciones, documentación y mensajes dirigidos al usuario. Con la excepcion de lo siguiente que tiene que estar en ingles:

## Excepciones, Responder en Ingles
* Términos técnicos de uso común en desarrollo de software: middleware, service, controller, repository, signal, interceptor, provider, endpoint, payload, patrones de diseño, etc.

* Nombres de frameworks, librerías, paquetes, APIs

* Código fuente (todo, **excepto los comentarios de codigo**): Identificadores, nombres de archivos y carpetas, clases, interface, enum, métodos, funciones, parámetros, variables, ruta base del controlador de Nest, ruta de endpoint de Nest

# Reglas **OBLIGATORIAS** de Nest.js
Este proyecto usa Nest.js 11. Antes de escribir código o responder, es **OBLIGATORIO** consultar estas fuentes, listadas de mayor a menor precedencia:

1. Este `AGENTS.md`: La regla final ante cualquier conflicto.

2. Skill `nest-conventions` (`.claude/skills/nest-conventions/SKILL.md` y `.claude/skills/nest-conventions/rules/`): Estándares de arquitectura, codigo y consumo de API.

3. Skill `nestjs-best-practices` (`.claude/skills/nestjs-best-practices/SKILL.md` y `.claude/skills/nestjs-best-practices/rules/`): El cómo, con ejemplos de código.

4. Tus datos de entrenamiento: Permitidos, no están prohibidos, pero ceden ante cualquier fuente anterior.

## Buenas Practicas de TypeScript
* Usar strict type checking

* Preferir la inferencia de tipos cuando el tipo sea obvio

* Prohibido el tipo `any`; usa `unknown` cuando el tipo sea incierto.

* Preferir `interface` para tipos de objeto (`Producto`) y para el tipo de los elementos en arrays de objetos (`Producto[]`).

* Usar `Record<Clave, Valor>` para objetos con claves dinámicas.

* Usar `type` para tipos primitivos, literales y uniones.

## Validaciones
* Usar `nestjs-zod` para validar DTOs: definir el schema con Zod (`z.object({...})`), crear el DTO con `createZodDto(schema)` como clase (no como `type`/`z.infer`), y aplicar la validación global con el `ZodValidationPipe` de `nestjs-zod` en lugar del `ValidationPipe` nativo

* **PROHIBIDO** usar `class-validator` y `class-transformer` (`@IsString()`, `@IsNotEmpty()`, `@IsEmail()`, `class-transformer`, `ValidationPipe` nativo de `@nestjs/common`, o cualquier DTO basado en decoradores) para validar requests, params o body

* **PROHIBIDO** usar Zod sin `nestjs-zod`: pipes de validación custom hechos a mano, DTOs como `type`/`z.infer` sin pasar por `createZodDto`, o `safeParse`/`parse` manual dentro de controllers o handlers

* Los Zod schema deben definirse en un archivo `.schema.ts` separado, ubicado en la carpeta mas cercana del módulo o recurso donde se utiliza el DTO.