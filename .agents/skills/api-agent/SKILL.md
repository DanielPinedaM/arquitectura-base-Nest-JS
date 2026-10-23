---
name: api-agent
description: 'Automatiza flujos y depura bugs de la API ejecutando el backend real y haciéndole peticiones HTTP con curl. Úsala cuando el usuario diga que un endpoint no funciona, no responde, no guarda, da error o devuelve datos incorrectos, o pida reproducir, verificar o automatizar un flujo del backend.'
---

# Depuración y automatización de backend con `curl`
Verifica el comportamiento ejecutando el backend.

Leer el código permite **deducir qué debería suceder**; ejecutar peticiones HTTP con `curl` muestra lo que **sucede realmente** en el backend.

## Uso de `curl`
1. Antes de la primera petición, establece la ruta real del endpoint (prefijo y versión, deducidos de la configuración de arranque y confirmados con el listado de rutas que imprime el backend o con su documentación de la API) y su contrato (método, body y headers obligatorios, deducidos del handler y de su esquema de validación).

2. Sintaxis base de una petición:
- `-i` muestra el status y los headers

- `-sS` oculta el progreso, pero no los errores

```bash
curl -i -sS -X <método HTTP> "http://<hostname>:<puerto><ruta>" \
     -H "Content-Type: <content-type>" \
     -H "Authorization: Bearer $TOKEN" \
     <body>
```

3. Los comandos de esta skill están escritos para Bash:
- Los ejemplos de `curl` no son una lista cerrada, puedes usar cualquier flag. Para ver la sintaxis ejecuta `curl --help all`.

- En PowerShell, escribe `curl.exe` en vez de `curl`, porque en PowerShell `curl` ejecuta `Invoke-WebRequest`, que no entiende las flags de `curl`. También puedes lanzar la petición desde Bash.

4. No instales ni uses otro cliente HTTP.

## 1. Elegir el modo
Pregunta el modo antes de ejecutar nada, siempre (aunque el usuario ya lo haya dicho) y sin recomendar ninguno. Describe cada opción: AUTOMATIZAR ejecuta el flujo y reporta el estado final, sin tocar el código ni diagnosticar; DEPURAR reproduce, observa, instrumenta si hace falta y para a preguntar antes de corregir.

| | Modo AUTOMATIZAR | Modo DEPURAR |
|---|---|---|
| Para qué sirve | ejecutar o automatizar un flujo de la app | verificar el funcionamiento del backend, encontrar la causa y solucionar bugs |
| Ejemplo de uso | Insert masivos a la base de datos | El endpoint X no esta retornando Y, corrigelo                                 |
| ¿Modifica código fuente? | no | sí |
| ¿Le hace peticiones HTTP a la API con `curl`? (salida del servidor, body y headers de la respuesta) | no | sí |
| ¿Ejecuta linters?, por ejemplo ESLint | no | sí, pero solo si hay linters configurados |
| ¿Escribe código de testing (Jest, Vitest, etc.)? | no | sí, pero solo si el proyecto ya tiene tests y en dos casos: al modificar una funcionalidad que ya tenía tests escritos o cuando el usuario lo pide explícitamente |
| ¿Ejecuta tests? | no | sí, pero solo si el proyecto tiene tests |
| ¿Genera el build de la aplicación? | no | sí |
| ¿Pide usuario y contraseña para hacer login? | solo si el flujo exige autenticación | solo si el flujo exige autenticación |
| ¿Usa un subagente revisor de solo lectura para verificar la solución del bug? | no | sí |

DEPURAR modifica el código solo en los siguientes casos:

1. **La instrumentación temporal:** los logs de 5.5, que no cambian el comportamiento, y el `throw` de 5.6. Se aplica sin preguntar y siempre se borra antes de terminar el turno.

2. **La corrección autorizada (5.7):** incluye tests solo si el proyecto ya tiene tests y en dos casos: al modificar una funcionalidad que ya tenía tests escritos o cuando el usuario lo pide explícitamente.

Los bugs que encuentres de paso se reportan, no se corrigen. La única excepción son los errores del linter, los tests o el build que el usuario elija en 5.13.

## 2. Preparar el entorno
1. Deduce si el proyecto usa npm o pnpm por su lockfile y por el campo `packageManager` del `package.json`. Si se contradicen, no hay ninguno o es otro gestor, pregunta. Puedes instalar las dependencias ya declaradas. Deduce también el ORM y la base de datos de las dependencias y de la configuración de la conexión: de ahí se leen las entidades o modelos y las consultas.

2. Pregunta qué script se ejecuta: una opción por cada script del `package.json` que levante la app, con su nombre exacto, y en la descripción el archivo de entorno que carga, su puerto, la base de datos a la que apunta y si compila el código o sirve un build ya generado, deducidos de lo que ejecuta (nunca de su nombre). Añade «Otra — la indico yo». Pregunta aunque haya un solo candidato.

3. Al empezar DEPURAR, o al pasar a DEPURAR desde AUTOMATIZAR, pregunta también qué script de build se ejecuta, con las mismas reglas. Si no hay ninguno, ofrece «Otra — indico yo el comando» y «Omitir el build».

4. Si el puerto está ocupado, mata el proceso y su árbol hasta liberarlo. Nunca lo reutilices.

5. Arranca tú el script elegido en segundo plano (nunca le pidas al usuario que lo arranque) y guarda su identificador. En DEPURAR, si el script sirve un build ya generado, regenera antes el build con el script del paso 3 (si se omitió, avisa de que el build puede no corresponder al código). Espera a que acepte conexiones, sin esperas fijas, y lee su salida para confirmar el puerto real, que compiló y que conectó con la base de datos. Si falla, reporta el error exacto y detente; pero si el fallo lo causa tu propio cambio (instrumentación de 5.5, `throw` de 5.6 o corrección de 5.8), corrígelo en vez de detenerte (en 5.8 cuenta como «no pasa»).

6. Confirma que la API responde con una petición de solo lectura.

7. Tras cada cambio en el código, haz que llegue al backend antes de repetir la petición (hasta entonces responde el build anterior): si el proceso recompila solo, espera a que su salida lo confirme; si no (incluido un script que sirve un build ya generado), reinícialo con los pasos 4 y 5.

## 3. Login (solo si el flujo exige autenticación)
1. Deduce del código si los endpoints del flujo exigen autenticación. Si hay duda, confírmalo con una petición de solo lectura sin credenciales (401 o 403 = protegido); nunca sondees con un endpoint que muta datos. Pide usuario y contraseña solo si el flujo está protegido o es el propio login.

2. Nunca inventes ni deduzcas las credenciales (del código, seeds, archivos de entorno, tests, documentación o la base de datos) ni ofrezcas valores adivinados como opción. Úsalas tal cual las escribió el usuario y nunca las muestres en reportes, logs ni `console.log`; la única excepción es pasárselas en el prompt al subagente revisor (5.14), que tampoco las muestra en su veredicto. Si el usuario cancela, sigue en la sección 6 y dilo.

3. Haz el login con `curl`: la ruta y los nombres de los campos salen del handler y de su esquema de validación, no se asumen. Guarda el token en una variable de shell y reutilízalo; no repitas el login. Si cada comando abre una terminal nueva, la variable no persiste: vuelve a asignar en cada invocación el token ya obtenido. Si rearrancas, reutiliza las credenciales ya dadas.

 ```bash
curl -i -sS -X POST "http://<hostname>:<puerto><ruta-del-login>" \
     -H "Content-Type: application/json" \
     -d '{"<campo-usuario>":"<usuario>","<campo-contraseña>":"<contraseña>"}'
     TOKEN='<token de la respuesta>'
```

4. Nunca sigas sin token, te inventes uno, te saltes la autenticación ni edites el código para desactivarla.

5. Si el login falla (status distinto de 2xx, o 2xx sin token), reporta la ruta, el status y el cuerpo de la respuesta (con la contraseña redactada) y para: un 401 indica credenciales; un 404, la ruta; un 400, el contrato del body; un 500, una excepción del servidor. Si estás en DEPURAR y el login era el flujo investigado, ese fallo es el bug: sigue en el paso 5.1. Si no, pregunta cómo seguir.

## 4. Modo AUTOMATIZAR
1. Ubica los endpoints del flujo: ruta real, método y contrato de cada uno.

2. Encadena las peticiones de punta a punta: la salida de una alimenta la siguiente (el token, el id creado). Lee cada respuesta solo para extraer lo que necesita el paso siguiente. Antes de cada petición mutable, pregunta según la sección 7.

3. Lee el estado final del status y del cuerpo de la última respuesta y sigue en la sección 6.

No diagnostiques: sin `-v`, sin leer la salida del servidor, sin instrumentar y sin mirar la base de datos. Si el usuario pide el detalle de una respuesta, tráelo. Si el flujo se rompe, no lo investigues ni lo corrijas: reporta en qué paso se rompió, con qué status y qué esperabas, y pregunta si quiere pasar a DEPURAR. Si acepta, sigue en el paso 3 de la sección 2 (la pregunta del build); si el script sirve un build ya generado, reinícialo con los pasos 4 y 5; después sigue en el paso 5.1.

## 5. Modo DEPURAR
- **5.1 Reproducir.** Antes de tocar nada, revisa el estado del repositorio: si ya hay cambios, avisa al usuario y anótalos (los usan 5.9, 5.13 y 5.14). Después ejecuta el flujo con curl hasta el fallo. Si no se reproduce, pide los datos exactos (payload, usuario, id, headers).
- **5.2 Observar desde fuera.** Cruza la respuesta HTTP (empieza por el status; `-v` muestra lo enviado y `-w`, las métricas) con la salida del proceso en segundo plano, donde está el stack trace. Instrumenta solo si esto no basta.

  | Status | Dónde mirar primero |
  |---|---|
  | 404 | la ruta: prefijo, versión o handler sin registrar |
  | 400 / 422 | la validación: el mensaje dice qué campo falla |
  | 401 / 403 | la autenticación o la autorización: token ausente, caducado o alterado, o usuario sin el rol |
  | 500 | excepción no controlada: el stack trace está en la salida del servidor |
  | 2xx con datos incorrectos | lógica de negocio, ORM o base de datos (5.3) |
  | conexión rechazada o timeout | el backend no está arriba o el puerto no es ese (sección 2) |

- **5.3 Aislar la capa del bug**, de fuera hacia dentro, con logs que siguen el formato y los niveles de 5.5. La capa donde el valor deja de coincidir es la del bug: deja de instrumentar las demás.
  1. **API** (rutas, autenticación, validación y serialización): ¿llegó a ejecutarse el handler? Loguéalo en su primera línea; si no llega, el fallo es de esta capa. Cuando apliquen, prueba caso feliz, datos inválidos y sin token: si un endpoint que debería validar o autenticar responde igual en los tres, falta validación o autenticación. En un endpoint que escribe datos, estas variantes requieren autorización previa.

  2. **Lógica de negocio**: loguea la entrada y el retorno del servicio. Si ya le llega mal, el bug está en la capa API; si le llega bien y sale mal, está aquí.

  3. **ORM**: loguea el criterio exacto justo antes de la llamada: ahí se ven los filtros que no se aplicaron, la relación que no se incluyó o un límite inesperado. Ver la consulta que emite exige cambiar la configuración: pregunta antes. Si trae filas pero la entidad llega vacía, el bug está en el mapeo.

  4. **Base de datos**: comprueba si el dato existe, primero con el endpoint de lectura; si necesitas la fila cruda, consulta la base (leer no requiere autorización).

- **5.4 Inspeccionar `node_modules` (opcional).** Solo si el bug apunta a una dependencia: lee únicamente los archivos de esa dependencia (sus tipos o su implementación). Nunca leas `node_modules` completo ni lo modifiques. Si el diagnóstico apunta a la librería, llévalo a la pregunta de 5.7.

- **5.5 Instrumentar con console.log temporal — BUCLE DE INSTRUMENTACIÓN: puntos 2 hasta 3.**
  1. Formato: `console.log('[ruta/relativa/archivo.extension] [funciónOMétodo]:', valor); // DBG-<id>`, con un `<id>` de 4 caracteres, el mismo en toda la sesión. Antes de loguear, espera las promesas, convierte las entidades del ORM en objetos planos y serializa los objetos anidados con `JSON.stringify(valor, null, 2)`.

  2. Dónde poner los logs — por niveles, solo en el camino sospechoso:
     - **Nivel 1**: la primera línea del handler; la entrada y el retorno del servicio sospechoso; antes y después de cada llamada al ORM y de cada llamada HTTP saliente; el error completo dentro de cada `catch`.
     - **Nivel 2** (si el 1 no basta): cada validación con su input, la rama tomada en los condicionales, lo que deciden la autenticación y la autorización, lo que transforma la petición o la respuesta alrededor del handler, los parámetros de ruta, la query y los headers tal como los lee el handler, el objeto de respuesta antes de serializarse, el estado entre pasos y la apertura y el cierre de cada transacción.
     - **Nivel 3**: en bucles, la colección antes y después, o solo las iteraciones que cumplen una condición.
     - **Nunca**: en código que corre globalmente en cada petición, sea middleware, autenticación o transformaciones; ni, sin filtro, en tareas programadas o health checks.
  3. Tras cada tanda, haz que el cambio llegue al backend (paso 7 de la sección 2), repite la petición y lee la salida del proceso. Si el fallo no queda localizado, ajusta los logs y vuelve al punto 2 mientras queden niveles por probar.

  4. **Salida del bucle**: el fallo queda localizado con evidencia → sigue en el paso 5.6 si necesitas probar una rama de error; si no, en el 5.7. Si agotaste los niveles sin localizarlo → sigue en el paso 5.7, que reporta sin inventar la causa.

- **5.6 Forzar la rama de error.** Fuerza el fallo desde la petición: campo faltante, de otro tipo o fuera de rango; JSON malformado; sin token o con un token caducado o alterado; token de un usuario sin el rol; id inexistente con formato válido; alta duplicada; otro verbo HTTP. Las variantes que escriben datos (como el alta duplicada o un verbo que muta) requieren autorización previa. Usa un `throw` en el código solo si no se puede desde la petición (caída de una dependencia externa), únicamente en el `catch` investigado y marcado con `DBG-<id>`.

- **5.7 PARAR y preguntar — nunca corregir por tu cuenta — BUCLE DE DIAGNÓSTICO: pasos 5.2 hasta 5.7.** Si aún no tienes evidencia (el log, el status, el stack trace o el criterio del ORM que lo prueba), no preguntes: vuelve al paso 5.2 y repite 5.2 hasta 5.7. **Salida del bucle**: con evidencia, haz la pregunta; si agotaste los niveles de 5.5 sin evidencia, no inventes la causa: reporta lo que descartaste, lo que falta por descartar y por qué no la encontraste, y sigue en la sección 6. La pregunta muestra el bug (archivo, línea, causa raíz y evidencia), al menos 2 soluciones con su consecuencia, una recomendada con su motivo y «Otra — la describo yo». Si el usuario autoriza una, sigue en el paso 5.8; si no autoriza ninguna, ve al paso 5.9 y después a la sección 6.

- **5.8 Corregir y verificar — BUCLE DE VERIFICACIÓN: paso 5.8.** Aplica solo lo autorizado y después haz que el cambio llegue al backend: si vienes de un bucle con el backend cerrado, rearráncalo desde el paso 4 de la sección 2, con el mismo entorno, y repite el login con las mismas credenciales si hace falta; si sigue vivo, aplica el paso 7 de la sección 2. Repite el flujo completo con curl: status y cuerpo esperados y salida del servidor sin la excepción; si la corrección afecta a una escritura, relee el recurso con su endpoint de lectura. Si no pasa (también si el backend no compila o no arranca con la corrección) y el arreglo cabe en lo autorizado, ajústalo y repite este paso; si exige salir de lo autorizado, vuelve al paso 5.7 con la nueva evidencia. **Salida del bucle**: el flujo pasa → sigue en el paso 5.9.

- **5.9 Borrar la instrumentación y cerrar los procesos.** Borra cada línea `DBG-<id>` y cada `throw` temporal. En el diff solo deben quedar la corrección autorizada y los cambios previos del usuario (5.1). Después cierra el backend (pasos 2 y 3 de la sección 6): el linter, los tests y el build se ejecutan sin él.

- **5.10 Ejecutar el linter.** Solo si hay script de lint y archivo de configuración para un linter. Ejecútalo sin autocorrección: si el script autocorrige, ejecuta el mismo linter sobre los mismos archivos sin esa opción. Si falta el script o la configuración, omítelo y menciónalo en el reporte. Nunca instales ni configures un linter.

- **5.11 Ejecutar los tests.** Solo si hay script de test y archivos de test reales. Ejecuta los unitarios en una sola pasada, sin watch ni interfaz; los e2e, solo con autorización, porque pueden escribir en la base de datos. Nunca crees tests para tener algo que ejecutar.

- **5.12 Ejecutar el build.** Usa el script elegido en el paso 3 de la sección 2; si el usuario eligió «Omitir el build», sáltalo y menciónalo en el reporte. Antes, borra su carpeta de salida solo si confirmaste que es la de ese build.

- **5.13 Separar los errores y preguntar — BUCLE DE CORRECCIÓN: pasos 5.8 hasta 5.13.**
  1. Lee la salida completa de 5.10–5.12, no solo el código de salida, incluidos los warnings (un build puede terminar sin fallar y aun así avisar de algo que rompiste), y cita los mensajes exactos.

  2. **Salida del bucle**: si los pasos que se ejecutaron no dieron errores ni warnings, si solo quedan los que el usuario ya decidió no corregir, o si en el punto 4 decide no corregir → sigue en el paso 5.14.

  3. Aparta temporalmente solo tus cambios de la corrección (incluidos los archivos nuevos; en un archivo que ya tenía cambios del usuario, solo los tuyos) y repite cada paso que dio errores o warnings: lo que sigue apareciendo no pertenece al bug; lo que desaparece, sí. Después vuelve a aplicar tus cambios y ejecuta esos pasos otra vez, para que su resultado y la carpeta del build correspondan al código con la corrección. No toques los cambios previos del usuario (5.1).

  4. PARA y pregunta con el formato de 5.7, con dos listas (errores que pertenecen al bug y errores que no), cada error con archivo, línea y mensaje. Si una lista está vacía, dilo, y no repitas los que el usuario ya decidió no corregir. Los errores que no pertenecen al bug solo se corrigen si el usuario los elige explícitamente.

  5. Si el usuario autoriza corregir: vuelve al paso 5.8, corrige solo lo autorizado y repite 5.8 hasta 5.13.
- **5.14 Verificar con un subagente revisor — BUCLE DE REVISIÓN: pasos 5.8 hasta 5.14.**

  1. Lanza, con un prompt un subagente nuevo de solo lectura: no edita ningún archivo; lee, ejecuta `git status` y `git diff` y, si el flujo esta relacionado con endpoints del backend, les hace peticiones HTTP con `curl`. Espera su veredicto.

  2. Pásale hechos, no conclusiones: el requisito del usuario (lo que pidió verificar en modo DEPURAR: comportamiento esperado, fallo observado y pasos para reproducirlo), la evidencia observada, el alcance autorizado, los archivos que ya tenían cambios (5.1), la salida del linter, los tests y el build (5.10–5.12) con los errores que el usuario decidió no corregir en 5.13, los hallazgos que ya descartó, el script que levanta el backend con su puerto y, si el flujo exige autenticación, el usuario y la contraseña tal cual los escribió el usuario. No le pases tu diagnóstico.

  3. El revisor comprueba que el diff soluciona el bug y cumple el requisito del usuario, que no introduce bugs nuevos, que no cambia nada fuera del alcance y que no deja instrumentación. Si el flujo esta relacionado con endpoints del backend, lo verifica con `curl`:
     - Arranca el script con los pasos 4 a 6 de la sección 2 y hace el login de la sección 3 si el flujo exige autenticación.
     - Solo prueba los endpoints del flujo, nunca otros: el caso feliz y las variantes de 5.6 que apliquen, cruzando cada respuesta con la salida del servidor (5.2).
     - Ejecuta sin autorización solo el login y las peticiones con métodos que no mutan (GET, HEAD, OPTIONS). Antes de cada petición con un método que muta (POST, PUT, PATCH, DELETE), se detiene sin ejecutarla, mantiene vivo el backend y devuelve esa petición con su método, ruta y body para que el usuario la autorice (punto 4).
     - Al terminar la verificación, detiene el backend y verifica que el puerto ya no responde (pasos 2 y 3 de la sección 6).

     No opina de estilo. Responde «sin hallazgos» o una lista con archivo, línea y evidencia (si el hallazgo sale de una petición, la evidencia es el status, el cuerpo de la respuesta o el stack trace de la salida del servidor), y reporta como «no probadas» las peticiones mutables que el usuario no autorizó.

  4. Cada vez que el revisor se detiene con una petición mutable, pregunta al usuario por esa petición, con su método, ruta y body (con la contraseña redactada): una pregunta por petición, siempre antes de ejecutarla. Pásale la respuesta al mismo revisor para que continúe: si el usuario la autorizó, la ejecuta; si no, la marca como «no probada» y sigue con la siguiente.

  5. **Salida del bucle**: si el revisor termina con «sin hallazgos», o si en el punto 7 el usuario decide no corregir → sigue en la sección 6.

  6. No asumas que un hallazgo del revisor es correcto: verifícalo primero y confírmalo o refútalo con evidencia. Solo se corrige lo confirmado.

  7. Antes de iniciar cada iteración, PARA y pregunta al usuario con el formato de 5.7, incluidos los hallazgos refutados con su evidencia (aunque lo estén todos): el usuario tiene la última palabra sobre qué queda confirmado.

  8. Si el usuario autoriza una corrección: vuelve al paso 5.8, corrige únicamente los errores relacionados con el requisito del usuario (incluidos los bugs nuevos, los fallos de alcance y la instrumentación que dejó tu propia corrección; un bug ajeno y previo solo se reporta) y repite 5.8 hasta 5.14, lo que incluye volver a ejecutar el linter, los tests y el build (5.10–5.12).

## 6. Cerrar y reportar
Antes de terminar el turno, por cualquier camino (al acabar, si abandonas, si el arranque falló, si el usuario no autoriza la corrección, si no encuentras la causa o si la pregunta queda como texto final):

1. Si quedó instrumentación, bórrala (5.9).
2. Detén el backend con su identificador.
3. Verifica que el puerto ya no responde: la conexión tiene que fallar. Si responde, mata el proceso por su PID con su árbol y vuelve a verificar.
4. Reporta. En AUTOMATIZAR: los pasos ejecutados y el estado final. En DEPURAR: la causa, la corrección aplicada, el resultado de la verificación, que la limpieza está verificada y los controles omitidos (linter, tests o build) con su motivo.

Durante una pregunta interactiva dentro del turno, mantén vivo el backend. Si el usuario sigue con el mismo bug en otro turno, rearranca desde el paso 4 de la sección 2 con el mismo entorno (desde el paso 3 si pasa a DEPURAR y aún no eligió el build).

## 7. Reglas
- Prohibido borrar o resetear la base de datos

- No alteres configuración, funcionalidad, dependencias ni variables de entorno, ni ejecutes paquetes que el proyecto no declare, por iniciativa propia: solo si el usuario lo pidió o lo autorizó.

- No refactorices, renombres, corrijas ni «mejores» código fuera de la corrección autorizada.

- No inventes la causa del bug. Si no está clara, reporta lo que descartaste, lo que falta por descartar y por qué no encontraste el bug.

- Las operaciones criticas requieren preguntar antes de ejecutar. Esto incluye:
  - Borrar o vaciar tablas.

  - Eliminar una entidad cuya tabla borraría la sincronización automática.

  - Leer está permitido: las peticiones con métodos que no mutan (GET, HEAD, OPTIONS) se ejecutan sin preguntar. Antes de cada petición con un método que muta (POST, PUT, PATCH, DELETE), también las del flujo que el usuario pidió, pregunta al usuario mostrando su método, ruta y body (con la contraseña redactada); solo el login de la sección 3 queda exento. Si es un lote de la misma petición (mismo método y ruta) con distintos datos, como un insert masivo, haz una sola pregunta con el método, la ruta, un body de ejemplo y cuántas veces se va a ejecutar.

  - Crear, actualizar o borrar datos directamente en la base de datos

  - Cambiar esquemas o relaciones (entidades, modelos, columnas o índices)

  - Generar, aplicar o revertir migraciones