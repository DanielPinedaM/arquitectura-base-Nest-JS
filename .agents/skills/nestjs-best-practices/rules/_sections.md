# Secciones

Este archivo define todas las secciones, su orden, niveles de impacto y descripciones.
El ID de la sección (entre paréntesis) es el prefijo del nombre de archivo que se usa para agrupar las reglas.

---

## 1. Arquitectura (arch)

**Impacto:** CRITICAL
**Descripción:** Una organización correcta de los módulos y una buena gestión de dependencias son la base de las aplicaciones de NestJS mantenibles. Las dependencias circulares y los god services son el asesino número 1 de la arquitectura.

## 2. Inyección de dependencias (di)

**Impacto:** CRITICAL
**Descripción:** El contenedor IoC de NestJS es potente, pero puede usarse mal. Comprender los scopes, los injection tokens y los patrones correctos es esencial para tener código testeable.

## 3. Manejo de errores (error)

**Impacto:** HIGH
**Descripción:** Un manejo de errores consistente mejora la depuración, la experiencia de usuario y la confiabilidad de la API. Los exception filters centralizados aseguran respuestas de error uniformes.

## 4. Seguridad (security)

**Impacto:** HIGH
**Descripción:** Las vulnerabilidades de seguridad pueden ser catastróficas. La validación del input, la autenticación, la autorización y la protección de datos no son negociables.

## 5. Rendimiento (perf)

**Impacto:** HIGH
**Descripción:** Optimizar el manejo de las peticiones, el caching y las queries a la base de datos impacta directamente en la capacidad de respuesta y la escalabilidad de la aplicación.

## 6. Testing (test)

**Impacto:** MEDIUM-HIGH
**Descripción:** Las aplicaciones bien testeadas son más confiables. Las utilidades de testing de NestJS permiten una cobertura completa de unit y e2e.

## 7. Base de datos y ORM (db)

**Impacto:** MEDIUM-HIGH
**Descripción:** Los patrones correctos de acceso a la base de datos, las transacciones y la optimización de queries son cruciales para las aplicaciones con uso intensivo de datos.

## 8. Diseño de APIs (api)

**Impacto:** MEDIUM
**Descripción:** Las convenciones RESTful, el versionado, los DTOs y los formatos de respuesta consistentes mejoran la usabilidad y la mantenibilidad de la API.

## 9. Microservicios (micro)

**Impacto:** MEDIUM
**Descripción:** Construir sistemas distribuidos requiere comprender los patrones de mensajes, los health checks y la comunicación entre servicios.

## 10. DevOps y deployment (devops)

**Impacto:** LOW-MEDIUM
**Descripción:** La gestión de la configuración, el logging estructurado y el graceful shutdown aseguran que la aplicación esté lista para producción y permiten deployments sin tiempo de inactividad.
