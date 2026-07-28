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