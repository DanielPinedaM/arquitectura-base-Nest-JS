---
name: nestjs-best-practices
description: Buenas prácticas y patrones de arquitectura de NestJS para construir aplicaciones listas para producción. Esta skill debe usarse al escribir, revisar o refactorizar código de NestJS para asegurar patrones correctos de módulos, inyección de dependencias, seguridad y rendimiento.
license: MIT
metadata:
  author: Kadajett
  version: "1.2.0"
---

# Buenas prácticas de NestJS

## Resumen

Guía completa de buenas prácticas para aplicaciones de NestJS. Contiene 40 reglas en 10 categorías, priorizadas por impacto para guiar la refactorización y la generación de código automatizadas.

## Cuándo aplicar la skill

Consulta estos lineamientos cuando:

- Escribas nuevos módulos, controllers o servicios de NestJS
- Implementes la autenticación y la autorización
- Revises código en busca de problemas de arquitectura y seguridad
- Refactorices codebases existentes de NestJS
- Optimices el rendimiento o las queries a la base de datos
- Construyas arquitecturas de microservicios

## ¿Cómo Leer la Skill?

Lee **bajo demanda** los archivos `.md` ubicados en [`.agents/skills/nestjs-best-practices/reglas/`](reglas/): usa la [Tabla de Contenido](#tabla-de-contenido) como referencia para inferir cuáles archivos son necesarios para la tarea que estás resolviendo, y accede únicamente a esos archivos.

**Razón**: leer todos los archivos consume contexto y tokens innecesariamente.

Hay dos criterios para leer un archivo:

1. La columna **¿Cuándo leerlo?**: abre el archivo cuando tu tarea coincida con la situación que describe.

2. El **impacto** (CRITICAL → HIGH → MEDIUM-HIGH → MEDIUM → LOW-MEDIUM → LOW) que aparece entre paréntesis en el subtítulo de cada categoría de la [Tabla de Contenido](#tabla-de-contenido). Consulta las [Categorías de reglas por prioridad](#categorías-de-reglas-por-prioridad).

Cada archivo de regla contiene: una breve explicación de por qué es importante, un ejemplo de código incorrecto, un ejemplo de código correcto y contexto adicional con referencias.

## Categorías de reglas por prioridad

| Prioridad | Categoría | Impacto | Prefijo |
|----------|----------|--------|--------|
| 1 | [Arquitectura](#1-arquitectura-critical) | CRITICAL | `arch-` |
| 2 | [Inyección de dependencias](#2-inyección-de-dependencias-critical) | CRITICAL | `di-` |
| 3 | [Manejo de errores](#3-manejo-de-errores-high) | HIGH | `error-` |
| 4 | [Seguridad](#4-seguridad-high) | HIGH | `security-` |
| 5 | [Rendimiento](#5-rendimiento-high) | HIGH | `perf-` |
| 6 | [Testing](#6-testing-medium-high) | MEDIUM-HIGH | `test-` |
| 7 | [Base de datos y ORM](#7-base-de-datos-y-orm-medium-high) | MEDIUM-HIGH | `db-` |
| 8 | [Diseño de APIs](#8-diseño-de-apis-medium) | MEDIUM | `api-` |
| 9 | [Microservicios](#9-microservicios-medium) | MEDIUM | `micro-` |
| 10 | [DevOps y deployment](#10-devops-y-deployment-low-medium) | LOW-MEDIUM | `devops-` |

## Tabla de Contenido

### 1. Arquitectura (CRITICAL)

Carpeta: [reglas/arquitectura/](reglas/arquitectura/)

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Evita las dependencias circulares](reglas/arquitectura/arch-evitar-dependencias-circulares.md) | Cuando dos módulos se importan entre sí, directa o transitivamente (`UsersModule` ↔ `OrdersModule`), cuando aparece un error de dependencia circular o un crash al arrancar la app, o cuando estás por usar `forwardRef()` para «resolverlo»: extrae la lógica compartida a un tercer módulo o comunica los módulos con eventos (`EventEmitter2`, `@OnEvent`). |
| [Organiza por feature modules](reglas/arquitectura/arch-feature-modules.md) | Al crear un proyecto o un módulo nuevo, o al reorganizar las carpetas de `src/`: organiza por feature modules autocontenidos (`users/` con su controller, service, repository, entities y DTOs) en lugar de carpetas por capa técnica (`controllers/`, `services/`, `entities/`), y exporta desde cada módulo solo lo que otros necesitan. |
| [Usa patrones correctos para compartir módulos](reglas/arquitectura/arch-compartir-modulos.md) | Cuando un servicio se necesita en varios módulos y está registrado (o se va a registrar) en más de un array `providers`, lo que crea instancias separadas con estado distinto, o al decidir entre exportarlo desde un módulo dedicado, marcar un módulo con `@Global()` o re-exportar módulos (`exports: [CommonModule]`): explica cómo compartir una única instancia singleton. |
| [Responsabilidad única para los servicios](reglas/arquitectura/arch-responsabilidad-unica.md) | Al crear, revisar o dividir un servicio que mezcla varios conceptos del dominio (un «god service» como `UserAndOrderService`, con «And» en el nombre o muchas dependencias inyectadas sin relación entre sí): cada servicio debe tener una sola responsabilidad, y la orquestación va en el controller o en un orquestador dedicado. |
| [Usa el Repository Pattern para el acceso a datos](reglas/arquitectura/arch-usar-repository-pattern.md) | Cuando un service contiene queries complejas (`createQueryBuilder`, `leftJoinAndSelect`, `groupBy`, `having`) mezcladas con la lógica de negocio, o al diseñar la capa de acceso a datos para poder testear con repositories mock: encapsula las queries en un repository personalizado (`UsersRepository`) que el service inyecta. |
| [Usa una arquitectura basada en eventos para el desacoplamiento](reglas/arquitectura/arch-usar-eventos.md) | Cuando un service llama directamente a muchos otros services después de una acción (por ejemplo, al crear una orden: inventario, email, analytics, notificaciones y puntos) o cuando agregar un comportamiento nuevo obliga a modificar ese service: emite un evento dentro de la misma aplicación con `@nestjs/event-emitter` (`EventEmitter2.emit`, `@OnEvent`) y procésalo en listeners de otros módulos. |

### 2. Inyección de dependencias (CRITICAL)

Carpeta: [reglas/inyeccion-de-dependencias/](reglas/inyeccion-de-dependencias/)

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Evita el anti-pattern Service Locator](reglas/inyeccion-de-dependencias/di-evitar-service-locator.md) | Cuando un service resuelve sus dependencias en runtime con `ModuleRef.get()` o con un contenedor global (`ServiceContainer.getInstance()`) en lugar de recibirlas en el constructor, o al revisar código cuyas dependencias no se ven en el constructor: explica por qué ocultarlas rompe la testeabilidad y en qué caso `ModuleRef` sí es válido (una factory que elige el handler según el tipo). |
| [Aplica el Interface Segregation Principle](reglas/inyeccion-de-dependencias/di-interface-segregation.md) | Al diseñar las interfaces que inyectan los services, o cuando un consumidor depende de una interfaz «gorda» (por ejemplo, un `NotificationService` con email, SMS, push y logging) aunque use un solo método y los tests obligan a hacer mock de métodos que nunca se llaman: divide la interfaz por capacidad (`EmailSender`, `SmsSender`), regístralas con tokens y combínalas solo cuando un consumidor realmente necesite varias. |
| [Respeta el Liskov Substitution Principle](reglas/inyeccion-de-dependencias/di-liskov-substitution.md) | Al escribir una implementación alternativa o un mock de una interfaz o clase abstracta inyectada (por ejemplo, `MockPaymentService` frente a `StripeService` detrás de `PaymentGateway`), o cuando cambiar de implementación rompe a quien la llama (devuelve `null`, le faltan campos o lanza excepciones distintas): cada implementación debe respetar el contrato completo, y se verifica con una suite de tests de contrato compartida. |
| [Prefiere la inyección por constructor](reglas/inyeccion-de-dependencias/di-preferir-inyeccion-por-constructor.md) | Al declarar las dependencias de un provider, o cuando ves inyección por propiedad (`@Inject()` sobre un campo de la clase): usa inyección por constructor (`constructor(private readonly userRepo: UserRepository, @Inject('CONFIG') ...)`) para que las dependencias sean explícitas y testeables, y reserva la inyección por propiedad para las dependencias opcionales con `@Optional()`. |
| [Comprende los scopes de los providers](reglas/inyeccion-de-dependencias/di-comprender-scopes.md) | Al elegir el scope de un provider (`Scope.DEFAULT`, `Scope.REQUEST`, `Scope.TRANSIENT`), al guardar datos de la petición actual (usuario, tenant) dentro de un service, o cuando un singleton con estado mutable devuelve datos de otro usuario bajo concurrencia: explica cómo se propaga el scope REQUEST y qué alternativas hay (`@Inject(REQUEST)`, `nestjs-cls` con `ClsService`). |
| [Usa injection tokens para las interfaces](reglas/inyeccion-de-dependencias/di-usar-tokens-de-interfaces.md) | Cuando quieres inyectar una implementación a partir de una interfaz de TypeScript (que no existe en runtime), o intercambiar implementaciones según el entorno o en los tests: usa un token string o `Symbol` (`PAYMENT_GATEWAY`) con `{ provide, useClass }` y `@Inject(TOKEN)`, o una clase abstracta como token. |

### 3. Manejo de errores (HIGH)

Carpeta: [reglas/manejo-de-errores/](reglas/manejo-de-errores/)

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Usa exception filters para el manejo de errores](reglas/manejo-de-errores/error-usar-exception-filters.md) | Cuando un controller captura errores con `try/catch` o arma a mano la respuesta de error con `@Res()` y `res.status(...).json(...)`, o al definir un formato de error uniforme para toda la API: usa excepciones (`NotFoundException` o excepciones de dominio) y exception filters (`@Catch()`, `ExceptionFilter`, `ArgumentsHost`) registrados con `app.useGlobalFilters` o con `APP_FILTER`. |
| [Lanza HTTP exceptions desde los servicios](reglas/manejo-de-errores/error-lanzar-http-exceptions.md) | Al decidir cómo un service informa que un recurso no existe o que hay un conflicto, o cuando un service devuelve objetos de error (`{ error: 'User not found' }`) que el controller tiene que revisar: lanza subclases de `HttpException` (`NotFoundException`, `ConflictException`) desde el service para que los controllers queden delgados, o excepciones de dominio que un filter mapea a HTTP. |
| [Maneja correctamente los errores asíncronos](reglas/manejo-de-errores/error-manejar-errores-async.md) | Al lanzar una promise sin `await` (fire-and-forget, como enviar un email después de guardar), al escribir handlers de `@OnEvent` o tareas `@Cron`, o cuando el proceso hace crash por un `unhandledRejection`: captura los errores asíncronos de forma explícita (`.catch()`, `try/catch` con `Logger`, dead letter queue) y registra `process.on('unhandledRejection')` como red de seguridad. |

### 4. Seguridad (HIGH)

Carpeta: [reglas/seguridad/](reglas/seguridad/)

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Implementa una autenticación JWT segura](reglas/seguridad/security-auth-jwt.md) | Al implementar el login, la emisión o la validación de tokens JWT (`@nestjs/jwt`, `@nestjs/passport`, `JwtModule.registerAsync`, `JwtStrategy.validate`), los refresh tokens o la expiración de la sesión, o al revisar un secreto hardcodeado o datos sensibles en el payload: explica la configuración segura (secreto desde `ConfigService`, access tokens de corta duración, `issuer`/`audience`) y qué validar en la strategy. |
| [Valida todo el input con DTOs y pipes](reglas/seguridad/security-validar-todo-el-input.md) | Al recibir datos en un controller (`@Body()`, `@Query()`, `@Param()`) o al crear el DTO de una petición: valida todo con schemas de Zod convertidos en DTO con `createZodDto` de `nestjs-zod` y el `ZodValidationPipe` global, nunca con `any` ni con DTOs sin schema; incluye `z.strictObject`, `z.coerce` para los query params y la validación de UUID en los params. |
| [Usa guards para la autenticación y la autorización](reglas/seguridad/security-usar-guards.md) | Al proteger rutas por autenticación, roles o permisos, o cuando un controller repite verificaciones manuales (`if (!req.user)`, `req.user.roles.includes('admin')`): implementa guards (`CanActivate`, `ExecutionContext`, `Reflector`) con decoradores `@Roles()` y `@Public()` creados con `SetMetadata`, y regístralos globalmente con `APP_GUARD`. |
| [Sanitiza la salida para prevenir XSS](reglas/seguridad/security-sanitizar-salida.md) | Al guardar o devolver contenido generado por los usuarios que puede contener HTML (comentarios, posts), al responder con `text/html` o al incluir el input del usuario en mensajes de error: sanitiza con `sanitize-html` (también dentro de un `.transform()` del schema de Zod), usa el `Content-Type` correcto y configura CSP con `helmet`, aunque no se mencione «XSS». |
| [Implementa rate limiting](reglas/seguridad/security-rate-limiting.md) | Al exponer endpoints sensibles a la fuerza bruta o al abuso (login, recuperación de contraseña, pagos), o al configurar límites de peticiones por cliente: usa `@nestjs/throttler` (`ThrottlerModule.forRoot`, `ThrottlerGuard` con `APP_GUARD`, `@Throttle`, `@SkipThrottle`) con límites distintos por endpoint y por tipo de usuario (`getTracker`). |

### 5. Rendimiento (HIGH)

Carpeta: [reglas/rendimiento/](reglas/rendimiento/)

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Usa correctamente los lifecycle hooks asíncronos](reglas/rendimiento/perf-async-hooks.md) | Al implementar lifecycle hooks (`onModuleInit`, `onApplicationBootstrap`, `onModuleDestroy`) o inicializar recursos al arrancar (conexión a la base de datos, carga de configuración, precalentamiento de la caché): devuelve la promise (`async`/`await`) para que NestJS espere, no hagas trabajo pesado o síncrono (`fs.readFileSync`) en el constructor y habilita `app.enableShutdownHooks()`. |
| [Usa el caching de forma estratégica](reglas/rendimiento/perf-usar-caching.md) | Al cachear queries costosas, datos de lectura frecuente o llamadas a APIs externas, o al configurar `CacheModule` (Redis con `KeyvRedis`), `CACHE_MANAGER`, `CacheInterceptor`, `@CacheTTL` o `@CacheKey`: elige el TTL según cuánto cambian los datos e invalida la caché al modificarlos (`cache.del`, también mediante eventos), en lugar de cachear todo. |
| [Optimiza las queries a la base de datos](reglas/rendimiento/perf-optimizar-base-de-datos.md) | Cuando una query trae todas las columnas o un árbol de `relations` que no se usa, cuando faltan índices en las columnas por las que se filtra a menudo (`@Index`) o cuando un listado no está paginado (`findAndCount` con `skip`/`take`): selecciona solo las columnas necesarias (`select`, `QueryBuilder`). No trata las queries repetidas dentro de un bucle (N+1). |
| [Usa lazy loading para los módulos grandes](reglas/rendimiento/perf-lazy-loading.md) | Cuando una app grande o serverless arranca lento (cold start) porque `AppModule` importa de forma eager módulos pesados que se usan poco (reportes, administración, importaciones masivas): carga esos módulos bajo demanda con `LazyModuleLoader` e `import()` dinámico, con caché del `ModuleRef` o con precarga después del arranque. |

### 6. Testing (MEDIUM-HIGH)

Carpeta: [reglas/testing/](reglas/testing/)

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Usa el testing module para los unit tests](reglas/testing/test-usar-testing-module.md) | Al escribir unit tests de un service, guard o interceptor de NestJS, o cuando un test instancia las clases a mano (`new UsersService(new UserRepository())`) y termina usando la base de datos real: usa `Test.createTestingModule` con providers mock (`useValue` con `jest.fn()`), `module.get()` y mocks de `ExecutionContext`, y testea el comportamiento en lugar de la implementación. |
| [Usa Supertest para el testing E2E](reglas/testing/test-e2e-supertest.md) | Al escribir tests end-to-end que recorren rutas, guards, pipes, serialización y autenticación con peticiones HTTP reales: usa Supertest (`request(app.getHttpServer())`) sobre `Test.createTestingModule({ imports: [AppModule] })`, aplica la misma configuración que en producción (`ZodValidationPipe`), cierra la app en `afterAll` y aísla la base de datos de test (`.env.test`, `dataSource.synchronize(true)`). |
| [Haz mock de los servicios externos en los tests](reglas/testing/test-mock-de-servicios-externos.md) | Cuando un test llama a una API externa real (Stripe, `HttpService`), a la base de datos o a una cola de mensajes, o al testear timeouts, rate limiting (429) o lógica que depende del tiempo: haz mock de esas dependencias (`HttpService` con `of()` y `throwError()`, `getRepositoryToken(User)`, factories de mocks de SDKs, `jest.useFakeTimers()`) con datos realistas y casos de error. |

### 7. Base de datos y ORM (MEDIUM-HIGH)

Carpeta: [reglas/base-de-datos-y-orm/](reglas/base-de-datos-y-orm/)

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Usa transacciones para las operaciones de múltiples pasos](reglas/base-de-datos-y-orm/db-usar-transacciones.md) | Cuando varias escrituras a la base de datos deben aplicarse todas o ninguna (crear una orden con sus ítems y descontar el stock, transferir saldo entre cuentas), o cuando un fallo a mitad de camino deja datos inconsistentes: envuelve las operaciones en `dataSource.transaction(async (manager) => ...)` o controla la transacción con un `QueryRunner` (`startTransaction`, `commitTransaction`, `rollbackTransaction`, `release`). |
| [Evita los problemas de queries N+1](reglas/base-de-datos-y-orm/db-evitar-n-plus-one.md) | Al escribir o revisar un service, controller o resolver que carga una lista de entidades y después sus relaciones (un `await repo.find()` dentro de un bucle, relaciones lazy que se serializan, `@ResolveField` en GraphQL), o cuando un endpoint de listado se vuelve lento a medida que crecen los datos, aunque no se mencione «N+1»: usa `relations`, joins con `QueryBuilder` o `DataLoader`. |
| [Usa migraciones de base de datos](reglas/base-de-datos-y-orm/db-usar-migraciones.md) | Al agregar, renombrar o eliminar columnas, tablas o índices, al modificar una entidad de TypeORM o al configurar `TypeOrmModule` o `DataSource`: no uses `synchronize: true` en producción ni SQL manual; crea migraciones (`MigrationInterface` con `up` y `down`), incluido el renombrado seguro de una columna en varios pasos. |

### 8. Diseño de APIs (MEDIUM)

Carpeta: [reglas/diseno-de-apis/](reglas/diseno-de-apis/)

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Usa DTOs y serialización para las respuestas de la API](reglas/diseno-de-apis/api-usar-dto-serializacion.md) | Al devolver datos desde un controller, sobre todo entidades con campos sensibles (`passwordHash`, `ssn`), o al armar respuestas a mano copiando campos: define DTOs de respuesta con `createZodDto` y aplícalos con `@ZodSerializerDto()` y el `ZodSerializerInterceptor` global, con schemas distintos por endpoint o por rol (público, admin, dueño). |
| [Usa interceptors para los cross-cutting concerns](reglas/diseno-de-apis/api-usar-interceptors.md) | Cuando cada método de un controller repite logging, medición de tiempos, envoltura de la respuesta (`{ data, meta }`), timeouts, caché o mapeo de errores: extrae esa lógica transversal a un interceptor (`NestInterceptor`, `CallHandler`, operadores de RxJS `tap`, `map`, `timeout` y `catchError`) registrado con `APP_INTERCEPTOR` o `@UseInterceptors`. |
| [Usa el versionado de la API para los breaking changes](reglas/diseno-de-apis/api-versionado.md) | Antes de hacer un breaking change en la respuesta o en el contrato de un endpoint (renombrar o quitar campos), o cuando ves controllers versionados a mano en la ruta (`@Controller('v1/users')`): usa el versionado integrado (`app.enableVersioning` con `VersioningType.URI`, `HEADER` o `MEDIA_TYPE`, `@Version`, `VERSION_NEUTRAL`) y marca como deprecadas las versiones viejas. |
| [Usa pipes para la transformación del input](reglas/diseno-de-apis/api-usar-pipes.md) | Cuando un handler convierte o valida a mano un param o un query string (`parseInt(page) \|\| 1`, `+price`, `isUUID(id)`), o necesitas transformar un valor de entrada (fechas, listas separadas por comas, emails normalizados): usa pipes integrados (`ParseUUIDPipe`, `ParseIntPipe`, `DefaultValuePipe`, `ParseEnumPipe`), pipes personalizados (`PipeTransform`) o transformaciones dentro del schema de Zod (`z.coerce`, `.transform()`). |

### 9. Microservicios (MEDIUM)

Carpeta: [reglas/microservicios/](reglas/microservicios/)

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Usa correctamente los patrones de mensajes y eventos](reglas/microservicios/micro-usar-patrones.md) | Al comunicar microservicios de NestJS entre sí (`ClientProxy` con `send` o `emit`, handlers `@MessagePattern` o `@EventPattern`), o al dudar si una llamada entre servicios debe esperar una respuesta: usa `@MessagePattern` con `send` (y `firstValueFrom`) cuando necesitas la respuesta, y `@EventPattern` con `emit` para notificaciones fire-and-forget; incluye `RpcException` y el manejo local de errores en los eventos. |
| [Implementa health checks para los microservicios](reglas/microservicios/micro-usar-health-checks.md) | Al exponer endpoints de salud para Kubernetes o un load balancer (liveness, readiness y startup probes), o cuando `/health` solo devuelve «OK» sin verificar las dependencias: usa `@nestjs/terminus` (`HealthCheckService`, `TypeOrmHealthIndicator`, `MemoryHealthIndicator`, `DiskHealthIndicator`, indicadores personalizados con `HealthIndicator`) y responde «no listo» durante el apagado. |
| [Usa colas de mensajes para los trabajos en segundo plano](reglas/microservicios/micro-usar-colas.md) | Cuando un handler HTTP hace trabajo largo o propenso a fallar (generar reportes, enviar emails, procesar archivos) y el cliente excede el timeout, o cuando necesitas reintentos, prioridades, trabajos programados o el seguimiento del progreso: usa colas con `@nestjs/bullmq` (`BullModule.registerQueue`, `@InjectQueue`, `@Processor`, `attempts` y `backoff`, `repeat`) en lugar de `setInterval`, y monitoréalas con Bull Board. |

### 10. DevOps y deployment (LOW-MEDIUM)

Carpeta: [reglas/devops-y-deployment/](reglas/devops-y-deployment/)

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Usa ConfigModule para la configuración de entornos](reglas/devops-y-deployment/devops-usar-config-module.md) | Cuando el código lee `process.env` directamente (con `parseInt` o valores por defecto dispersos), o al agregar variables de entorno, archivos `.env` por entorno o la configuración de la base de datos: usa `@nestjs/config` (`ConfigModule.forRoot` con `validationSchema` para fallar al arrancar, `registerAs` con namespaces, `ConfigService.get<T>()`, `ConfigType`) y `forRootAsync` con `useFactory` en los módulos que dependen de la configuración. |
| [Usa logging estructurado](reglas/devops-y-deployment/devops-usar-logging.md) | Al agregar logs a un service o a la app, o cuando ves `console.log` en producción, logs sin estructura o datos sensibles registrados (contraseñas): usa el `Logger` de NestJS con contexto y niveles, salida JSON, un `requestId` por petición con `nestjs-cls` y, para alto rendimiento, `nestjs-pino` con `redact`. |
| [Implementa el graceful shutdown](reglas/devops-y-deployment/devops-graceful-shutdown.md) | Al preparar la app para deployments sin tiempo de inactividad (Kubernetes), o cuando un `SIGTERM` corta peticiones en curso, conexiones a la base de datos, colas o WebSockets: habilita `app.enableShutdownHooks()`, implementa `OnApplicationShutdown` para liberar recursos, deja de aceptar tráfico (readiness en 503) y espera con un timeout a que terminen las peticiones activas. |

### Crear una nueva regla

Estos archivos no contienen buenas prácticas: solo sirven para crear una nueva regla. Si creas una regla nueva, agrégala a esta [Tabla de Contenido](#tabla-de-contenido), bajo el subtítulo de su categoría, con su ¿Cuándo leerlo?, y actualiza el conteo «N reglas en M categorías» del [Resumen](#resumen). Si la regla necesita una categoría nueva, primero crea la categoría: agrega su sección al archivo de secciones, crea su subcarpeta y agrégala a las [Categorías de reglas por prioridad](#categorías-de-reglas-por-prioridad) y a esta Tabla de Contenido, según su prioridad, y actualiza también el conteo de categorías del Resumen. Si cambia la numeración, actualiza los números y los enlaces de ancla de las categorías siguientes.

Carpeta: [reglas/crear-nueva-regla/](reglas/crear-nueva-regla/)

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Secciones](reglas/crear-nueva-regla/_secciones.md) | Solo cuando se desee crear una nueva regla: para consultar las secciones (categorías) de la skill, con su orden, su impacto, su descripción y el prefijo de archivo de cada una, o para agregar la sección de una categoría nueva. |
| [Plantilla para crear nuevas reglas](reglas/crear-nueva-regla/_plantilla.md) | Solo cuando se desee crear una nueva regla: para copiar la plantilla del archivo de regla, con el frontmatter (`title`, `impact`, `impactDescription`, `tags`), la línea de impacto y los ejemplos de código incorrecto y correcto. |
