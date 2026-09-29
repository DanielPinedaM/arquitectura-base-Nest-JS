# Reglas Obligatorias para Skill
Aplican a toda respuesta o modificación de código de este proyecto.

## 1. Autoridad de la Skill
Las decisiones de arquitectura, estructura y convenciones definidas en esta skill son la fuente de la verdad del proyecto. No las cuestiones, no las reemplaces, no las contradigas y no las ignores. Desobedecerlas genera malas practicas y código inescalable. Esta restricción aplica solo a lo que la skill define de forma explícita; fuera de ese alcance rige el [4. Caso no Definido en la Skill](#4-caso-no-definido-en-la-skill).

## 2. Ante Cualquier Error
Esta regla aplica en cualquier momento. Si encuentras algún error, inconsistencia, duda o ambigüedad, debes detenerte y consultarme antes de realizar cualquier modificación. No puedes asumir ni deducir implementaciones. Es preferible preguntar para aclarar una duda que asumir una solución.

La única excepción a esta regla es lo establecido en la regla anterior: [1. Autoridad de la Skill](#1-autoridad-de-la-skill).

## 3. Instrucción que Contradice una Regla Definida
Se aplica cuando la instrucción recibida contradice una regla explícitamente definida en esta skill.

Acción: implementa estrictamente lo definido en la skill. No preguntes, no propongas alternativas, no pidas confirmación.

Antes de modificar el código, emite:

```txt
ERROR: estás violando la arquitectura del proyecto, esto genera malas
prácticas. Se va a modificar el código conforme a la arquitectura definida
en la skill.

Regla violada:  <archivo#sección de la skill>
Cita textual:   "<texto literal de la regla, copiado de la skill>"
Solicitado:     <lo que pidió el usuario>
Implementado:   <lo que define la skill>
Motivo:         <por qué lo solicitado rompe la arquitectura, en una línea>
```

La cita debe ser literal, no una paráfrasis. Si no puedes copiar el texto exacto de la skill, la regla no está definida: aplica [4. Caso no Definido en la Skill](#4-caso-no-definido-en-la-skill)

## 4. Caso no Definido en la Skill
Se aplica cuando el caso, problema o pregunta no está definido en la [Tabla de Contenido](#tabla-de-contenido)

Acción: resuélvelo con tu comportamiento por defecto. La skill no restringe este caso y no altera tu forma normal de trabajar.

## 5. Código Existente que Ya Viola la Arquitectura
Se aplica cuando detectas código ya escrito que incumple una regla de esta skill.

No lo corrijas por iniciativa propia. Emite:

```txt
El siguiente código viola la arquitectura del proyecto.

Archivo:       <ruta:línea>
Código:        "<fragmento literal del código>"
Regla violada: <archivo#sección de la skill>
Cita textual:  "<texto literal de la regla>"
```

y pregunta con `AskUserQuestion`:

```txt
¿Desea corregirlo para que siga la arquitectura del proyecto?
SÍ  → corregir el código
NO  → dejarlo como está
```

* SÍ: corrige el código y continúa.
* NO: no modifiques ese código, ignora esa parte específica y continúa con la
  implementación solicitada.

Si detectas varias infracciones en la misma pasada, agrúpalas en una sola llamada a `AskUserQuestion`, una pregunta por infracción.

## 6. ¿Como Leer la Skill?
Leer **bajo demanda** los archivos `.md` ubicados en `/skills/nestjs-conventions/rules/`: usa la [Tabla de Contenido](#tabla-de-contenido) como referencia para inferir cuales archivos son necesarios para la tarea que estas resolviendo, y accede unicamente a esos archivos.

**Razon**: Leer todos los archivos consume contexto y tokens innecesariamente.

# Tabla de Contenido

# INCOMPLETO - aqui me falta escribir la tabla de contenido con la estructura de archivos, carpetas y titulos de /rules - para tabla de contenido usar  enlace en línea con ruta relativa ejemplo [angular-animations.md](references/angular-animations.md)

**esto es un ejemplo de como crear la tabla de contenido de la skill - NO representa la tabla de contenido real**

## Arquitectura

| Título y ruta archivo | ¿Cuándo leerlo? |
| --- | --- |
| [Las tres capas](rules/arquitectura/capas.md) | Antes de crear cualquier archivo o carpeta nueva, o al dudar qué significa Feature, Core o Shared |
| [Regla de decisión](rules/arquitectura/regla-de-decision.md) | Al decidir en qué capa ubicar un archivo, o cuando dos features necesitan el mismo código |
| [Dirección de dependencias](rules/arquitectura/direccion-de-dependencias.md) | Antes de escribir un import entre capas distintas |

## Formularios

| Archivo | ¿Cuándo leerlo? |
| --- | --- |
| [React Hook Form](rules/formularios/react-hook-form.md) | Al crear o modificar cualquier formulario, o al agregar lógica condicional entre campos |
| [Inputs reutilizables](rules/formularios/inputs-reutilizables.md) | Al crear o modificar un componente dentro de src/shared/ui/shad-cn/react-hook-form |

# Fechas

**Reglas:**

1. Usar Luxon para el manejo de fechas y horas. **PROHIBIDO** utilizar `new Date()` nativo de JavaScript o cualquier otra librería de fechas diferente de Luxon.

2. Mantener en UTC el `DateTime` de Luxon que entra o sale de los controllers, a través de los DTO de request y de response (`date`, `createdAt`, etc.), ya que representan un instante y no una fecha local del servidor. **PROHIBIDO** convertir ese `DateTime` a la zona horaria local (`.toLocal()`, `.setZone()`) dentro del flujo de controllers, services y entities. Si necesitas mostrar ese instante en la zona horaria del usuario, esa conversión es responsabilidad del cliente que consume la API, nunca del backend. **OBLIGATORIO** que ese valor viaje en el payload, tanto en el request como en el response, como un `string` en formato ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`), por ejemplo: `2024-06-15T14:30:00Z`.

3. En `src/shared/services/luxon.service.ts` existen funciones utilitarias reutilizables para el manejo y formateo de fechas y horas con Luxon. Reutilizarlas cuando cubran la necesidad. **PROHIBIDO** duplicar su funcionalidad. Estas funciones no contienen lógica de negocio.

# Estructura del Proyecto

## Idioma de Código, Archivos y Carpetas
Todo el código fuente se escribe en inglés: clases, interfaces, enums, métodos, variables, nombres de archivos y carpetas, ruta base del `@Controller()` y ruta de cada endpoint, etc., excepto [Qué va en español](#qué-va-en-español).

### Qué va en español
1. Los comentarios de código.

2. Los textos que lee una persona: el `summary` y la `description` de Swagger, y el `message` de las respuestas de la API.

**Explicación**
La URL de la API es un contrato técnico que consumen otros sistemas, no un texto que lea una persona. Por eso las rutas van en inglés, igual que el resto del código.

**Ejemplo**

```ts
// src/app/features/auth/auth.controller.ts

@Controller({
  path: 'auth', // ruta base del controlador → inglés
})
export class AuthController {
  @ApiOperation({ summary: 'iniciar sesión' }) // se lee en Swagger → español
  @Post('login') // ruta del endpoint → inglés
  login(@Body() loginDto: LoginDto): Promise<ILoginResponse> {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
```

```ts
// src/app/features/auth/auth.service.ts

// el cliente muestra este `message` al usuario final → español
return { message: 'inicio de sesión exitoso', data };
```

URL resultante: `POST /auth/login`

# Consumo de API

> [!WARNING]
> # ⚠️ **IMPORTANTE** 🚨
>
> **esta seccion esta INCOMPLETA**
>
> **me fallta:**
> **escribir las reglas para que funcione interceptor global para hacer peticiones HTTP en Nest JS**
>  **pasarle esto a Claude para verificar de que no hayan errores**
> **agregar Ejemplo incorrecto y correcto de como consumir API**

MEJORAR REDACCION DE ESTO:

Los interceptor permiten estandarizar la estructura de las respuestas de *CUALQUIER* API, para que todas las API que se llaman en este backend de Nest, respondan con este formato:
{
  success: boolean;
  status: number;
  message: string;
  data: T;
}

## 🔀 Flujo para Consumir API:

```txt
TU SERVICIO DE NEST
        (UsersService, AuthService, etc.)
                         │
                         │
                         ▼
                HttpService (Nest)
          (wrapper sobre AxiosInstance)
                         │
                         │
                         │
                         ├───────────────────────────────┐
                         │                               │
                         ▼                               │
              axiosRef (AxiosInstance)                   │
        ┌────────────────────────────────────┐           │
        │                                    │           │
        │  Request Interceptors  ◄───────────┤           │
        │                                    │           │
        │           Axios                    │           │
        │                                    │           │
        │  Response Interceptors ◄───────────┤           │
        │                                    │           │
        └────────────────────────────────────┘           │
                         │                               │
                         ▼                               │
                   API EXTERNA                           │
                                                         │
────────────────────────────────────────────────────────────────────
```

No existe un "interceptor de HttpService". Cuando dices "interceptor de HttpModule", en realidad te refieres a los interceptores registrados sobre la AxiosInstance que HttpModule creó y que HttpService expone mediante axiosRef. Esa es la razón por la que, si toda la aplicación usa HttpService, un único interceptor registrado sobre axiosRef afecta todas esas peticiones.

## Reglas para Consumo de API
1. todas las peticiones HTTP externas tienen que pasar por HttpService

2. Solamente debe exisitr una sola instancia de `HttpService`, es decir:

```txt
Un HttpModule → un HttpService → una AxiosInstance.
```

Esta PROHIBIDO registrar HttpModule mas de una sola vez

ESTA REGLA ES MUY IMPORTANTE porque incumplir esta regla hace que el consumo de APIs sea inconsistente y rompe con el contrato

{
  success: boolean;
  status: number;
  message: string;
  data: T;
}

3. NO usar axios directo. Esta PROHIBIDO importar axios:

```console
import axios from 'axios';
```

4. Usar `HttpService` **DIRECTO**

5. Está **prohibido** usar:
* `try/catch`
* .catch()

6. Al llamar API esta **prohibido** propagar los errores con  `throw new Error()`.

7. TODAS las peticiones HTTP se TIENEN que validar con

```ts
  if (success) {
    // codigo cuando peticion HTTP es exitosa
  } else {
    // codigo cuando peticion HTTP es erronea
  }
```

8. La razon de esto es que el interceptor ya se encarga de estandarizar y manejar los errores

# Buenas Practicas

## Tipado en TypeScript

### Strict Type Checking
Usar strict type checking

### Inferencia de Tipos
Preferir la inferencia de tipos cuando el tipo sea obvio

**Incorrecto:**

```ts
// el tipo es obvio, anotarlo es ruido
const total: number = 10;
const isActive: boolean = true;
const tags: string[] = ['angular', 'signals'];
```

**Correcto:**

```ts
const total = 10;
const isActive = true;
const tags = ['angular', 'signals'];
```

### `unknown` en Lugar de `any`
Prohibido el tipo `any`; usa `unknown` cuando el tipo sea incierto.

**Incorrecto:**

```ts
function parseTitle(value: any): string {
  // any desactiva el chequeo de tipos: esto compila y falla en runtime
  return value.toUpperCase();
}
```

**Correcto:**

```ts
function parseTitle(value: unknown): string {
  // unknown obliga a comprobar el tipo antes de usarlo
  if (typeof value === 'string') return value;

  return '';
}
```

### Uso de `interface`
Preferir `interface` para tipos de objeto (`Task`) y para el tipo de los elementos en arrays de objetos (`Task[]`).

**Incorrecto:**

```ts
// un objeto no se modela con type
type Task = {
  id: number;
  title: string;
  completed: boolean;
};

// ni con el objeto escrito en línea
const tasks: { id: number; title: string; completed: boolean }[] = [];
```

**Correcto:**

```ts
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// elementos en arrays de objetos Task[]
const arrayOfTaskObjects: Task[] = [];

// tipos de objeto Task
const literalTaskObject: Task = {};
```

### `Record<Clave, Valor>` para Claves Dinámicas
Usar `Record<Clave, Valor>` para objetos con claves dinámicas.

**Incorrecto:**

```ts
interface TasksById {
  [key: number]: Task;
}
```

**Correcto:**

```ts
const tasksById: Record<number, Task> = {};
const labels: Record<string, string> = { pending: 'Pendiente', done: 'Hecha' };
```

### `type` para Primitivos, Literales y Uniones
Usar `type` para tipos primitivos, literales y uniones.

**Incorrecto:**

```ts
// una union no se modela con interface
interface TaskStatus {
  value: 'pending' | 'in-progress' | 'done';
}
```

**Correcto:**

```ts
type TaskStatus = 'pending' | 'in-progress' | 'done';
type TaskFilter = TaskStatus | 'all';

interface TaskStatus {
  value: TaskStatus;
}
```

## Rutas Absolutas en los `import`
Siempre usar ruta absoluta en los `import`, utilizando los alias definidos en `paths` de `tsconfig.json`. Está **prohibido** usar rutas relativas (`./`, `../`).

**Correcto:**

```ts
// usar el alias @/ definido en tsconfig.json
import { CryptoService } from '@/shared/services/crypto.service';

// usar el alias environments/ definido en tsconfig.json
import { ENV_VARS, EnvironmentClass } from 'environments/env-config';
```

**Incorrecto:**

```ts
// incorrecto porque se escribe ../ en lugar de usar el alias @/
import { CryptoService } from '../../../shared/services/crypto.service';
```

```ts
// incorrecto porque se escribe ./ en lugar de usar el alias @/
import { AuthInterface } from './data-types/interface/auth.interfaces';
```

```ts
// incorrecto porque se escribe ../ en lugar de usar el alias environments/
import { ENV_VARS, EnvironmentClass } from '../../../../environments/env-config';
```
