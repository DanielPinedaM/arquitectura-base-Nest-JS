---
name: database-normalization
description: 'Normaliza el esquema de base de datos del proyecto aplicando las formas normales (UNF, 1NF, 2NF, 3NF, EKNF, BCNF, 4NF, ETNF, 5NF, DKNF, 6NF) en orden y sin saltar pasos, hasta la forma normal que elija el usuario. Es agnóstica al backend, al lenguaje, al ORM y al motor de base de datos: el stack se deduce leyendo package.json, nunca se asume. Documenta el modelo relacional resultante de cada paso, con sus primary key y foreign key, en un markdown por forma normal, y después aplica la forma normal elegida al schema del ORM. MODIFICA EL ESQUEMA DE BASE DE DATOS.'
when_to_use: 'Frases típicas que la disparan - "normaliza la base de datos", "normalizar el esquema", "lleva la base de datos a 3NF", "aplica formas normales", "hay datos redundantes en las tablas", "esta tabla tiene columnas repetidas", "quita la redundancia del modelo", "revisa las dependencias funcionales de las entidades", "el modelo relacional está mal diseñado".'
allowed-tools: Read, Write, Edit, Grep, Glob, AskUserQuestion
---

# Normalización de base de datos

Lleva el esquema de base de datos del proyecto hasta la forma normal que el usuario elija, ejecutando cada forma normal previa en orden y documentando el modelo relacional que resulta de cada paso.

## Stack del proyecto

```!
cat package.json 2>/dev/null || echo "SIN package.json"
```

De ese contenido se deducen tres cosas, y solo de ahí: el **lenguaje de programación**, el **framework** y el **ORM**. Repórtalos antes de tocar nada.

Esta skill es agnóstica: **PROHIBIDO** asumir un ORM, un framework, un motor de base de datos o un lenguaje que no esté declarado ahí. Si el bloque de arriba dice `SIN package.json`, si no aparece ningún ORM, o si aparece más de uno, aplica la sección "Ante ambigüedad, detente y pregunta".

## 1. Mostrar la advertencia — antes de cualquier otra cosa

Lo primero de la primera respuesta, antes de leer archivos, antes de preguntar y antes de editar nada, es imprimir en la terminal esta línea exacta, sin traducirla, sin reformatearla y sin agregarle ni quitarle una palabra:

```
ADVERTENCIA: ESTO PUEDE GENERAR BUGS EN LA BASE DE DATOS
```

Se imprime una sola vez por ejecución de la skill.

## 2. Leer la teoría base — siempre

Leer `.claude/skills/database-normalization/rules/theory.md` **en toda ejecución**, sin importar qué forma normal elija el usuario. Contiene la definición de normalización, las anomalías de inserción, actualización y eliminación, la tabla de restricciones de cada forma normal y el ejemplo completo paso a paso.

## 3. Preguntar hasta qué forma normal normalizar

**El nivel lo elige el usuario, no tú.** Aunque lo haya dicho en la conversación, aunque el proyecto parezca estar ya en 3NF y aunque el nivel parezca evidente, hay que preguntarlo con `AskUserQuestion` y esperar la respuesta.

`AskUserQuestion` admite un máximo de 4 opciones por pregunta, así que la elección se hace en dos preguntas encadenadas.

**Pregunta 1** — `header: "Forma normal"`, pregunta: *¿Hasta qué forma normal se debe normalizar la base de datos? Esto modifica el esquema de base de datos.*

| Opción | Descripción |
|---|---|
| `1NF – 3NF` | Normalización básica. 3NF es lo que la industria considera "normalizado" y elimina la mayoría de anomalías. |
| `EKNF – BCNF` | Claves candidatas solapadas. Elimina toda redundancia por dependencias funcionales. |
| `4NF – 5NF` | Dependencias multivaluadas y de join. Poco frecuente fuera de modelos con hechos independientes. |
| `DKNF – 6NF` | Interés mayormente académico. 6NF explota el número de tablas y no se recomienda en OLTP. |

**Pregunta 2** — solo sobre el rango elegido:

| Rango elegido | `header` | Opciones |
|---|---|---|
| `1NF – 3NF` | `Nivel 1-3` | `1NF`, `2NF`, `3NF` |
| `EKNF – BCNF` | `Nivel EK-BC` | `EKNF`, `BCNF` |
| `4NF – 5NF` | `Nivel 4-5` | `4NF`, `ETNF`, `5NF` |
| `DKNF – 6NF` | `Nivel DK-6` | `DKNF`, `6NF` |

Cada opción lleva en su `description` la consecuencia real de elegirla: cuántas tablas nuevas aparecen aproximadamente y qué tipo de redundancia elimina.

La respuesta a la pregunta 2 es la **forma normal objetivo**. Todo lo que sigue depende de ella.

## 4. Orden de ejecución — sin saltar pasos

La normalización es progresiva: no se alcanza un nivel sin haber satisfecho los previos. Este es el orden, y es el único orden válido:

| # | Sigla | Nombre |
|---|---|---|
| 0 | UNF | Unnormalized form |
| 1 | 1NF | First normal form |
| 2 | 2NF | Second normal form |
| 3 | 3NF | Third normal form |
| 4 | EKNF | Elementary key normal form |
| 5 | BCNF | Boyce–Codd normal form |
| 6 | 4NF | Fourth normal form |
| 7 | ETNF | Essential tuple normal form |
| 8 | 5NF | Fifth normal form |
| 9 | DKNF | Domain-key normal form |
| 10 | 6NF | Sixth normal form |

Reglas del recorrido:

1. Se empieza siempre en **UNF**, que es la línea base: el modelo relacional tal como está hoy en el schema del ORM, sin ningún cambio aplicado.
2. Se avanza una forma normal a la vez, en el orden de la tabla.
3. **PROHIBIDO saltar pasos**, incluso si el esquema ya cumple una forma normal intermedia. En ese caso el paso se ejecuta igual y su markdown documenta que el modelo relacional no cambió respecto del paso anterior.
4. El recorrido **se detiene exactamente en la forma normal objetivo**. Las formas normales posteriores no se ejecutan, no se documentan y su teoría no se lee.

## 5. Leer solo la teoría de las formas normales que se ejecutan

Cada archivo de `.claude/skills/database-normalization/rules/` contiene la teoría de una forma normal: su definición formal, un diseño que la viola y un diseño que la cumple.

Antes de ejecutar el paso de una forma normal, leer su archivo de teoría:

```
.claude/skills/database-normalization/rules/UNF.md
.claude/skills/database-normalization/rules/1NF.md
.claude/skills/database-normalization/rules/2NF.md
.claude/skills/database-normalization/rules/3NF.md
.claude/skills/database-normalization/rules/EKNF.md
.claude/skills/database-normalization/rules/BCNF.md
.claude/skills/database-normalization/rules/4NF.md
.claude/skills/database-normalization/rules/ETNF.md
.claude/skills/database-normalization/rules/5NF.md
.claude/skills/database-normalization/rules/DKNF.md
.claude/skills/database-normalization/rules/6NF.md
```

**Solo se leen los archivos de las formas normales que se ejecutan.** Si el objetivo es `3NF`, se leen `theory.md`, `UNF.md`, `1NF.md`, `2NF.md` y `3NF.md`, y **no se lee ninguno de los otros seis**: ni `EKNF.md`, ni `BCNF.md`, ni `4NF.md`, ni `ETNF.md`, ni `5NF.md`, ni `DKNF.md`, ni `6NF.md`.

## 6. Documentar el modelo relacional de cada paso

Por cada forma normal ejecutada se crea un markdown propio en `.claude/skills/database-normalization/result/`, nombrado con la sigla de la forma normal:

```
.claude/skills/database-normalization/result/UNF.md
.claude/skills/database-normalization/result/1NF.md
.claude/skills/database-normalization/result/2NF.md
.claude/skills/database-normalization/result/3NF.md
.claude/skills/database-normalization/result/EKNF.md
.claude/skills/database-normalization/result/BCNF.md
.claude/skills/database-normalization/result/4NF.md
.claude/skills/database-normalization/result/ETNF.md
.claude/skills/database-normalization/result/5NF.md
.claude/skills/database-normalization/result/DKNF.md
.claude/skills/database-normalization/result/6NF.md
```

### Dos familias de archivos con el mismo nombre — no confundirlas

| Ruta | Qué contiene | Quién la escribe |
|---|---|---|
| `.claude/skills/database-normalization/rules/<SIGLA>.md` | La **teoría** de esa forma normal. Es material de referencia fijo. | Nadie: **solo se lee, nunca se modifica** |
| `.claude/skills/database-normalization/result/<SIGLA>.md` | El **modelo relacional** del proyecto en ese paso. | La skill, en cada ejecución |

### Contenido del markdown de cada paso

**Cada uno de estos markdown contiene únicamente el Modelo Relacional con sus primary key y foreign key.** Nada más: sin teoría, sin explicación de qué es la forma normal, sin justificaciones, sin código del ORM, sin datos de ejemplo, sin diagramas, sin secciones de "notas" o "próximos pasos".

Formato, una entrada por relación:

```
# <SIGLA>

NombreRelacion(atributo1, atributo2, atributo3)
PK: {atributo1}
FK: {atributo3} → OtraRelacion(atributo1)
```

Reglas del formato:

- Los nombres de relaciones y atributos son los del schema del ORM, en inglés, tal como quedan en ese paso.
- `PK:` va siempre, una sola línea por relación. Si la primary key es compuesta, se listan sus atributos: `PK: {atributo1, atributo2}`.
- `FK:` va una línea por cada foreign key. Si la relación no tiene ninguna, se omite la línea.
- Las relaciones se listan en orden alfabético.
- Si el paso no cambió nada respecto del paso anterior, el archivo se escribe igual, con el modelo relacional completo, y se agrega como primera línea después del título: `Sin cambios respecto de <SIGLA_ANTERIOR>.`

## 7. Aplicar la forma normal objetivo al schema

Los markdown de los pasos son el diseño. La normalización se aplica de verdad sobre el **schema de base de datos del ORM detectado en `package.json`**: es ahí donde las relaciones se crean, se dividen y se enlazan.

1. El estado final que se aplica es el del markdown de la **forma normal objetivo**, no el de un paso intermedio.
2. Los cambios se hacen con la sintaxis del ORM que declara `package.json`: sus definiciones de relación, sus primary key y sus foreign key. No se escribe SQL a mano si el ORM tiene forma de expresarlo.
3. Si el proyecto maneja migrations, se genera la migration correspondiente con el mecanismo del propio proyecto. **Ejecutarla contra una base de datos requiere autorización explícita del usuario en esa misma respuesta**; sin esa autorización, la migration se deja generada y sin aplicar.
4. El código que consume las relaciones modificadas (queries, repositories, services) queda coherente con el nuevo esquema. Una relación dividida en dos sin actualizar sus consumidores es un bug, y es exactamente el bug que anuncia la advertencia del paso 1.
5. Al terminar, reportar: forma normal alcanzada, relaciones creadas, relaciones modificadas, foreign keys nuevas y archivos del proyecto tocados.

## Ante ambigüedad, detente y pregunta — nunca asumas

Esta regla se ejecuta **siempre**, aplica en cualquier paso del procedimiento.

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

Las dependencias funcionales y multivaluadas no se deducen de los nombres de las columnas: se deducen de las reglas de negocio. Cuando una dependencia no esté respaldada por una restricción visible en el schema, pregúntala.
