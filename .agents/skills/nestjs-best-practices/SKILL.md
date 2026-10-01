---
name: nestjs-best-practices
description: Buenas prácticas y patrones de arquitectura de NestJS para construir aplicaciones listas para producción. Esta skill debe usarse al escribir, revisar o refactorizar código de NestJS para asegurar patrones correctos de módulos, inyección de dependencias, seguridad y rendimiento.
license: MIT
metadata:
  author: Kadajett
  version: "1.2.0"
---

# Buenas prácticas de NestJS

Guía completa de buenas prácticas para aplicaciones de NestJS. Contiene 40 reglas en 10 categorías, priorizadas por impacto para guiar la refactorización y la generación de código automatizadas.

## Cuándo aplicarla

Consulta estos lineamientos cuando:

- Escribas nuevos módulos, controllers o servicios de NestJS
- Implementes la autenticación y la autorización
- Revises código en busca de problemas de arquitectura y seguridad
- Refactorices codebases existentes de NestJS
- Optimices el rendimiento o las queries a la base de datos
- Construyas arquitecturas de microservicios

## Categorías de reglas por prioridad

| Prioridad | Categoría | Impacto | Prefijo |
|----------|----------|--------|--------|
| 1 | Arquitectura | CRITICAL | `arch-` |
| 2 | Inyección de dependencias | CRITICAL | `di-` |
| 3 | Manejo de errores | HIGH | `error-` |
| 4 | Seguridad | HIGH | `security-` |
| 5 | Rendimiento | HIGH | `perf-` |
| 6 | Testing | MEDIUM-HIGH | `test-` |
| 7 | Base de datos y ORM | MEDIUM-HIGH | `db-` |
| 8 | Diseño de APIs | MEDIUM | `api-` |
| 9 | Microservicios | MEDIUM | `micro-` |
| 10 | DevOps y deployment | LOW-MEDIUM | `devops-` |

## Referencia rápida

### 1. Arquitectura (CRITICAL)

- `arch-avoid-circular-deps` - Evita las dependencias circulares entre módulos
- `arch-feature-modules` - Organiza por feature, no por capa técnica
- `arch-module-sharing` - Exports/imports de módulos correctos, evita providers duplicados
- `arch-single-responsibility` - Servicios enfocados en lugar de "god services"
- `arch-use-repository-pattern` - Abstrae la lógica de la base de datos para la testeabilidad
- `arch-use-events` - Arquitectura basada en eventos para el desacoplamiento

### 2. Inyección de dependencias (CRITICAL)

- `di-avoid-service-locator` - Evita el anti-pattern Service Locator
- `di-interface-segregation` - Interface Segregation Principle (ISP)
- `di-liskov-substitution` - Liskov Substitution Principle (LSP)
- `di-prefer-constructor-injection` - Inyección por constructor en lugar de inyección por propiedad
- `di-scope-awareness` - Comprende los scopes singleton/request/transient
- `di-use-interfaces-tokens` - Usa injection tokens para las interfaces

### 3. Manejo de errores (HIGH)

- `error-use-exception-filters` - Manejo centralizado de excepciones
- `error-throw-http-exceptions` - Usa las HTTP exceptions de NestJS
- `error-handle-async-errors` - Maneja correctamente los errores asíncronos

### 4. Seguridad (HIGH)

- `security-auth-jwt` - Autenticación JWT segura
- `security-validate-all-input` - Valida con nestjs-zod
- `security-use-guards` - Guards de autenticación y autorización
- `security-sanitize-output` - Previene los ataques XSS
- `security-rate-limiting` - Implementa rate limiting

### 5. Rendimiento (HIGH)

- `perf-async-hooks` - Lifecycle hooks asíncronos correctos
- `perf-use-caching` - Implementa estrategias de caching
- `perf-optimize-database` - Optimiza las queries a la base de datos
- `perf-lazy-loading` - Lazy loading de módulos para un arranque más rápido

### 6. Testing (MEDIUM-HIGH)

- `test-use-testing-module` - Usa las utilidades de testing de NestJS
- `test-e2e-supertest` - Testing E2E con Supertest
- `test-mock-external-services` - Haz mock de las dependencias externas

### 7. Base de datos y ORM (MEDIUM-HIGH)

- `db-use-transactions` - Gestión de transacciones
- `db-avoid-n-plus-one` - Evita los problemas de queries N+1
- `db-use-migrations` - Usa migraciones para los cambios de schema

### 8. Diseño de APIs (MEDIUM)

- `api-use-dto-serialization` - DTOs y serialización de respuestas
- `api-use-interceptors` - Cross-cutting concerns
- `api-versioning` - Estrategias de versionado de APIs
- `api-use-pipes` - Transformación del input con pipes

### 9. Microservicios (MEDIUM)

- `micro-use-patterns` - Patrones de mensajes y eventos
- `micro-use-health-checks` - Health checks para la orquestación
- `micro-use-queues` - Procesamiento de trabajos en segundo plano

### 10. DevOps y deployment (LOW-MEDIUM)

- `devops-use-config-module` - Configuración de entornos
- `devops-use-logging` - Logging estructurado
- `devops-graceful-shutdown` - Deployments sin tiempo de inactividad

## Cómo usarla

Lee los archivos de reglas individuales para ver explicaciones detalladas y ejemplos de código:

```
rules/arch-avoid-circular-deps.md
rules/security-validate-all-input.md
rules/_sections.md
```

Cada archivo de regla contiene:
- Una breve explicación de por qué es importante
- Un ejemplo de código incorrecto con su explicación
- Un ejemplo de código correcto con su explicación
- Contexto adicional y referencias

## Documento compilado completo

Para la guía completa con todas las reglas desarrolladas en un solo documento, consulta
[AGENTS.md en el repositorio](https://github.com/Kadajett/agent-nestjs-skills/blob/main/AGENTS.md).
