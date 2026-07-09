# Ejecución de Proyecto

* Runtime: Node.js
* Administrador de versiones: fnm
* Manejador de paquetes: pnpm
* Archivo de bloqueo: pnpm-lock.yaml

# Scripts de desarrollo

| Comando            | Entorno      | Archivo de configuración                    |
| ------------------ | ------------ | ------------------------------------------- |
| `pnpm start:local` | local host   | `src/environments/environment.localhost.ts` |
| `pnpm start:prod`  | producción   | `src/environments/environment.prod.ts`      |
| `pnpm start:test`  | pruebas      | `src/environments/environment.test.ts`      |

# Builds para despliegue

| Comando           | Entorno      | Archivo de configuración               |
| ----------------- | ------------ | -------------------------------------- |
| `pnpm build:test` | pruebas      | `src/environments/environment.test.ts` |
| `pnpm build:prod` | producción   | `src/environments/environment.prod.ts` |

# Reglas Obligatorias para la IA
* No generes análisis, recomendaciones ni comentarios adicionales hasta que empiece a realizar preguntas.

* Todas las respuestas, recomendaciones y fragmentos de código deben respetar obligatoriamente la arquitectura, reglas, patrones y convenciones definidas en este documento.

* No cuestiones, reemplaces, contradigas ni ignores las decisiones de arquitectura definidas en este proyecto.

* Siempre que respondas con código, debes indicar explícitamente la ubicación exacta de cada archivo basándote en la estructura base del proyecto definida en este documento.

* Si existe alguna ambigüedad, falta de contexto o algún aspecto importante de arquitectura, estructura o convenciones que no esté definido, primero debes preguntar antes de asumir una implementación.

* Si durante la conversación recibes instrucciones contradictorias, debes priorizar siempre las reglas y decisiones definidas inicialmente en este documento.

* La arquitectura, reglas y convenciones definidas en este documento tienen prioridad absoluta. Sin embargo, como no todos los casos posibles están documentados, si un problema no puede resolverse respetando la arquitectura actual o requiere una solución no contemplada en el README, primero debes advertir explícitamente que dicha solución se sale de la arquitectura o convenciones establecidas antes de generar una implementación.

# Reglas de Idioma

## Responder en Español
Responder en español siempre, excepto lo que esta en "Excepciones, Responder en Ingles"

Es decir, redactar en español todas las explicaciones, comentarios de codigo, respuestas, preguntas, descripciones, análisis, recomendaciones, documentación y mensajes dirigidos al usuario. Con la excepcion de lo siguiente que tiene que estar en ingles:

## Excepciones, Responder en Ingles
* Términos técnicos de uso común en desarrollo de software: middleware, service, controller, repository, signal, interceptor, provider, endpoint, payload, patrones de diseño, etc.

* Nombres de frameworks, librerías, paquetes, APIs

* Código fuente (todo, **excepto los comentarios de codigo**): Identificadores, nombres de archivos y carpetas, clases, interface, enum, métodos, funciones, parámetros, variables, ruta base del controlador de Nest, ruta de endpoint de Nest