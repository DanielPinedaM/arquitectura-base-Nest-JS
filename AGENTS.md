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

# Builds para despliegue

| Comando           | Ambiente     | Variable de Entorno            |
| ----------------- | ------------ | ------------------------------ |
| `pnpm build:test` | Pruebas      | `environments/.env.test`       |
| `pnpm build:prod` | Producción   | `environments/.env.production` |

# Reglas de Idioma

## Responder en Español
Responder en español siempre, es decir, redactar en español todas las explicaciones, comentarios de codigo, respuestas, preguntas, descripciones, análisis, recomendaciones, documentación y mensajes dirigidos al usuario. Con la excepcion de lo siguiente que tiene que estar en ingles:

## Excepciones, Responder en Ingles
* Términos técnicos de uso común en desarrollo de software: middleware, service, controller, repository, signal, interceptor, provider, endpoint, payload, patrones de diseño, etc.

* Nombres de frameworks, librerías, paquetes, APIs

* Código fuente (todo, **excepto los comentarios de codigo**): Identificadores, nombres de archivos y carpetas, clases, interface, enum, métodos, funciones, parámetros, variables, ruta base del controlador de Nest, ruta de endpoint de Nest