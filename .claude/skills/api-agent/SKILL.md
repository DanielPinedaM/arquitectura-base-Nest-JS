---
name: api-agent
description: 'Depura bugs y automatiza flujos del backend ejecutando la API real y haciéndole peticiones HTTP con `curl` desde la terminal, de forma agnóstica al ORM (TypeORM, Prisma, Drizzle, Sequelize, Mongoose) y a la base de datos (PostgreSQL, MySQL, SQLite, SQL Server, MongoDB). Úsala siempre que el usuario reporte un bug de la API, diga que un endpoint "no funciona", "no responde", "no guarda", "da error 500" o "devuelve vacío", pida reproducir o diagnosticar un fallo, pida verificar que un endpoint responde lo que debe, o pida automatizar o ejecutar un flujo del backend (login, alta de registro, encadenar varios endpoints). NO es para escribir tests de Jest ni de Supertest: es para depuración interactiva y automatización asistida por agente contra el backend corriendo.'
when_to_use: 'Frases típicas que la disparan - "hay un bug en el endpoint X", "no me guarda el registro", "revisa por qué falla", "reprodúcelo y dime qué pasa", "prueba el flujo completo de", "automatiza el proceso de", "hazle una petición a", "mira los logs del backend", "el endpoint devuelve 500", "la consulta no trae nada".'
allowed-tools: Read, Edit, Write, Grep, Glob, Bash(pnpm run *), Bash(pnpm install), Bash(curl *), Bash(grep *), Bash(netstat *), Bash(taskkill *), Bash(git status *), Bash(git diff *), Bash(git stash *), AskUserQuestion, TaskStop
---

# Depuración y automatización de backend con `curl`

Verifica el comportamiento contra el backend corriendo y respondiendo peticiones HTTP reales, no contra suposiciones sobre el código. Leer el código dice qué *debería* pasar; ejecutar el flujo contra la API dice qué *pasa*.

## 1. Elegir el modo — pregúntalo antes de ejecutar nada

Hay exactamente dos modos y se comportan distinto:

| | Modo AUTOMATIZAR | Modo DEPURAR |
|---|---|---|
| Para qué sirve | ejecutar o automatizar un flujo de la app | encontrar la causa de un bug o de un comportamiento incorrecto |
| Modifica código fuente | **no** | sí, en dos casos |
| Diagnostica (logs del server, `curl -i`/`-v`, cuerpo y headers de la respuesta) | **no** | sí |
| ¿Ejecuta ESLint? | **no** | sí, pero solo si ESLint está configurado |
| ¿Genera el build de la aplicación? | **no** | sí |
| ¿Le hace peticiones HTTP a la API con `curl`? | sí | sí |
| ¿Pide usuario y contraseña y hace login? | sí | sí |

Los dos casos en que el modo DEPURAR escribe en el código fuente:

1. **Instrumentación temporal** — `console.log` marcados con `// DBG-<id>`, y `throw` para forzar un `catch` cuando el fallo no se puede inducir desde la petición. No cambia el comportamiento de la app, se aplica sin preguntar y **se borra en la misma respuesta** (sección "8.2 Borrar la instrumentación").
2. **La corrección del bug** — solo la opción que el usuario autorizó al responder el `AskUserQuestion` de la sección "7.7 PARAR y preguntar — nunca corregir por tu cuenta". Permanece en el repo.

Cualquier otra edición está prohibida, incluidos los bugs que encuentres de paso mientras depuras: repórtalos y sigue con el autorizado.

**El modo lo elige el usuario, no tú.** Preguntar con `AskUserQuestion`. No lo deduzcas de cómo redactó la petición, ni siquiera cuando uno de los dos parezca evidente: "prueba el login" puede ser ejecutar el flujo o averiguar por qué falla, y equivocarse cuesta una sesión entera de instrumentación que nadie pidió.

La pregunta lleva dos opciones, y en cada descripción lo que ese modo implica de verdad — si va a tocar el código y si va a parar a preguntar antes de corregir:

- **AUTOMATIZAR** — ejecuta el flujo de punta a punta y reporta el estado final. No toca el código ni diagnostica.
- **DEPURAR** — reproduce el fallo, observa, instrumenta si hace falta, y **para** a preguntar antes de aplicar cualquier corrección.

Anque el usuario lo haya dicho explícitamente en la conversación ("automatiza el alta de usuario", "depura por qué falla el guardado"). Tienes que preguntar ¿cual es el modo a ejecutar?

Esta pregunta es independiente de las del entorno —la del que se ejecuta y la del build, que son dos preguntas diferentes—, que llegan después, en el paso 2 de la sección "4. Detectar el entorno (nunca asumirlo)". Lo que no puedes es empezar a ejecutar sin tener la respuesta del modo.

Si en modo AUTOMATIZAR el flujo se rompe, no lo arregles por tu cuenta: reporta dónde se rompió y pregunta si quieres que pase a modo DEPURAR.

## 2. Ante ambigüedad, detente y pregunta — nunca asumas

Esta regla se ejecuta **siempre y en los dos modos**, da igual que el encargo sea automatizar un flujo o depurar un bug: aplica en cualquier paso del procedimiento, desde antes de arrancar nada hasta la limpieza final.

Si en cualquier momento de la ejecución —leyendo, editando o creando código, ejecutando el flujo o interpretando estas mismas reglas— aparece una ambigüedad, un error, una limitación, una contradicción, un solapamiento de ideas, un caso que las reglas no contemplan, un conflicto entre dos reglas o cualquier duda técnica que pueda cambiar el resultado, tienes **PROHIBIDO** resolverlo por tu cuenta y seguir adelante.

Detente en ese punto exacto y usa `AskUserQuestion`:

1. **Para.** No generes ni edites nada más relacionado con esa duda hasta tener la respuesta.
2. **Explica la duda:** en qué consiste, y por qué la información disponible no basta para resolverla.
3. **Formúlala como pregunta explícita**, con:
   - Dos o más opciones concretas, cada una con su consecuencia real (qué cambia, qué más podría romper).
   - Una marcada como **recomendada**, con el motivo de la recomendación.
   - Una opción abierta del tipo "Otra — la describo yo", para que el usuario proponga su propio enfoque si ninguna encaja.
4. **Espera la respuesta** y aplica solo la opción elegida.

Ninguna otra sección de este documento te autoriza a rellenar vacíos, inventar comportamiento, deducir requisitos ni tomar decisiones de diseño que no estén especificadas explícitamente. Ante la duda, se pregunta.

Los momentos en que preguntar ya está fijado por el procedimiento son estos:

1. **El modo** — sección "1. Elegir el modo — pregúntalo antes de ejecutar nada".
2. **El entorno de ejecución y el entorno del build** — sección "4. Detectar el entorno (nunca asumirlo)", paso 2.
3. **El usuario y la contraseña del login** — sección "5. Login — pide usuario y contraseña, nunca los inventes", paso 1.
4. **Las escrituras en la base de datos** — sección "7.3 Aislar API, lógica de negocio, ORM y base de datos", capa 4.
5. **El diagnóstico antes de corregir** — sección "7.7 PARAR y preguntar — nunca corregir por tu cuenta".
6. **El fallo del linter** — sección "8.3 Ejecutar el linter".
7. **El fallo del build** — sección "8.4 Ejecutar el build".

Son casos particulares de esta regla, no la lista completa de cuándo aplicarla.

## 3. Mecánica de `curl`

El cliente eres tú desde la terminal, y la app bajo prueba es el backend corriendo en local: no hay navegador ni interfaz de por medio, así que la única forma de ejercitar un flujo es pedírselo a la API igual que se lo pediría su consumidor real.

Antes de la primera petición de esta sesión hay que establecer dos cosas, y ninguna se adivina:

1. **La ruta real del endpoint**, con prefijo global y versión incluidos si el proyecto los usa. El framework los antepone a todas las rutas, así que la ruta que ves declarada en el controller **no** tiene por qué ser la ruta que se llama. Ni el prefijo, ni la versión, ni los archivos donde se declaran se dan por sabidos: dedúcelos de la configuración con la que el proyecto arranca el servidor, y confírmalos con el listado de rutas que el backend imprime al arrancar o con la documentación de la API que el propio proyecto exponga. Una ruta inventada devuelve un 404 que parece un bug y no lo es.

2. **El contrato del endpoint**: método, forma del body, headers obligatorios. Sale del controller y del schema de validación del recurso. Mandar un body que el schema rechaza produce un 400 que tampoco es el bug que buscas.

### `curl` ya está instalado — no instales un cliente HTTP

`curl` viene con el sistema y con Git Bash, así que no hay nada que agregar al proyecto. **Prohibido** instalar o invocar otro cliente —Postman/newman, httpie, insomnia, o un script de axios escrito para la ocasión— y prohibido traerlo con `pnpm dlx`, `npx` o `bunx`: resuelven paquetes fuera del `pnpm-lock.yaml` y meten en el entorno una dependencia que el proyecto no declara. Si un caso no se puede expresar con `curl`, aplica la sección "2. Ante ambigüedad, detente y pregunta — nunca asumas" y pregunta.

**En PowerShell, `curl` es un alias de `Invoke-WebRequest`** y no entiende estas flags. Usa `curl.exe` explícitamente, o lanza la petición desde Bash. Si ves un error de un parámetro que no existe, es esto y no la petición.

### Las flags de este documento son ejemplos, no una lista blanca

Esta skill **NO limita** qué puedes ejecutar con `curl`. Las que aparecen aquí — `-i`, `-sS`, `-X`, `-H`, `-d`, `-w`, `-v`, `--retry` — son las que resuelven la mayoría de los casos, nada más.

Si necesitas otra, **búscala en `curl --help all` y úsala.** Hay muchas que este documento no menciona y que resuelven una situación concreta mejor que cualquier rodeo: cookies, subida de archivos, timeouts, redirecciones, certificados.

El catálogo está **siempre** abierto, en todo momento y a tu elección: esta skill no cierra ninguna flag ni te obliga a pedir permiso para usarla. Lo único que hace es decirte **qué mirar en cada momento** — qué observar primero al depurar, en la sección "7.2 Observar desde fuera (antes de tocar el código)"; qué no aporta nada cuando solo te piden ejecutar un flujo, en la sección "6. Modo AUTOMATIZAR". Es criterio sobre el orden y la utilidad, nunca una lista blanca.

### La forma base de una petición

```bash
curl -i -sS -X POST "http://localhost:<puerto><recurso>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"campo":"valor"}'
```

- `-i` imprime los headers de respuesta junto al cuerpo. Sin él no ves el status, y el status es la primera pista del diagnóstico.
- `-sS` calla la barra de progreso pero deja pasar los errores de la propia petición.
- Los endpoints protegidos necesitan el token que devolvió el login. Guárdalo en una variable de shell y reutilízalo en el resto del flujo, en lugar de pegarlo a mano en cada petición.

## 4. Detectar el entorno (nunca asumirlo)

**Gestor de paquetes** — el proyecto usa **pnpm**, y no hay alternativa: lo fijan `pnpm-lock.yaml` en la raíz, el campo `packageManager` del `package.json` y el `AGENTS.md` del repo. Son solo dos comandos:

| Para | Comando |
|---|---|
| Arrancar un script del `package.json` | `pnpm run <script>` |
| Instalar las dependencias ya declaradas | `pnpm install` |

**Prohibido** `npm`, `yarn`, `bun`, `npx` y `bunx` en este repo: escribirían otro lockfile o resolverían versiones que `pnpm-lock.yaml` no fija.

**ORM y base de datos** — esta skill no asume ninguno. Deduce cuál usa el proyecto de las dependencias del `package.json` y del módulo de base de datos; las entidades o modelos y las consultas se leen desde ahí. Nada de este documento depende de que el ORM sea TypeORM, Prisma, Drizzle, Sequelize o Mongoose, ni de que el motor sea PostgreSQL, MySQL, SQLite, SQL Server o MongoDB: lo que cambia entre ellos es el nombre del comando, no el procedimiento.

**Puerto del backend** — no lo adivines. Sale de la variable de entorno `PORT` del archivo de entorno que carga el script elegido, y `main.ts` lo imprime al arrancar. Tanto la ruta de ese archivo como el nombre del entorno se deducen de lo que el script ejecuta en el `package.json`, no se asumen. Confirma el puerto real en la salida del proceso antes de la primera petición: pegarle a un puerto equivocado produce un diagnóstico falso, o peor, le pegas a otro servicio que sí responde.

### Arrancar el backend — lo arrancas tú, el entorno lo elige el usuario

Levantar el backend es tarea tuya. **Prohibido** pedirle al usuario que lo arranque, y prohibido lanzar peticiones dando por hecho que ya está arriba. Lo único que decide el usuario es **qué entorno** se levanta (paso 2); ejecutarlo y esperarlo lo haces tú.

**1. Comprueba si ya hay algo corriendo en el puerto**, para no levantar una segunda instancia sobre un puerto ocupado.

```bash
curl -sS -o /dev/null -w "%{http_code}" http://localhost:<puerto>
```

- **La conexión falla** → el puerto está libre. Sigue con el paso 2.
- **Responde algo** —cualquier respuesta HTTP, incluido un 404, porque la raíz no es una ruta válida cuando hay prefijo global— → hay un proceso escuchando ahí. **Deténlo** localizándolo por el puerto con `netstat` y matándolo con `taskkill`, igual que en la sección "8.1 Cerrar los procesos que abriste", vuelve a lanzar el `curl` hasta que la conexión falle, y sigue con el paso 2.

**Que hubiera algo corriendo no te salta ningún paso.** Los pasos 2 a 5 se ejecutan completos igual: se pregunta el entorno, lo arrancas tú, esperas a que acepte conexiones y lees su salida. Ese proceso que estaba ahí lo levantó otra sesión o el propio usuario, así que no sabes con qué entorno arrancó, contra qué base de datos apunta ni si su build corresponde al código actual, y todo lo que observes contra él es un diagnóstico falso.

**2. Pregunta al usuario qué entornos usar.** Son **dos preguntas DIFERENTES**, cada una con su propia lista de opciones y su propia respuesta, y las dos se hacen aquí, antes de empezar a ejecutar el modo AUTOMATIZAR o DEPURAR, nunca al llegar al build. Una respuesta no se deduce de la otra:

1. **Qué entorno se ejecuta** — el backend del paso 3.
2. **A qué entorno se le hace el build** — la sección "8.4 Ejecutar el build".

Lee los scripts de `package.json` — **no asumas que existe `start` ni `dev`, ni un `build` a secas** — y **no elijas los entornos por tu cuenta**, ni siquiera cuando uno parezca el obvio. La decisión es del usuario: pregúntasela con `AskUserQuestion` antes de ejecutar nada.

- En la pregunta del entorno que se ejecuta, una opción por cada script del `package.json` que levante la app, con el nombre exacto del script como etiqueta. En la descripción, lo que ese script implica de verdad: qué archivo de entorno carga —dedúcelo de lo que ejecuta, nunca de su nombre—, puerto, y **contra qué base de datos apunta** si puedes deducirlo de ese archivo o del módulo de base de datos. El entorno decide sobre qué datos vas a leer y escribir, y por eso esta elección no es tuya.
- En la pregunta del entorno del build, una opción por cada script del `package.json` que compile el proyecto, con el nombre exacto del script como etiqueta. En la descripción, a qué entorno apunta, deducido igual: de lo que el script ejecuta, nunca de su nombre.
- En las dos, una opción final "Otra — la indico yo", para un script o unos flags que no estén en la lista.
- Los nombres de todos esos scripts se leen del `package.json`, no se dan por sabidos.

Pregunta también cuando en cualquiera de las dos solo haya un candidato: el usuario puede querer otro puerto u otra configuración. La única excepción es que ya te haya dicho en la conversación qué entorno quiere para esa pregunta concreta; entonces úsalo y dilo, sin volver a preguntar.

**3. Arranca el script elegido en background** (`run_in_background: true`, nunca en foreground: el backend no termina y bloquearía la sesión). **Anota el `task_id` que devuelve la llamada**: sin él no puedes cerrarlo en el paso 7.

```bash
pnpm run <script-elegido>
```

**4. Espera a que acepte conexiones** antes de la primera petición — el proceso arranca mucho antes de que termine de compilar y de conectarse a la base de datos. Sin `sleep`, deja que `curl` reintente:

```bash
curl -sS --retry 60 --retry-delay 2 --retry-connrefused -o /dev/null http://localhost:<puerto>
```

**5. Lee la salida del proceso en background** para confirmar el puerto real, que compiló y que la conexión a la base de datos se estableció. Si el arranque falla (puerto ocupado, error de compilación, variable de entorno faltante, base de datos inaccesible), reporta el error exacto de esa salida y detente: no lances peticiones contra un backend que no está, porque todo lo que observes después será un diagnóstico falso.

**6. Confirma que la API responde** con una petición al endpoint por el que empieza el flujo, ya con la ruta completa que estableciste en la sección "3. Mecánica de `curl`". A partir de aquí va el login de la sección "5. Login — pide usuario y contraseña, nunca los inventes", que se ejecuta igual en los dos modos, y solo después el procedimiento del modo elegido en la sección 1.

**7. Ciérralo todo antes de terminar la respuesta.** El backend vive lo que dura *la respuesta*, no la sesión: lo arrancaste tú y lo cierras tú, en el mismo turno, sin esperar a que el usuario lo pida. Nada tuyo queda corriendo entre turnos. El procedimiento está en la sección "8.1 Cerrar los procesos que abriste" y es obligatorio.

Si el usuario sigue con el mismo bug en el turno siguiente, vuelves a arrancarlo desde el paso 1 reutilizando el entorno que ya eligió — arrancar de nuevo cuesta segundos; un proceso huérfano ocupando el puerto cuesta un diagnóstico falso.

## 5. Login — pide usuario y contraseña, nunca los inventes

Se ejecuta **siempre y en los dos modos**, da igual que el encargo sea automatizar un flujo o depurar un bug. Va justo aquí por dos motivos de orden: necesita el backend arriba y respondiendo —paso 6 de la sección "4. Detectar el entorno (nunca asumirlo)"— y el token que devuelve es el que llevan los endpoints protegidos del modo que venga después.

Las credenciales se piden por dos razones:

- **No puedes inventarlas.** Usuario y contraseña son dos strings que el usuario digita a mano y que solo él conoce. Está **PROHIBIDO** inventarlos, y prohibido deducirlos del código, de un seed, de un archivo de entorno, de los tests, de la documentación o de la base de datos: un usuario que no existe devuelve el mismo 401 que una contraseña equivocada, y a partir de ahí todo lo que observes es un diagnóstico falso.
- **Sin login no hay token.** El resto del flujo cuelga de él: sin token, cada endpoint protegido responde 401 y no llegas a probar nada de lo que te pidieron.

**1. Pídelas con `AskUserQuestion`**, son dos preguntas: una para el usuario y otra para la contraseña. El valor real llega por la opción abierta que `AskUserQuestion` añade siempre —ahí lo escribe el usuario—; las dos opciones fijas que la herramienta exige por pregunta no pueden ser credenciales adivinadas, así que usa las únicas que no inventan nada: **"La escribo yo"** y **"Cancelar — no ejecutar el flujo"**.

Usa los dos valores **tal cual los escribió**: sin recortar espacios, sin cambiar mayúsculas, sin completar dominios ni prefijos. Y no los propagues: la contraseña no va al reporte, ni a un `console.log`, ni a los archivos de `logs/`; cuando tengas que mencionarla, redáctala.

Si el usuario elige cancelar, no lances el flujo: cierra el backend siguiendo la sección "8.1 Cerrar los procesos que abriste" y dilo.

**2. Haz el login con `curl`.** La ruta del endpoint y los nombres de los campos salen del controller y del schema de validación del login, como cualquier otro contrato de la sección "3. Mecánica de `curl`": no se asumen ni `/auth/login` ni `email`/`password`.

```bash
curl -i -sS -X POST "http://localhost:<puerto><ruta-del-login>" \
  -H "Content-Type: application/json" \
  -d '{"<campo-usuario>":"<usuario>","<campo-contraseña>":"<contraseña>"}'
```

**3. Guarda el token** de la respuesta en una variable de shell y reutilízalo en el header `Authorization` del resto de las peticiones, en lugar de repetir el login en cada paso.

**4. Cuando el login no es exitoso, repórtalo.** No lo es cuando el status no es 2xx, y tampoco cuando es 2xx pero el cuerpo no trae el token. El reporte lleva evidencia, no interpretación: la ruta exacta a la que pegaste, el status y el cuerpo de la respuesta, con la contraseña redactada. El status ya dice dónde mirar, con la tabla de la sección "7.2 Observar desde fuera (antes de tocar el código)": un 401 son las credenciales, un 404 es la ruta, un 400 es el contrato del body, un 500 es una excepción del server.

Después **para**. Está **prohibido** seguir el flujo sin token, inventarte uno, saltarte el guard o editar el código para que el endpoint deje de pedir autenticación. Lo que sigue depende del modo y de si el login era el flujo bajo investigación o solo el trámite previo para llegar a él.

Si el login era el flujo bajo investigación, el fallo ya está reproducido: continúa con la sección "7. Modo DEPURAR" — esto *es* el bug, no un obstáculo.

Si no, no puedes saber si falló lo que se escribió o falló la app, y las dos salidas llevan a sitios distintos: aplica la sección "2. Ante ambigüedad, detente y pregunta — nunca asumas", y deja que el modo en que estés fije qué opciones entran en esa pregunta.

## 6. Modo AUTOMATIZAR

Ejecutar el flujo, nada más. Aquí **no se diagnostica**: sin `-v`, sin leer los logs del server, sin instrumentar, sin mirar la base de datos. Esas son las herramientas del modo DEPURAR, descritas en la sección "7.2 Observar desde fuera (antes de tocar el código)", y aquí solo añaden ruido a un flujo que se pidió *ejecutar*, no auditar.

1. Ubica los endpoints del flujo: ruta real, método y contrato de cada uno.
2. Ejecuta el flujo completo de punta a punta encadenando las peticiones. La salida de una alimenta a la siguiente: el token que devuelve el login, el id del recurso que devuelve el alta. Lee el cuerpo de cada respuesta para extraer lo que necesita el paso siguiente, no para auditarlo.
3. Reporta: pasos ejecutados y estado final, leído del status y del cuerpo de la última respuesta.
4. Cierra el backend siguiendo la sección "8.1 Cerrar los procesos que abriste" antes de entregar el reporte.

Única excepción: que el usuario pida explícitamente el detalle de una respuesta ("dime qué devuelve el endpoint de X"). Entonces esa respuesta *es* el encargo, no diagnóstico — tráela y sigue.

Si el flujo se rompe, no te pongas a investigar por tu cuenta: eso ya es depurar. Reporta en qué paso se rompió, con qué status, y qué esperabas que pasara, y aplica el traspaso de modo de la sección "1. Elegir el modo — pregúntalo antes de ejecutar nada".

## 7. Modo DEPURAR

El orden importa. Cada paso descarta hipótesis antes de tocar código.

### 7.1 Reproducir

Ejecuta el flujo con `curl` hasta el punto de fallo. Si no puedes reproducirlo, dilo y pide los datos exactos —payload, usuario, id, headers— en lugar de instrumentar a ciegas.

### 7.2 Observar desde fuera (antes de tocar el código)

La mayoría de los bugs se identifican aquí sin editar nada, y hay dos fuentes distintas que hay que cruzar:

```bash
curl -i -sS ...                                                    # status y headers de la respuesta
curl -sS -w "\nstatus=%{http_code} tiempo=%{time_total}s\n" ...    # métricas de la petición
curl -v -sS ...                                                    # headers enviados, redirecciones, handshake
```

- **La respuesta HTTP** dice *qué* devolvió la API. Empieza siempre por el status: ya clasifica el fallo y te dice dónde mirar.
- **La salida del proceso en background** dice *por qué*. Un 500 cuyo cuerpo no dice nada casi siempre tiene el motivo completo en esa salida.

| Status | Dónde mirar primero |
|---|---|
| 404 | la ruta: prefijo global, versión, o el controller no está registrado en su módulo |
| 400 / 422 | validación: el schema del DTO rechazó el body; el mensaje dice qué campo |
| 401 / 403 | guard: token ausente, caducado, alterado, o usuario sin el rol necesario |
| 500 | excepción no controlada: el stack trace está en la salida del server, no en la respuesta |
| 2xx con datos incorrectos | lógica de negocio, ORM o base de datos: sección "7.3 Aislar API, lógica de negocio, ORM y base de datos" |
| conexión rechazada / timeout | el backend no está arriba, o el puerto no es ese: sección "4. Detectar el entorno (nunca asumirlo)" |

**Solo pasa a instrumentar el código si esto no basta.**

### 7.3 Aislar API, lógica de negocio, ORM y base de datos

Una petición atraviesa cuatro capas y el bug vive en exactamente una. Aíslalo de fuera hacia dentro: cada paso descarta una capa entera y te ahorra instrumentarla.

| Capa | Qué abarca | Pregunta que la descarta |
|---|---|---|
| **API** | routing, guards, interceptors, pipes de validación, DTO y serialización de la respuesta | ¿el handler llegó a ejecutarse? |
| **Lógica de negocio** | el service y sus casos de uso, hasta que llama al repositorio | ¿los datos ya venían mal antes de consultar? |
| **ORM** | repositorio, query builder, relaciones y mapeo entidad↔tabla | ¿la consulta emitida es la que esperabas? |
| **Base de datos** | los datos y el esquema reales | ¿el dato existe y vale lo que crees? |

**1. API.** ¿Entró al handler? Un log de Nivel 1 (sección "7.5 Instrumentar con console.log temporal") en la primera línea del método del controller lo responde en una pasada. Si ese log no aparece, el fallo es de la capa API y ni el service, ni el ORM, ni la base tienen nada que ver: la ruta no coincide, un guard cortó antes, o el pipe de validación rechazó el body. El status de la sección 7.2 ya te dice cuál de los tres.

Prueba los tres casos cuando apliquen: caso feliz, datos inválidos (400/422), y sin token de auth (401/403). Un endpoint que responde igual en los tres no tiene validación o no tiene guard, y eso ya es el hallazgo.

**2. Lógica de negocio.** Entró al handler: ahora, ¿qué recibió? Loguea el parámetro de entrada del service y su valor de retorno. Si al service ya le llega mal, el bug quedó atrás, en la capa API — transformación del DTO, parámetro de ruta mal leído, header ignorado. Si le llega bien y sale mal, el bug es del service, y ni el ORM ni la base están implicados.

**3. ORM.** El service pidió lo correcto: ¿qué le devolvió el ORM? Son dos preguntas distintas y se responden distinto:

- **La consulta** — instrumenta el criterio exacto que se le pasa al repositorio, justo antes de la llamada. Ahí se ven los filtros que no se aplicaron, la relación que no se incluyó, el límite inesperado. Si necesitas ver la consulta que el ORM emite de verdad, eso se activa en la configuración de la conexión, así que **pregunta antes**: es un cambio de configuración y lo prohíbe la sección "9. Límites".
- **El mapeo** — si la consulta trae filas pero la entidad llega vacía o con campos en `undefined`, el problema no son los datos sino el mapeo entidad↔tabla: nombre de columna, tipo, o una relación mal declarada.

**4. Base de datos.** La consulta era correcta y aun así no trae lo que esperabas: la pregunta pasa a ser si el dato está. Compruébalo **a través de la propia API**, con el endpoint de lectura del recurso — es una petición más de `curl`, no toca nada y no necesita permiso.

Consultar la base de datos directamente —cliente SQL, `psql`, el shell del motor, la consola del ORM— es una lectura: no altera nada y **no necesita autorización**, ver la sección "9. Límites". Aun así, empieza por el endpoint de lectura, que responde la misma pregunta sin salir del flujo; baja a la base cuando necesites ver la fila cruda, sin el mapeo del ORM ni la serialización de la respuesta de por medio. Lo que sí requiere que el usuario lo autorice antes es cualquier escritura desde ahí —crear, actualizar o borrar—, y borrar una tabla o la base entera tiene su propia regla en esa misma sección.

La capa en la que el valor deja de coincidir con lo esperado es donde está el bug. Deja de instrumentar las otras tres.

### 7.4 Inspeccionar `node_modules` (opcional)

**Este paso es opcional: no hay ninguna obligación de ejecutarlo.** Solo aporta cuando el bug apunta a una librería o dependencia; si el fallo está en el código del proyecto, sáltalo y sigue con el paso siguiente.

Las razones por las que se lee `node_modules` son:

- **Buscar los tipos de datos de la librería o dependencia relacionada con el bug**: la firma real de la función, la forma del objeto que devuelve, qué campos son opcionales. Los tipos que hay ahí son los de la versión instalada, que es la que el proyecto está usando de verdad.
- **Entender el funcionamiento de la librería o dependencia**: leer su implementación cuando lo que hace no coincide con lo que esperabas.

**Está prohibido leer la carpeta `node_modules` por completo**, porque llena el contexto de la IA y consume muchos tokens. Solamente si es necesario, leer específicamente las dependencias o librerías relacionadas con el bug a solucionar.

**Puedes leer `node_modules`, pero NO lo modifiques.** Es código de terceros que instala el gestor de paquetes: un cambio ahí no queda en el repo, no lo ve el resto del equipo y lo pisa el gestor en cuanto vuelva a resolver las dependencias. Si el diagnóstico apunta a una librería, eso se lleva a la pregunta de la sección "7.7 PARAR y preguntar — nunca corregir por tu cuenta".

### 7.5 Instrumentar con console.log temporal

**Formato obligatorio**, con marcador de limpieza al final:

```ts
console.log('[ruta/relativa/desde/la/raiz/archivo.ext] [nombreFuncionOMetodo]:', valor); // DBG-<id>
```

Ejemplo real:

```ts
console.log('[src/app/features/auth/auth.service.ts] [login]:', user); // DBG-a3f1
```

`<id>` es un hash corto de 4 caracteres, el mismo para toda la sesión de depuración. Existe para poder borrar todo después con un `grep`. Sin él, la instrumentación se queda en el repo.

Antes de instrumentar, ejecuta `git status`. Si el árbol está sucio, avisa al usuario: sin un diff limpio de referencia, no hay forma fiable de verificar la limpieza al final.

**Desenvuelve lo que no se imprime solo.** Loguear el envoltorio no muestra el valor:

- `await` la promesa antes de loguearla: una `Promise` pendiente no dice nada.
- Una entidad del ORM con proxies o relaciones perezosas: conviértela a plano antes de imprimirla.
- Objetos anidados: `JSON.stringify(valor, null, 2)`, porque la consola de Node corta la profundidad y muestra `[Object]` justo donde estaba el dato que buscabas.

#### Dónde poner los logs — por niveles

Instrumenta el **camino sospechoso**, no el archivo entero. Un log de más entierra la señal en ruido y te hace perder el bug.

**Nivel 1 — empieza siempre aquí:**
- La primera línea del método del controller que atiende el endpoint.
- Parámetros de entrada y valor de retorno del método sospechoso del service.
- Justo antes y justo después de cada llamada al ORM (criterio enviado / resultado crudo recibido).
- Justo antes y justo después de cada llamada HTTP saliente a un servicio externo (payload enviado / respuesta cruda recibida).
- Dentro de cada `catch` del flujo: loguea el objeto de error completo, no `error.message`.

**Nivel 2 — si el nivel 1 no localiza el fallo:**
- Resultado de cada validación, junto con el input que la produjo.
- Rama tomada en los condicionales del camino.
- Lo que devuelve el guard, y lo que el interceptor recibe y emite.
- Los parámetros de ruta, los de query y los headers, tal como los lee el handler.
- El objeto ya mapeado a DTO de respuesta, antes de serializarse.
- El estado acumulado entre pasos de un caso de uso, y el punto en que abre y cierra una transacción.

**Nivel 3 — con cuidado:**
- Ciclos: loguea la colección completa antes y después del bucle, o solo las iteraciones que cumplen una condición. Nunca un log crudo por iteración sobre una colección grande.

**Nunca:**
- En un middleware, guard o interceptor **global**: corre en *cada* petición del backend, incluidas las que no tienen nada que ver con el bug, y entierra la señal.
- En un método que dispara un scheduler o un cron, ni en un health check, sin filtro: se ejecutan solos y llenan la salida mientras la lees.
- Loguear tokens, contraseñas, hashes o cualquier secreto del payload: estos logs se escriben a disco en `logs/`. Loguea el dato redactado, o solo su longitud.

Después de cada tanda de instrumentación: repite la petición con `curl` y lee la salida del proceso en background. Ajusta y repite. Es un ciclo, no un volcado único.

**Espera a que recompile.** Los scripts de arranque corren en modo watch: al guardar un archivo el proceso recompila, y hasta que su salida no lo confirme sigues pegándole al build anterior — leerías logs que todavía no existen y concluirías que tu instrumentación "no se ejecuta".

### 7.6 Forzar la rama de error

Para probar el `catch` y no solo el `try`, **prefiere forzar el fallo desde la propia petición**, sin tocar el código. La mayoría de las ramas de error de un backend se alcanzan con un `curl` bien elegido:

| Rama que quieres alcanzar | Petición que la fuerza |
|---|---|
| validación del DTO | body con el campo faltante, del tipo equivocado o fuera de rango |
| `catch` de parseo | JSON malformado con `Content-Type: application/json` |
| guard de autenticación | sin el header `Authorization`, o con un token caducado o alterado |
| guard de autorización | token válido de un usuario sin el rol necesario |
| "no encontrado" | un id con formato válido que no existe |
| conflicto o duplicado | repetir dos veces la misma petición de alta |
| método no permitido | el mismo endpoint con otro verbo HTTP |

Todo eso es reversible, no deja residuos en el repo y ejercita el `catch` real.

Modifica el código para forzar un `throw` **solo** cuando el fallo no se pueda inducir desde la petición —el caso típico es la caída de una dependencia externa: la base de datos, un servicio de terceros— y solo en el `catch` del flujo bajo investigación. No recorras el proyecto forzando todos los `catch`. Ese `throw` temporal se marca y se borra igual que un log: `// DBG-<id>`.

### 7.7 PARAR y preguntar — nunca corregir por tu cuenta

Cuando tengas el diagnóstico, **detente**. No apliques la corrección.

Usa `AskUserQuestion` con:
- Una explicación del bug: archivo, línea, causa raíz, y la evidencia que lo demuestra (el log de la instrumentación, el status HTTP, el stack trace del server, el criterio que recibió el ORM).
- **Mínimo 2 opciones de solución**, cada una con su consecuencia real (alcance del cambio, qué más podría romper).
- Una marcada explícitamente como **recomendada**, con el motivo.
- Una opción final del tipo "Otra — la describo yo" para que el usuario proponga su propio enfoque.

Un diagnóstico sin evidencia no es un diagnóstico. Si no puedes señalar el log o la respuesta HTTP que lo prueba, sigue depurando en lugar de preguntar.

### 7.8 Corregir y verificar

Aplica solo la opción elegida. Después, vuelve a ejecutar el flujo completo con `curl`: status esperado, cuerpo esperado, y la salida del server sin la excepción. Si la corrección afecta a una escritura, verifica también el efecto volviendo a leer el recurso con su endpoint de lectura. Repite hasta que pase. Un "ya debería funcionar" sin ejecución no cuenta como verificación.

## 8. Limpieza y verificación obligatorias

Se hace **en la misma respuesta**, antes de devolverle el turno al usuario. No en la siguiente, no "cuando termine el bug".

### 8.1 Cerrar los procesos que abriste

No dejes nada vivo en background. En este orden:

1. **El backend:** `TaskStop` con el `task_id` del paso 3 de la sección "4. Detectar el entorno (nunca asumirlo)".

2. **Verifica que murió de verdad**, no que "debería" haber muerto:

   ```bash
   curl -sS -o /dev/null -w "%{http_code}" http://localhost:<puerto>
   ```

   La conexión tiene que fallar. Si el puerto sigue respondiendo, el proceso quedó vivo, y es lo normal: `TaskStop` mata el wrapper de `pnpm`, pero el backend corre en un proceso hijo de Node que sobrevive. Localízalo por el puerto y mátalo con todo su árbol de hijos antes de dar nada por terminado:

   ```bash
   netstat -ano | grep ":<puerto>.*LISTENING"   # la última columna es el PID
   taskkill //PID <pid> //T //F                 # en PowerShell: taskkill /PID <pid> /T /F
   ```

   Vuelve a lanzar el `curl` y no sigas hasta que la conexión falle.

Esto aplica **siempre**, no solo cuando la tarea sale bien: también si abandonas el diagnóstico, si el arranque falló a medias, si el usuario cambia de tema, o si te quedas esperando su respuesta a un `AskUserQuestion`. Un backend huérfano ocupa el puerto y mantiene abierta su conexión a la base de datos, así que el siguiente arranque falla o —peor— le pegas sin darte cuenta a la instancia vieja y depuras contra un build que ya no corresponde al código.

### 8.2 Borrar la instrumentación

```bash
grep -rn "DBG-<id>" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.claude --exclude-dir=dist --exclude-dir=logs
```

Borra cada coincidencia, junto con cualquier `throw` temporal que hayas añadido para forzar un `catch`. Luego:

```bash
git diff
```

Revisa el diff completo. Lo único que debe quedar es la corrección autorizada. Si aparece cualquier `console.log` o cambio que no forma parte de la solución acordada, bórralo.

Reporta al usuario que la limpieza está verificada. Instrumentación olvidada en el repo es un fallo de la tarea, no un detalle menor.

### 8.3 Ejecutar el linter

Va **antes** del build a propósito: tarda segundos en vez de minutos, así que si algo está mal te enteras sin esperar a que compile el proyecto entero.

Solo si el proyecto tiene ESLint configurado. **Lee los scripts del `package.json`**: busca uno tipo `lint`, `lint:fix` o `eslint`, y ejecuta el nombre exacto que encuentres ahí.

```bash
pnpm run <script-de-lint>
```

Ni el script ni la configuración se asumen: el nombre del script sale de los scripts del `package.json`, y la configuración es el fichero `eslint.config.*` o `.eslintrc*` que exista en el proyecto. Los dos se deducen leyendo, no de memoria. Si el script incluye `--fix`, el linter modifica archivos por su cuenta: revisa el `git diff` después.

**Si no hay script de lint ni fichero de configuración** (`eslint.config.*`, `.eslintrc*`), **ignóralo y salta al paso siguiente**: no es un fallo. Menciónalo en el reporte en una línea, para que el usuario sepa que ese control no se ejecutó. Lo que **no** puedes hacer es instalar ESLint ni crear una configuración para poder correrlo: eso es cambiar dependencias del proyecto, prohibido por la sección "9. Límites".

Si el linter marca errores, aplica la sección "7.7 PARAR y preguntar — nunca corregir por tu cuenta" tal cual está escrita ahí, con los dos tipos de error del apartado siguiente.

#### Cómo leer y clasificar la salida — aplica al linter y al build

**Lee la salida completa de la terminal, no solo el código de salida.** Este apartado se escribe una sola vez y vale para los dos pasos, "8.3 Ejecutar el linter" y "8.4 Ejecutar el build": los dos se recorren igual y sus errores se separan igual.

Recorre la salida buscando:

| En la salida | Qué significa |
|---|---|
| `Error:` / `ERROR in` | fallo real; trae archivo y línea, úsalos para diagnosticar |
| `error TS####` | error de TypeScript, con el código concreto que puedes consultar |
| `Cannot find module` | import roto: alias `@/` mal escrito, o archivo movido o renombrado |
| `Warning:` / `WARNING in` | puede ser preexistente; contrástalo con los archivos que tocaste |

Diagnostica desde el archivo y la línea que da la propia salida, no adivinando. Si la salida es larga, no la resumas de memoria: vuelve a leerla y cita el mensaje exacto.

Cuando el linter o el build fallen, se aplica la sección "7.7 PARAR y preguntar — nunca corregir por tu cuenta" tal cual está escrita ahí. Lo único que estos dos pasos añaden es qué llevar a esa pregunta, porque su salida mezcla dos tipos de error:

1. Los que **NO** están relacionados con el bug buscado por el usuario.
2. Los que **SÍ** están relacionados con el bug buscado por el usuario.

Sepáralos revisando el working directory, nunca suponiendo: `git stash` y vuelve a ejecutar el paso que falló — lo que sigue fallando sin tus cambios es del tipo 1 —, luego `git stash pop` y ejecútalo otra vez — lo que aparece solo con tus cambios aplicados es del tipo 2.

Lleva los dos tipos a la pregunta, en listas separadas, cada error con el archivo, la línea y el mensaje exacto de la salida. **Si un tipo no tiene errores, dilo y no inventes ninguno**: "no hay errores ajenos al bug buscado" y "no hay errores relacionados con el bug buscado" son las respuestas que corresponden cuando esa lista está vacía.

Los errores del tipo 1 son trabajo fuera de la corrección autorizada: no los toques salvo que el usuario elija arreglarlos en esa pregunta, ver la sección "9. Límites".

### 8.4 Ejecutar el build

El último control: con la instrumentación borrada y el linter ya resuelto según el paso anterior, comprueba que el proyecto compila. El script de build es el del entorno que el usuario ya eligió en el paso 2 de la sección "4. Detectar el entorno (nunca asumirlo)": aquí no se vuelve a preguntar ni se elige otro.

Son tres pasos y van en este orden:

**1. Busca la carpeta del build que le corresponde a este framework** — la que contiene los archivos compilados. Cada framework escribe en la suya y con su propio nombre, así que dedúcela: identifica qué framework usa el proyecto por las dependencias del `package.json`, y saca la ruta de su fichero de configuración o de la que el propio build imprime al terminar. Ni el framework ni la carpeta se dan por sabidos. **Nunca borres una carpeta que no hayas confirmado que es la del build de ese framework.**

**2. Solo cuando esa carpeta exista, bórrala.** Si no existe, no hay nada que borrar: pasa directo al paso 3 sin crear ni tocar nada.

**3. Ahora sí, ejecuta el build:**

```bash
pnpm run <script-de-build>
```

Recorre y clasifica su salida con el apartado "Cómo leer y clasificar la salida" del paso anterior. Los scripts de arranque corren en watch y recompilan de forma incremental solo lo que cambió; el build compila el proyecto entero con `tsconfig.build.json`, así que hay errores de tipos, de imports o de archivos que ni tocaste que solo aparecen aquí.

## 9. Límites

- **ABSOLUTAMENTE PROHIBIDO borrar la base de datos.** Ni con un comando del motor (`DROP DATABASE`), ni con uno del ORM, ni con un script, ni con un flag de "resetear", "recrear" o "sincronizar desde cero" el esquema. Esta prohibición no tiene excepción y no se resuelve preguntando: no hay respuesta del usuario que la habilite dentro de esta skill. Si el diagnóstico parece exigirlo, reporta lo que encontraste y detente ahí.
- **PROHIBIDO borrar tablas sin previa autorización del usuario.** `DROP TABLE` y `TRUNCATE`, sea con el cliente del motor, con el ORM o con un script; y también borrar una entidad o un modelo del ORM y dejar que la sincronización automática elimine su tabla en el siguiente arranque, que es lo mismo aunque solo hayas editado un archivo. Pregunta antes con `AskUserQuestion` diciendo qué tabla borrarías y por qué; sin esa respuesta, no se ejecuta.
- **Leer está permitido; crear, actualizar y borrar necesitan previa autorización del usuario.** La lectura no altera el código ni la base de datos, así que se ejecuta sin preguntar: un `GET` de listado o de detalle, o una consulta de solo lectura contra la base. Lo que sí necesita que el usuario lo autorice antes, caso por caso, es todo lo que **muta** la información —crear, actualizar y borrar—, tanto por HTTP (`POST`, `PUT`, `PATCH`, `DELETE`) como accediendo directamente a la base: cliente SQL, `psql`, el shell del motor, la consola del ORM o un script de seed. Pregunta con `AskUserQuestion` diciendo qué operación harías y sobre qué tabla o endpoint. Las peticiones del flujo que el usuario pidió ejecutar o depurar son el encargo, y ese encargo ya es la autorización aunque el flujo mute datos; cualquier mutación fuera de ese flujo necesita la suya.
- **No modifiques la base de datos —esquemas ni relaciones— sin previa autorización del usuario.** Cambiar una entidad, un modelo, una columna, un índice o una relación es cambiar la base de datos aunque solo edites un archivo del ORM, y con la sincronización automática del ORM activada el cambio se aplica solo en el siguiente arranque, sin migración de por medio. Aunque el diagnóstico apunte ahí, la corrección se propone en la pregunta de la sección "7.7 PARAR y preguntar — nunca corregir por tu cuenta" y se aplica solo si el usuario la elige.
- **No ejecutes migraciones sin previa autorización del usuario.** Ni generarlas, ni aplicarlas, ni revertirlas, sea cual sea el comando del ORM del proyecto. Una migración aplicada cambia la base de datos, y algunas no se pueden deshacer.
- No escribas tests de Jest ni de Supertest. Si el usuario quiere cobertura permanente, dilo y pregunta; no lo hagas por iniciativa propia.
- No refactorices, renombres ni "mejores" código que no forma parte de la corrección autorizada.
- No alteres el proyecto original —configuración, funcionalidad, dependencias ni variables de entorno— por iniciativa propia. Cámbialo solo si el usuario lo pidió explícitamente, o si preguntaste antes y autorizó ese cambio.
- No inventes la causa del bug. Si tras la instrumentación no está clara, reporta lo que descartaste y lo que falta por descartar.
