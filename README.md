![logo-nest-js](./docs/readme-md/img/logo-nest-js.png)

---

# 🐈 Stack Backend del Proyecto
A continuación se resumen las principales tecnologías del proyecto y el motivo por el que se utilizan. No se incluyen todas las dependencias.

* Node.js 24.18.0

* [**Nest.js 11:**](https://youtu.be/wsqcg5ZtUMM?si=o0rmZsPYwMlrl7Ed) _Framework semi-opinionado_ que combina la _arquitectura modular de Angular_ con la _flexibilidad de Express.js_, ofreciendo estructura escalable, soporte nativo de TypeScript e _inyección de dependencias_, y fácil integración con _ORMs_, _GraphQL_ y _microservicios_ para _APIs_ empresariales robustas.

* [**TypeScript 6:**](https://youtu.be/fUgxxhI_bvc?si=rRY7NTzsONRSwyNN) Agrega _tipado estático_ al lenguaje, permitiendo detectar errores durante el desarrollo y mejorar el _autocompletado_, la _refactorización_ y el _mantenimiento del código_. Además, permite tener el mismo lenguaje de programación en frontend y backend.

* [**Prisma ORM 7:**](https://youtu.be/vUcNydH1tz0?si=mc11vxHJpcCs_5Qj) Prisma se basa en un _esquema declarativo_ (_`schema.prisma`_) como _única fuente de verdad_, que genera un _cliente tipado_ y sincroniza la base de datos mediante _migraciones versionadas_. A diferencia de _TypeORM_, donde entidades y base de datos pueden desincronizarse, Prisma garantiza consistencia explícita entre _esquema_ y BD, con _type-safety_ en _tiempo de compilación_ que reduce _errores de mapeo_.

* [**Zod 4:**](https://youtu.be/bUzGfrjg66M?si=PqQtfsXKDVA0HnuP) Permite utilizar la _misma sintaxis de código_ y reutilizar los mismos _esquemas de validación_ en frontend y backend. Además, se integra con _TypeScript_, ofrece validación de tipos en _tiempo de compilación_ y validación de datos en _tiempo de ejecución (runtime)_. En _frontend_ valida _formularios_ y _datos de entrada_, con excelente integración con _React Hook Form_ (_React_) y _Forms with Signals_ (_Angular_). En _backend_ valida _`body`_, _`query`_ y _`params`_ de las _solicitudes http_, garantizando la integridad de los datos antes de procesarlos.

* [**PostgreSQL 18:**](https://www.postgresql.org/download/) _Base de datos relacional (RDBMS)_ con _cumplimiento ACID_, _integridad referencial_ y soporte nativo para tipos avanzados como _JSONB_, que permite almacenar y consultar documentos _JSON_ de _forma binaria_ e _indexada_, ofreciendo _flexibilidad de esquema similar a MongoDB_ sin sacrificar las _transacciones_ y _relaciones_ propias de un _modelo relacional_. Es ampliamente adoptado hoy en día por su madurez, extensibilidad (extensiones como _PostGIS_, _pgvector_), rendimiento en _cargas mixtas (OLTP)_ y compatibilidad total con _Prisma_ y el ecosistema _TypeScript_.

* [**DBeaver:**](https://dbeaver.io/download/) _Cliente universal de bases de datos (GUI)_ que permite explorar, consultar y administrar la base de datos PostgreSQL de forma visual, sin escribir SQL manualmente para tareas básicas. Facilita inspeccionar tablas, ejecutar _queries_, revisar _relaciones_ y datos generados por las _migraciones de Prisma_, agilizando el _debugging_ y la validación durante el desarrollo.

> [!TIP]
> # 🎥 **Aprende**
>
> Puedes hacer clic en el nombre de cada tecnología para ver cursos y aprenderlas

# ⚙️ Configurar lo Siguiente **UNA SOLA VEZ**

## 🛠️ Antes de Empezar
Para que la configuración funcione, debes tener instalado:
* [VS Code](https://code.visualstudio.com/) o cualquier editor basado en VS Code ([Antigravity IDE](https://antigravity.google/product/antigravity-ide), [Cursor](https://cursor.com/get-started), Windsurf, etc.)

* [Git Bash](https://youtu.be/niPExbK8lSw?si=tHx4IYZBdrUmW6ey)

* [Node.js](https://nodejs.org/)

* [Claude Code](https://youtu.be/Bf7hfpItrDk?si=5pW919OUbtSqJlyP)

* [pnpm](https://pnpm.io/installation)

* [fnm](https://github.com/Schniz/fnm)

* [DBeaver](https://dbeaver.io/download/)

* [Postman](https://www.postman.com/downloads/)

> [!TIP]
> # ⚡ **Empieza de inmediato**
>
> 👍 Si quieres empezar a programar con IA sin perder tiempo configurando herramientas, utiliza **Claude Code**. Este proyecto ya incluye las configuraciones de **MCP**, **Skills**, **Rules** y `AGENTS.md` listas para usar.
>
> 👎 Si prefieres otra IA, deberás configurar manualmente sus funcionalidades equivalentes según la forma en que esa herramienta las implemente.

## Instalar `pnpm`
1. Abrir Git Bash

2. Instalar:

```console
npm install -g pnpm@latest-11
```

3. Cerrar y volver abrir Git Bash

4. Si la instalacion es correcta, al ejecutar

```console
pnpm -v
```

Debe mostrar la version de `pnpm` instalada

## `fnm`
Para que `fnm` automáticamente al entrar a la carpeta del proyecto seleccione la versión correcta de Node.js que se especifica en el archivo `.nvmrc` que esta en la raiz del proyecto. Hacer esto:

1. Abrir Git Bash.

2. Instalar Node.js 24.18.0:

```console
fnm install 24.18.0
```

3. Copiar completo el siguiente comando y ejecutarlo:

```console
echo 'eval "$(fnm env --use-on-cd)"' >> ~/.bashrc
source ~/.bashrc
```

4. Cerrar y volver abrir Git Bash

5. Para verificar que funcione ejecutar los siguientes comandos en el siguiente orden:

```console
cd /ruta/a/tu/proyecto
```

```console
fnm current
```

```console
node -v
```

6. Debería mostrarte `v24.18.0` automáticamente, sin que hayas escrito manualmente

```console
fnm use 24.18.0
```

## ⌨️ Autocompletado, Formatear Código y Linter
Usar VS Code o cualquier editor basado en VS Code (Antigravity, Cursor, Windsurf, etc.) para instalar las siguientes extensiones:

* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

* [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)

* [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

* [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

* [Console Ninja](https://marketplace.visualstudio.com/items?itemName=WallabyJs.console-ninja)

* [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)

* [Auto Import](https://marketplace.visualstudio.com/items?itemName=steoates.autoimport)

No es necesario buscar cada extensión manualmente en el marketplace: el archivo `.vscode/extensions.json` ya está configurado con esas extensiones como recomendadas. Al abrir el proyecto, el editor mostrará una notificación sugiriendo instalarlas; también puede instalarlas desde la pestaña **Extensions** filtrando por `@recommended`.

La configuración de autocompletado, formateo de código y linter ya está incluida en los siguientes archivos. No es necesario realizar modificaciones adicionales:

* `.vscode/`
* `.editorconfig`
* `.prettierrc`
* `eslint.config.mjs`

# ⚙️ Entorno de Ejecución
Obligatorio el uso de Node.js, prohibido usar alternativas como:

* [Bun](https://bun.com/)
* [Deno](https://deno.com/)

# 📦 Manejador de Paquetes
Obligatorio el uso de `pnpm`, `pnpm-lock.yaml` y `pnpm dlx <paquete>` version `>=11.0.0 <12.0.0`. Esta 🚫 **BLOQUEADO** el uso de otras alternativas como:

| Concepto ⬇️ / Nombre manejador de paquetes ➡️            | `npm`                                   | `yarn`                              |
| --------------------------------------------------------- | --------------------------------------- | ----------------------------------- |
| Lockfile                                                  | `package-lock.json`                     | `yarn.lock`                         |
| Ejecutar un paquete temporal (sin instalarlo globalmente) | `npx <paquete>`<br>`npm exec <paquete>` | `yarn dlx <paquete>` *(Yarn Berry)* |

# 🟢 Administrador de Versiones para Node.js
Obligatorio el uso de `fnm`. Está prohibido usar alternativas como:

* nvm
* volta

Este proyecto usa Node.js 24.18.0

# 🏷️ Alias
Para todos los comandos de `pnpm` usar el alias `pn`

# 📦 Instalar Paquetes

```console
pn i
```

# ▶️ Scripts de Desarrollo

| Comando          | Ambiente      | Variable de Entorno            |
| ---------------- | ------------- | ------------------------------ |
| `pn start:local` | Local host    | `environments/.env.localhost`  |
| `pn start:test`  | Pruebas       | `environments/.env.test`       |
| `pn start:prod`  | Producción    | `environments/.env.production` |

# 🚀 Generar Build (dist) para Desplegar

| Comando         | Ambiente      | Variable de Entorno            |
| --------------- | ------------- | ------------------------------ |
| `pn build:test` | Pruebas       | `environments/.env.test`       |
| `pn build:prod` | Producción    | `environments/.env.production` |

# 🐞 Scripts para Hacer Debugging
Cada entorno tiene su propio script de debugging y su configuración equivalente en `.vscode/launch.json`:

| Comando          | Ambiente      | Variable de Entorno            | Configuración de `.vscode/launch.json` |
| ---------------- | ------------- | ------------------------------ | -------------------------------------- |
| `pn debug:local` | Local host    | `environments/.env.localhost`  | `🐞 Nest: debug local host`            |
| `pn debug:test`  | Pruebas       | `environments/.env.test`       | `🐞 Nest: debug pruebas`               |
| `pn debug:prod`  | Producción    | `environments/.env.production` | `🐞 Nest: debug producción`            |

Los scripts `start:*` no sirven para depurar porque no abren el inspector de Node. Solo los scripts `debug:*` usan `nest start --debug --watch`.

Para que los scripts `debug:*` sirvan para depurar se tiene que escribir `debugger;` en el código.

**Ejemplo:**

```ts
import { ConfigService } from '@nestjs/config';
import { Controller, Get } from '@nestjs/common';
import { ENV_VARS, EnvironmentClass } from 'environments/env-config';

@ApiTags('Example')
@Controller('endpoint-example')
export class ExampleController {
  constructor(private env: ConfigService<EnvironmentClass>) {}

  @ApiOperation({ summary: 'Obtiene el ambiente de ejecución' })
  @Get('my-environment')
  getEnvironment() {
    const NODE_ENV = this.env.get(ENV_VARS.NODE_ENV);
    debugger;
    return `Ambiente ${NODE_ENV}`
  }
}
```

## Diferencia entre Launch y Attach
Existen dos formas de ejecutar el debugger desde VS Code (o cualquier editor basado en VS Code).

La única diferencia es **quién arranca el backend**, y de ahí se deriva **quién elige el entorno**:

|                            | **Launch**                        | **Attach**                               |
| -------------------------- | --------------------------------- | ---------------------------------------- |
| ¿Quién arranca el backend? | El editor, al presionar `F5`      | El desarrollador, en la terminal         |
| ¿Quién elige el entorno?   | La configuración de `launch.json` | El script que se ejecutó en la terminal  |
| Backend ya en ejecución    | Lo arranca de cero                | Se adjunta al que ya está corriendo      |

En ambas formas, el debugger se vuelve a adjuntar automáticamente cada vez que `--watch` reinicia el proceso durante el **Hot Reload** (reinicio automático de la aplicación), por lo que los breakpoints continúan funcionando después de guardar un archivo.

## ❔ ¿Cual Usar?
**Usar Launch**: Es la forma recomendada porque ejecuta y depura en un solo paso sin escribir comandos manualmente.

**Usar Attach** Cuando el backend ya está corriendo en la terminal y no se quiere reiniciar, o cuando se necesita ver la salida del proceso directamente en la terminal propia.

## 1️⃣ Launch: el editor ejecuta el script (recomendado)
1. Si el backend ya esta ejecutandose con `pn start:local`, `pn start:test` o `pn start:prod`, deténgalo antes de iniciar el debugging. De lo contrario, se producirán errores.

2. Colocar los breakpoints, escribiendo en el código:

```ts
debugger;
```

3. Abrir la pestaña Ejecucion y Depuración (Run and Debug)

4. Seleccionar el entorno en la lista desplegable, según la tabla de scripts.

5. Presionar `F5`.

6. Consumir el endpoint que se quiere depurar.

## 2️⃣ Attach: adjuntarse a un proceso ya iniciado
1. Colocar los breakpoints, escribiendo en el código:

```ts
debugger;
```

2. Ejecutar en la terminal el script de debug del entorno que se quiere depurar, por ejemplo:

```console
pn debug:local
```

3. Abrir la pestaña Ejecucion y Depuración (Run and Debug)

4. Seleccionar la configuración `🔗 Nest: attach al proceso (puerto 9000)`.

5. Presionar `F5` para adjuntarse al proceso que ya está en ejecución.

6. Consumir el endpoint que se quiere depurar.

# Arquitectura del Proyecto

> [!TIP]
> # 🧠 **Aprende antes de pedir cambios**
>
> No te limites a pedirle a la IA *"hazme X"* sin entender cómo funciona la arquitectura del proyecto.
>
> Hazle preguntas a la IA sobre:
>
> 1. `AGENTS.md`
> 2. `.claude/skills/***`
> 3. `.claude/rules/***`
> 4. Los **"🔗 Enlaces"**
>
> Hasta comprender cómo funciona el proyecto.
>
> Aunque es un texto largo, aprenderás la arquitectura, buenas prácticas y a detectar revisando el código, cuando la IA alucina

# 🤖 Uso de IA

> [!CAUTION]
> # ⚠️ **IMPORTANTE** 🚨
>
> ****Ignorar esta sección ocasionará que la IA genere código que no respeta la arquitectura, estructura ni las convenciones del proyecto, produciendo código legacy, inconsistente, desordenado y con malas practicas****

## Principales IA para Desarrollo de Software

| Empresa ⬇️ / Plataforma ➡️ | Web                                                                                     | Desktop                                                               | Terminal / Bash / CLI                                              |
| ------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Anthropic                | [Claude Web](https://claude.ai/)                                                        | [Claude Desktop](https://youtu.be/DYwZy7VNKws?si=cXTPumpZ3Jr9rNn9)    | [Claude Code](https://youtu.be/Bf7hfpItrDk?si=wjUIcIgtDX_Loyey)    |
| Open AI                  | [Chat GPT](https://chatgpt.com/)                                                        | [GPT Codex Desktop](https://youtu.be/bgx8ownl3O4?si=TzbOntfYIBVN1PGU) | [Codex](https://youtu.be/Ub-K1n4YYsg?si=EoIXGCzEa4ZxyRqA)          |
| Google                   | [Google AI Studio](https://aistudio.google.com/) / [Gemini](https://gemini.google.com/) | [Antigravity 2.0](https://antigravity.google/product/antigravity-2)   | [Antigravity CLI](https://youtu.be/bdEqIchP4x4?si=gRf6iLggXuzy_cq) |
| Anomaly Innovations      | [`opencode web`](https://opencode.ai/docs/web/)                                         | [Open Code Desktop](https://youtu.be/_SVSv2Y59P0?si=LT2S0z10t1FBxlB6) | [Open Code CLI](https://youtu.be/2gO8WyctqMk?si=aNvHlf23tKfrN-Z3)  |
| Cursor                   | [Cursor Web](https://cursor.com/agents)                                                 | [Cursor Desktop](https://youtu.be/XWsOQTqVl0w?si=0OVGRnYSCH46v2zf)    | [Cursor CLI](https://cursor.com/es/cli)                            |

# [🔗 Enlace - Benchmark de IA](https://artificialanalysis.ai/)

## ✏️ Edición de Código
Este proyecto esta configurado para usar _IAs de pago y desde la terminal_. **NO** sirve si usas IAs gratis o desde una pagina web, porque estan limitadas.

**Razones:**
* Si copias y pegas codigo desde plataforma web al proyecto, es probable que cometas errores

Las IAs de pago y desde la terminal tienen mejoras respecto a otras plataformas:

* Mayor comprensión del proyecto y de la estructura completa del código (_contexto_ y _tokens_).

* Acceso al sistema operativo (archivos y carpetas) y capacidad para ejecutar comandos.

* Capacidad para realizar cambios respetando la arquitectura del proyecto.

* Uso de Skills y MCP para reducir las _alucinaciones_ de la IA, permitiéndole a la IA consultar documentación oficial actualizada y seguir buenas prácticas.

# [🔗 Enlace - Prompts para Desarrollo Full Stack con IA](https://github.com/DanielPinedaM/prompt-engineering/tree/main/2_prompts-full-stack)

# 🐈 Configurar Nest.js para que Funcione con IA
Estas configuraciones ya estan listas para funcionar. Solo debes seguir los pasos a continuación para verificar que funcionen correctamente.

# `AGENTS.md`
Contiene instrucciones que se inyectan SIEMPRE en cada prompt, para que la IA respete arquitectura del proyecto.

# Skills

## 🌿 `git-commit`
Por cada feature terminada hacer un commit antes de solicitar nuevas modificaciones a la IA. Evita acumular demasiados cambios, ya que puedes perder el contexto de lo que la IA está realizando y cometer errores.

Trabajar bajo el principio:

> 1 commit = 1 feature

El skill `.claude\skills\git-commit\SKILL.md` te permite realizar commits.

***Ejemplos:***

```console
/git-commit
```

```console
hacer commit y push
```

# MCP

## prisma MCP para que Claude Code Acceda a la Documentación Oficial de Prisma
1. Abrir Git Bash

2. Abrir la carpeta del proyecto
```console
cd /ruta/a/tu/proyecto
```

3. Iniciar claude
```console
claude
```

# [🔗 Enlace - Tools de Prisma MCP](https://www.prisma.io/docs/ai/tools/mcp-server)

# Esta seccion esta INCOMPLETA porque todavia me falta documentar en readme.md y configurar skills y MCP

# 🔌 Consumo de API

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
              axiosRef (AxiosInstance)                  │
        ┌────────────────────────────────────┐          │
        │                                    │          │
        │  Request Interceptors  ◄───────────┤          │
        │                                    │          │
        │           Axios                    │          │
        │                                    │          │
        │  Response Interceptors ◄───────────┤          │
        │                                    │          │
        └────────────────────────────────────┘          │
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

4. Obligatorio usar `HttpService` **DIRECTO**

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

