# 🐈 Stack Backend del Proyecto
A continuación, se presenta un resumen de las tecnologías mas importantes del proyecto. No incluye la totalidad de dependencias:

* Node.js 24.18.0
* Nest.js 11
* TypeScript 6
* Prisma ORM 7
* PostgreSQL 18

# ⚙️ Configurar lo Siguiente **UNA SOLA VEZ**

## 🛠️ Antes de Empezar
Para que la configuración funcione, debes tener instalado:
* [VS Code](https://code.visualstudio.com/) o cualquier editor basado en VS Code ([Antigravity](https://antigravity.google/product), [Cursor](https://cursor.com/get-started), Windsurf, etc.)

* [Git Bash](https://git-scm.com/install/)

* [Node.js](https://nodejs.org/)

* [Claude Code](https://code.claude.com/docs/en/quickstart)

* [pnpm](https://pnpm.io/installation)

* [fnm](https://github.com/Schniz/fnm)

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
Instalar las siguientes extensiones:

* [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)

* [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

* [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

La configuración de autocompletado, formateo de código y linter ya está incluida en los siguientes archivos. No es necesario realizar modificaciones adicionales:

* `.vscode/settings.json`
* `.editorconfig`
* `.prettierrc`
* `eslint.config.mjs`

## 👾 Configurar MCP para que Claude Code Acceda a la Documentación Oficial de Prisma ORM
1. 

# [🔗 Enlace - Comandos de Prisma MCP](https://www.prisma.io/docs/ai/tools/mcp-server)

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

# 🤖 Uso de IA

> [!WARNING]
> # ⚠️ ****IMPORTANTE**** 🚨
>
> ****Ignorar esta sección ocasionará que la IA genere código que no respete la arquitectura, estructura ni las convenciones del proyecto, produciendo código inconsistente, desordenado y con malas practicas****

# [🔗 Enlace - Prompts para trabajar con IA](https://github.com/DanielPinedaM/prompt-engineering/tree/main/2_prompts-full-stack)

Esta sección está diseñada para utilizarse como contexto en herramientas de IA.

## Principales IA para Desarrollo de Software

| Empresa ↓ \ Plataforma → | Web                                                                                     | Desktop                                                               | Terminal / Bash / CLI                                              |
| ------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Anthropic                | [Claude Web](https://claude.ai/)                                                        | [Claude Desktop](https://youtu.be/DYwZy7VNKws?si=cXTPumpZ3Jr9rNn9)    | [Claude Code](https://youtu.be/Bf7hfpItrDk?si=wjUIcIgtDX_Loyey)    |
| Open AI                  | [Chat GPT](https://chatgpt.com/)                                                        | [GPT Codex Desktop](https://youtu.be/bgx8ownl3O4?si=TzbOntfYIBVN1PGU) | [Codex](https://youtu.be/Ub-K1n4YYsg?si=EoIXGCzEa4ZxyRqA)          |
| Google                   | [Google AI Studio](https://aistudio.google.com/) / [Gemini](https://gemini.google.com/) | [Antigravity 2.0](https://antigravity.google/product/antigravity-2)   | [Antigravity CLI](https://youtu.be/bdEqIchP4x4?si=gRf6iLggXuzy_cq) |
| Anomaly Innovations      | [`opencode web`](https://opencode.ai/docs/web/)                                         | [Open Code Desktop](https://youtu.be/_SVSv2Y59P0?si=LT2S0z10t1FBxlB6) | [Open Code CLI](https://youtu.be/2gO8WyctqMk?si=aNvHlf23tKfrN-Z3)  |

## ✏️ Edición de Código
Evitar copiar y pegar código desde una plataforma web de IA. Siempre utilizar el CLI para editar el código, ya que el CLI tiene:

* Mayor contexto del proyecto.
* Conocimiento de la estructura completa del código.
* Acceso al sistema operativo (archivos y carpetas).
* Capacidad para realizar cambios respetando la arquitectura del proyecto.

---

# 📋 Contexto para la IA

# ⚙️ Entorno de Ejecución
Obligatorio el uso de Node.js, prohibido usar alternativas como:

* Bun
* Deno

# 📦 Manejador de Paquetes
Obligatorio el uso de `pnpm` y `pnpm-lock.yaml` version `>=11.0.0 <12.0.0`. Esta **BLOQUEADO** el uso de otras alternativas como:

* npm
* npx
* package-lock.json
* yarn

# 🟢 Administrador de Versiones para Node.js
Obligatorio el uso de `fnm`. Está prohibido usar alternativas como:

* nvm
* volta

Este proyecto usa Node.js 24.18.0

# 🔗 Alias
Para todos los comandos de `pnpm` usar el alias `pn`

# 📦 Instalar Paquetes

```console
pn i
```

# ▶️ Ejecutar Proyecto

| Comando          | Apunta a ...  | Ruta Archivo                   |
| ---------------- | ------------- | ------------------------------ |
| `pn start:local` | Local host    | `environments/.env.localhost`  |
| `pn start:test`  | Pruebas       | `environments/.env.test`       |
| `pn start:prod`  | Producción    | `environments/.env.production` |

# 🚀 Generar build (dist) para Desplegar

| Comando         | Apunta a ...  | Ruta Archivo                   |
| --------------- | ------------- | ------------------------------ |
| `pn build:test` | Pruebas       | `environments/.env.test`       |
| `pn build:prod` | Producción    | `environments/.env.production` |

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

