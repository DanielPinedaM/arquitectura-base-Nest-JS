# Ejecución de Proyecto

* Runtime: Node.js
* Administrador de versiones: fnm
* Manejador de paquetes: pnpm
* Archivo de bloqueo: pnpm-lock.yaml

# Scripts de desarrollo

| Comando            | Ambiente      | Variable de Entorno            |
| ------------------ | ------------- | ------------------------------ |
| `pnpm start:local` | Local host    | `environments/.env.localhost`  |
| `pnpm start:test`  | Pruebas       | `environments/.env.test`       |
| `pnpm start:prod`  | Producción    | `environments/.env.production` |

# Generar Carpeta `dist` (build) para Desplegar
`pnpm build` genera el `dist`. Es un solo script, sin ambiente, porque el build no hardcodea los valores de las variables de entorno en el código compilado.

# Ejecutar Carpeta `dist` con Archivos de Compilación
Estos scripts ejecutan el `dist` que previamente se generó con `pn build`. Requieren que exista la carpeta `dist`, de lo contrario fallan.

| Comando          | Ambiente     | Variable de Entorno            |
| ---------------- | ------------ | ------------------------------ |
| `pnpm dist:test` | Pruebas      | `environments/.env.test`       |
| `pnpm dist:prod` | Producción   | `environments/.env.production` |

# Reglas de Idioma

## Responder en Español
Responder en español siempre, es decir, redactar en español todas las explicaciones, comentarios de codigo, respuestas, preguntas, descripciones, análisis, recomendaciones, documentación y mensajes dirigidos al usuario. Con la excepcion de lo siguiente que tiene que estar en ingles:

## Excepciones, Responder en Ingles
* Términos técnicos de uso común en desarrollo de software: middleware, service, controller, repository, signal, interceptor, provider, endpoint, payload, patrones de diseño, etc.

* Nombres de frameworks, librerías, paquetes, APIs

* Código fuente (todo, **excepto los comentarios de codigo**): Identificadores, nombres de archivos y carpetas, clases, interface, enum, métodos, funciones, parámetros, variables, ruta base del controlador de Nest, ruta de endpoint de Nest

# Buenas Practicas de TypeScript
* Usar strict type checking

* Prefiere la inferencia de tipos cuando el tipo sea obvio

* Prohibido el tipo `any`; usa `unknown` cuando el tipo sea incierto

# Reglas **OBLIGATORIAS** para Nest.js
* Antes de escribir código o responder, consultar la skill en `.claude\skills\nestjs-best-practices\SKILL.md` (resuelta desde el directorio de este archivo). Esta fuente es la **única fuente de verdad** y su cumplimiento es **obligatorio**.

## Validaciones
* **OBLIGATORIO** usar `nestjs-zod` para validar DTOs: definir el schema con Zod (`z.object({...})`), crear el DTO con `createZodDto(schema)` como clase (no como `type`/`z.infer`), y aplicar la validación global con el `ZodValidationPipe` de `nestjs-zod` en lugar del `ValidationPipe` nativo

* **PROHIBIDO** usar `class-validator` y `class-transformer` (`@IsString()`, `@IsNotEmpty()`, `@IsEmail()`, `class-transformer`, `ValidationPipe` nativo de `@nestjs/common`, o cualquier DTO basado en decoradores) para validar requests, params o body

* **PROHIBIDO** usar Zod sin `nestjs-zod`: pipes de validación custom hechos a mano, DTOs como `type`/`z.infer` sin pasar por `createZodDto`, o `safeParse`/`parse` manual dentro de controllers o handlers