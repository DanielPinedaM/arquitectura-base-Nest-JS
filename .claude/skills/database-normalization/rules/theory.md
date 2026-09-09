# Teoría general de la normalización de bases de datos

La normalización de bases de datos es el proceso de estructurar una base de datos relacional de acuerdo con una serie de formas normales, con el fin de reducir la redundancia de datos y mejorar la integridad de los datos. Fue propuesta por primera vez por el científico de la computación británico Edgar F. Codd como parte de su modelo relacional.

La normalización implica organizar las columnas (atributos) y las tablas (relaciones) de una base de datos para asegurar que sus dependencias queden correctamente forzadas por las restricciones de integridad de la base de datos. Se logra aplicando reglas formales, ya sea mediante un proceso de síntesis (crear un diseño de base de datos nuevo) o de descomposición (mejorar un diseño de base de datos existente).

## Objetivos

Un objetivo básico de la primera forma normal, definida por Codd en 1970, era permitir que los datos se consultaran y manipularan usando un "sublenguaje de datos universal" fundamentado en la lógica de primer orden. Un ejemplo de tal lenguaje es SQL, aunque Codd lo consideraba seriamente defectuoso.

Los objetivos de la normalización más allá de 1NF (primera forma normal) fueron enunciados por Codd así:

> Liberar la colección de relaciones de dependencias indeseables de inserción, actualización y eliminación.
>
> Reducir la necesidad de reestructurar la colección de relaciones a medida que se introducen nuevos tipos de datos, y así aumentar el tiempo de vida de los programas de aplicación.
>
> Hacer el modelo relacional más informativo para los usuarios.
>
> Hacer la colección de relaciones neutral respecto a las estadísticas de consulta, dado que esas estadísticas son susceptibles de cambiar con el tiempo.
>
> — E. F. Codd, "Further Normalisation of the Data Base Relational Model"

## Anomalías

Cuando se intenta modificar (actualizar, insertar o eliminar) una relación, pueden surgir los siguientes efectos secundarios indeseables en relaciones que no han sido suficientemente normalizadas:

### Anomalía de inserción

Hay circunstancias en las que ciertos hechos no se pueden registrar en absoluto. Por ejemplo, cada registro de una relación "Profesores y sus cursos" podría contener un ID de profesor, nombre del profesor, fecha de contratación del profesor y código del curso. Por lo tanto se pueden registrar los datos de cualquier profesor que dicte al menos un curso, pero un profesor recién contratado que todavía no tiene cursos asignados no puede registrarse, salvo poniendo el código de curso en `null`.

### Anomalía de actualización

La misma información puede quedar expresada en varias filas; por lo tanto, las actualizaciones sobre la relación pueden producir inconsistencias lógicas. Por ejemplo, cada registro de una relación "Habilidades de empleados" podría contener un ID de empleado, la dirección del empleado y una habilidad; así, un cambio de dirección de un empleado tendría que aplicarse a varios registros (uno por cada habilidad). Si la actualización solo tiene éxito parcialmente —la dirección del empleado se actualiza en algunos registros pero no en otros—, la relación queda en un estado inconsistente. Concretamente, la relación da respuestas contradictorias a la pregunta de cuál es la dirección de ese empleado.

### Anomalía de eliminación

Bajo ciertas circunstancias, eliminar los datos que representan ciertos hechos obliga a eliminar datos que representan hechos completamente distintos. La relación "Profesores y sus cursos" descrita antes sufre este tipo de anomalía: si un profesor deja temporalmente de tener cursos asignados, hay que eliminar el último de los registros en los que aparece, con lo cual se elimina también al profesor, salvo que el campo de código de curso se ponga en `null`.

## Minimizar el rediseño al extender la estructura

Una base de datos completamente normalizada puede extenderse para admitir nuevos tipos de datos con cambios mínimos en su estructura existente. Como resultado, las aplicaciones que interactúan con la base de datos se ven afectadas lo mínimo posible.

Las relaciones normalizadas, y las relaciones entre ellas, reflejan los conceptos del mundo real y sus interrelaciones.

## Formas normales

Codd introdujo el concepto de normalización y lo que hoy se conoce como primera forma normal (1NF) en 1970. Después definió la segunda forma normal (2NF) y la tercera forma normal (3NF) en 1971, y junto con Raymond F. Boyce definió la forma normal de Boyce–Codd (BCNF) en 1974.

Ronald Fagin introdujo la cuarta forma normal (4NF) en 1977 y la quinta forma normal (5NF) en 1979. Christopher J. Date introdujo la sexta forma normal (6NF) en 2003.

De manera informal, se suele decir que una relación de una base de datos relacional está "normalizada" si cumple la tercera forma normal. La mayoría de las relaciones en 3NF están libres de anomalías de inserción, actualización y eliminación.

Las formas normales, de menos normalizada a más normalizada, son:

| Sigla | Nombre | Año |
|---|---|---|
| UNF | Unnormalized form | 1970 |
| 1NF | First normal form | 1970 |
| 2NF | Second normal form | 1971 |
| 3NF | Third normal form | 1971 |
| EKNF | Elementary key normal form | 1982 |
| BCNF | Boyce–Codd normal form | 1974 |
| 4NF | Fourth normal form | 1977 |
| ETNF | Essential tuple normal form | 2012 |
| 5NF | Fifth normal form | 1979 |
| DKNF | Domain-key normal form | 1981 |
| 6NF | Sixth normal form | 2003 |

## Restricciones que cumple cada forma normal

`Sí` = la forma normal exige la restricción. `No` = no la exige. `Quizá` = puede cumplirse o no. `N/A` = no aplica.

| Restricción (descripción informal entre paréntesis) | UNF | 1NF | 2NF | 3NF | EKNF | BCNF | 4NF | ETNF | 5NF | DKNF | 6NF |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Filas únicas (sin registros duplicados) | Quizá | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| Columnas escalares (las columnas no pueden contener relaciones ni valores compuestos) | No | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| Todo atributo no primo tiene dependencia funcional completa de cada clave candidata (los atributos dependen de la totalidad de cada clave) | No | No | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| Toda dependencia funcional no trivial empieza en una superclave o termina en un atributo primo (los atributos dependen solo de claves candidatas) | No | No | No | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| Toda dependencia funcional no trivial empieza en una superclave o termina en un atributo primo elemental (forma más estricta de 3NF) | No | No | No | No | Sí | Sí | Sí | Sí | Sí | Sí | N/A |
| Toda dependencia funcional no trivial empieza en una superclave (forma más estricta de 3NF) | No | No | No | No | No | Sí | Sí | Sí | Sí | Sí | N/A |
| Toda dependencia multivaluada no trivial empieza en una superclave | No | No | No | No | No | No | Sí | Sí | Sí | Sí | N/A |
| Toda dependencia de join tiene un componente que es superclave | No | No | No | No | No | No | No | Sí | Sí | Sí | N/A |
| Toda dependencia de join tiene únicamente componentes que son superclaves | No | No | No | No | No | No | No | No | Sí | Sí | N/A |
| Toda restricción es consecuencia de restricciones de dominio y de restricciones de clave | No | No | No | No | No | No | No | No | No | Sí | No |
| Toda dependencia de join es trivial | No | No | No | No | No | No | No | No | No | No | Sí |

## El proceso es progresivo

La normalización es una técnica de diseño de bases de datos que se usa para llevar una tabla de una base de datos relacional hasta una forma normal superior. **El proceso es progresivo, y no se puede alcanzar un nivel superior de normalización mientras no se hayan satisfecho los niveles previos.**

Es decir: partiendo de datos en forma no normalizada (la menos normalizada) y aspirando al nivel más alto de normalización, el primer paso es asegurar el cumplimiento de la primera forma normal, el segundo paso asegurar el cumplimiento de la segunda forma normal, y así sucesivamente en el orden mencionado, hasta que los datos cumplan la sexta forma normal.

Sin embargo, las formas normales más allá de 4NF son principalmente de interés académico, porque los problemas que resuelven rara vez aparecen en la práctica.

En la práctica, a menudo es posible omitir algunos de los pasos de normalización porque los datos ya están normalizados en cierta medida. Corregir la violación de una forma normal también corrige, con frecuencia, la violación de una forma normal superior.

## Ejemplo completo, paso a paso

Los datos del siguiente ejemplo fueron diseñados intencionalmente para contradecir la mayoría de las formas normales. En cada paso se eligió una sola tabla para normalizar, lo que significa que al final algunas tablas podrían no quedar suficientemente normalizadas.

### Datos iniciales

Sea una tabla con la siguiente estructura, que describe un libro:

| Title | Author | Author Nationality | Format | Price | Subject | Pages | Thickness | Publisher | Publisher Country | Genre ID | Genre Name |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Beginning MySQL Database Design and Optimization | Chad Russell | American | Hardcover | 49.99 | MySQL, Database, Design | 520 | Thick | Apress | USA | 1 | Tutorial |

Para este ejemplo se asume que cada libro tiene un solo autor.

Una tabla que se ajusta al modelo relacional tiene una primary key que identifica unívocamente una fila. En este ejemplo, la primary key es una clave compuesta `{Title, Format}`.

### Satisfacer 1NF

En la primera forma normal cada campo contiene un solo valor. Un campo no puede contener un conjunto de valores ni un registro anidado. `Subject` contiene un conjunto de valores de materia, así que no cumple. Para resolver el problema, las materias se extraen a una tabla `Subject` aparte:

**Book**

| Title | Author | Author Nationality | Format | Price | Pages | Thickness | Publisher | Publisher Country | Genre ID | Genre Name |
|---|---|---|---|---|---|---|---|---|---|---|
| Beginning MySQL Database Design and Optimization | Chad Russell | American | Hardcover | 49.99 | 520 | Thick | Apress | USA | 1 | Tutorial |

**Title – Subject**

| Title | Subject name |
|---|---|
| Beginning MySQL Database Design and Optimization | MySQL |
| Beginning MySQL Database Design and Optimization | Database |
| Beginning MySQL Database Design and Optimization | Design |

En lugar de una tabla en forma no normalizada, ahora hay dos tablas que cumplen 1NF.

### Satisfacer 2NF

La tabla `Book` tiene una clave compuesta `{Title, Format}`, que no satisface 2NF si algún subconjunto de esa clave es determinante. En este punto del diseño la clave todavía no está fijada como primary key, así que se llama clave candidata.

| Title | Format | Author | Author Nationality | Price | Pages | Thickness | Publisher | Publisher Country | Genre ID | Genre Name |
|---|---|---|---|---|---|---|---|---|---|---|
| Beginning MySQL Database Design and Optimization | Hardcover | Chad Russell | American | 49.99 | 520 | Thick | Apress | USA | 1 | Tutorial |
| Beginning MySQL Database Design and Optimization | E-book | Chad Russell | American | 22.34 | 520 | Thick | Apress | USA | 1 | Tutorial |
| The Relational Model for Database Management: Version 2 | E-book | E.F.Codd | British | 13.88 | 538 | Thick | Addison-Wesley | USA | 2 | Popular science |
| The Relational Model for Database Management: Version 2 | Paperback | E.F.Codd | British | 39.99 | 538 | Thick | Addison-Wesley | USA | 2 | Popular science |

Todos los atributos que no forman parte de la clave candidata dependen de `Title`, pero solo `Price` depende además de `Format`. Para cumplir 2NF y eliminar duplicados, todo atributo que no pertenezca a la clave candidata debe depender de la clave candidata completa, no solo de una parte de ella.

Para normalizar esta tabla se hace de `{Title}` una clave candidata simple (la primary key), de modo que todo atributo ajeno a la clave candidata dependa de la clave candidata completa, y se extrae `Price` a una tabla aparte para preservar su dependencia de `Format`:

**Book**

| Title | Author | Author Nationality | Pages | Thickness | Publisher | Publisher Country | Genre ID | Genre Name |
|---|---|---|---|---|---|---|---|---|
| Beginning MySQL Database Design and Optimization | Chad Russell | American | 520 | Thick | Apress | USA | 1 | Tutorial |
| The Relational Model for Database Management: Version 2 | E.F.Codd | British | 538 | Thick | Addison-Wesley | USA | 2 | Popular science |

**Price**

| Title | Format | Price |
|---|---|---|
| Beginning MySQL Database Design and Optimization | Hardcover | 49.99 |
| Beginning MySQL Database Design and Optimization | E-book | 22.34 |
| The Relational Model for Database Management: Version 2 | E-book | 13.88 |
| The Relational Model for Database Management: Version 2 | Paperback | 39.99 |

Ahora tanto `Book` como `Price` cumplen 2NF.

### Satisfacer 3NF

La tabla `Book` todavía tiene una dependencia funcional transitiva (`{Author Nationality}` depende de `{Author}`, que depende de `{Title}`). Existen violaciones similares para el publisher (`{Publisher Country}` depende de `{Publisher}`, que depende de `{Title}`) y para el género (`{Genre Name}` depende de `{Genre ID}`, que depende de `{Title}`). Por lo tanto, `Book` no está en 3NF. Para resolverlo se colocan `{Author Nationality}`, `{Publisher Country}` y `{Genre Name}` en sus propias tablas, eliminando así las dependencias funcionales transitivas:

**Book**

| Title | Author | Pages | Thickness | Publisher | Genre ID |
|---|---|---|---|---|---|
| Beginning MySQL Database Design and Optimization | Chad Russell | 520 | Thick | Apress | 1 |
| The Relational Model for Database Management: Version 2 | E.F.Codd | 538 | Thick | Addison-Wesley | 2 |

**Author**

| Author | Nationality |
|---|---|
| Chad Russell | American |
| E.F.Codd | British |

**Publisher**

| Publisher | Country |
|---|---|
| Apress | USA |
| Addison-Wesley | USA |

**Genre**

| Genre ID | Name |
|---|---|
| 1 | Tutorial |
| 2 | Popular science |

### Satisfacer EKNF

La forma normal de clave elemental (EKNF) queda estrictamente entre 3NF y BCNF y no se discute mucho en la literatura. Su intención es "capturar las cualidades destacadas tanto de 3NF como de BCNF" evitando los problemas de ambas (a saber, que 3NF es "demasiado indulgente" y BCNF es "propensa a la complejidad computacional"). Como rara vez se menciona en la literatura, no se incluye en este ejemplo.

### Satisfacer 4NF

Supóngase que la base de datos pertenece a una franquicia de venta de libros con varios franquiciados que tienen tiendas en distintas ubicaciones. El minorista decide agregar una tabla con datos sobre la disponibilidad de los libros en distintas ubicaciones:

**Franchisee – Book – Location**

| Franchisee ID | Title | Location |
|---|---|---|
| 1 | Beginning MySQL Database Design and Optimization | California |
| 1 | Beginning MySQL Database Design and Optimization | Florida |
| 1 | Beginning MySQL Database Design and Optimization | Texas |
| 1 | The Relational Model for Database Management: Version 2 | California |
| 1 | The Relational Model for Database Management: Version 2 | Florida |
| 1 | The Relational Model for Database Management: Version 2 | Texas |
| 2 | Beginning MySQL Database Design and Optimization | California |
| 2 | Beginning MySQL Database Design and Optimization | Florida |
| 2 | Beginning MySQL Database Design and Optimization | Texas |
| 2 | The Relational Model for Database Management: Version 2 | California |
| 2 | The Relational Model for Database Management: Version 2 | Florida |
| 2 | The Relational Model for Database Management: Version 2 | Texas |
| 3 | Beginning MySQL Database Design and Optimization | Texas |

Como la estructura de esta tabla consiste en una primary key compuesta, no contiene ningún atributo ajeno a la clave y ya está en BCNF (y por lo tanto también satisface todas las formas normales previas). Sin embargo, asumiendo que todos los libros disponibles se ofrecen en cada área, `Title` no queda ligado inequívocamente a una `Location` determinada y por lo tanto la tabla no satisface 4NF.

Para satisfacer la cuarta forma normal, esta tabla debe descomponerse:

**Franchisee – Book**

| Franchisee ID | Title |
|---|---|
| 1 | Beginning MySQL Database Design and Optimization |
| 1 | The Relational Model for Database Management: Version 2 |
| 2 | Beginning MySQL Database Design and Optimization |
| 2 | The Relational Model for Database Management: Version 2 |
| 3 | Beginning MySQL Database Design and Optimization |

**Franchisee – Location**

| Franchisee ID | Location |
|---|---|
| 1 | California |
| 1 | Florida |
| 1 | Texas |
| 2 | California |
| 2 | Florida |
| 2 | Texas |
| 3 | Texas |

Ahora cada registro queda identificado inequívocamente por una superclave, así que 4NF se satisface.

### Satisfacer ETNF

Supóngase que los franquiciados también pueden pedir libros a distintos proveedores, y que la relación está sujeta a la siguiente restricción:

> Si un proveedor dado suministra un título dado,
> y el título se suministra al franquiciado,
> y el franquiciado es abastecido por el proveedor,
> entonces el proveedor suministra el título a ese franquiciado.

**Supplier – Book – Franchisee**

| Supplier ID | Title | Franchisee ID |
|---|---|---|
| 1 | Beginning MySQL Database Design and Optimization | 1 |
| 2 | The Relational Model for Database Management: Version 2 | 2 |
| 3 | Learning SQL | 3 |

Esta tabla está en 4NF, pero es igual al join de sus proyecciones `{{Supplier ID, Title}, {Title, Franchisee ID}, {Franchisee ID, Supplier ID}}`. Ningún componente de esa dependencia de join es una superclave (la única superclave es el encabezado completo), así que la tabla no satisface ETNF y puede descomponerse más:

**Supplier – Book**

| Supplier ID | Title |
|---|---|
| 1 | Beginning MySQL Database Design and Optimization |
| 2 | The Relational Model for Database Management: Version 2 |
| 3 | Learning SQL |

**Book – Franchisee**

| Title | Franchisee ID |
|---|---|
| Beginning MySQL Database Design and Optimization | 1 |
| The Relational Model for Database Management: Version 2 | 2 |
| Learning SQL | 3 |

**Franchisee – Supplier**

| Supplier ID | Franchisee ID |
|---|---|
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |

La descomposición produce el cumplimiento de ETNF.

### Satisfacer 5NF

Para detectar una tabla que no satisface 5NF, normalmente es necesario examinar los datos a fondo. Tómese la tabla del ejemplo de 4NF con una pequeña modificación en los datos:

**Franchisee – Book – Location**

| Franchisee ID | Title | Location |
|---|---|---|
| 1 | Beginning MySQL Database Design and Optimization | California |
| 1 | Learning SQL | California |
| 1 | The Relational Model for Database Management: Version 2 | Texas |
| 2 | The Relational Model for Database Management: Version 2 | California |

Descomponer esta tabla reduce redundancias y da estas dos tablas:

**Franchisee – Book**

| Franchisee ID | Title |
|---|---|
| 1 | Beginning MySQL Database Design and Optimization |
| 1 | Learning SQL |
| 1 | The Relational Model for Database Management: Version 2 |
| 2 | The Relational Model for Database Management: Version 2 |

**Franchisee – Location**

| Franchisee ID | Location |
|---|---|
| 1 | California |
| 1 | Texas |
| 2 | California |

El join de estas tablas devolvería tres filas más de las que debería. Agregar otra tabla para clarificar la relación da tres tablas separadas: `Franchisee – Book`, `Franchisee – Location` y `Location – Book`. Con esas tres tablas ya no es posible hacer el join, lo que significa que no era posible descomponer `Franchisee – Book – Location` sin pérdida de datos, y por lo tanto la tabla ya satisfacía 5NF.

Los datos anteriores demuestran el principio, pero no se sostienen del todo. En este caso lo mejor sería descomponer con una surrogate key, llamada `Store ID`:

**Store – Book**

| Store ID | Title |
|---|---|
| 1 | Beginning MySQL Database Design and Optimization |
| 1 | Learning SQL |
| 2 | The Relational Model for Database Management: Version 2 |
| 3 | The Relational Model for Database Management: Version 2 |

**Store – Franchisee – Location**

| Store ID | Franchisee ID | Location |
|---|---|---|
| 1 | 1 | California |
| 2 | 1 | Texas |
| 3 | 2 | California |

Ahora el join devuelve el resultado esperado.

C. J. Date ha sostenido que solo una base de datos en 5NF está verdaderamente "normalizada".

### Satisfacer DKNF

Tómese la tabla `Book` de los ejemplos anteriores:

| Title | Pages | Thickness | Genre ID | Publisher ID |
|---|---|---|---|---|
| Beginning MySQL Database Design and Optimization | 520 | Thick | 1 | 1 |
| The Relational Model for Database Management: Version 2 | 538 | Thick | 2 | 2 |
| Learning SQL | 338 | Slim | 1 | 3 |
| SQL Cookbook | 636 | Thick | 1 | 3 |

Lógicamente, `Thickness` está determinado por el número de páginas. Es decir, depende de `Pages`, que no es una clave. Supóngase la convención de que un libro de hasta 350 páginas se considera "slim" y un libro de más de 350 páginas se considera "thick".

Esta convención es técnicamente una restricción, pero no es ni una restricción de dominio ni una restricción de clave; por lo tanto no se puede depender de las restricciones de dominio y de clave para mantener la integridad de los datos. En otras palabras: nada impide poner "Thick" para un libro de solo 50 páginas, y eso hace que la tabla viole DKNF.

Para resolverlo se crea una tabla con la enumeración que define `Thickness` y se elimina esa columna de la tabla original:

**Thickness Enum**

| Thickness | Min pages | Max pages |
|---|---|---|
| Slim | 1 | 350 |
| Thick | 351 | 999,999,999,999 |

**Book – Pages – Genre – Publisher**

| Title | Pages | Genre ID | Publisher ID |
|---|---|---|---|
| Beginning MySQL Database Design and Optimization | 520 | 1 | 1 |
| The Relational Model for Database Management: Version 2 | 538 | 2 | 2 |
| Learning SQL | 338 | 1 | 3 |
| SQL Cookbook | 636 | 1 | 3 |

Así se elimina la violación de integridad de dominio y la tabla queda en DKNF.

La normalización no evita todos los casos de salida imposible, conflictiva o impredecible. En este ejemplo, valores de Min/Max de 1/350 y 200/999,999,999,999 llevarían a resultados impredecibles. Por eso sería mejor especificar y usar solamente `Min pages`.

### Satisfacer 6NF

Una definición simple e intuitiva de la sexta forma normal es que "una tabla está en 6NF cuando la fila contiene la primary key y, como máximo, otro atributo".

Es decir, por ejemplo, la tabla `Publisher` diseñada al crear 1NF:

| Publisher ID | Name | Country |
|---|---|---|
| 1 | Apress | USA |

necesita descomponerse en dos tablas:

**Publisher**

| Publisher ID | Name |
|---|---|
| 1 | Apress |

**Publisher country**

| Publisher ID | Country |
|---|---|
| 1 | USA |

El inconveniente evidente de 6NF es la proliferación de tablas necesarias para representar la información de una sola entidad. Si una tabla en 5NF tiene una columna de primary key y N atributos, representar la misma información en 6NF requerirá N tablas; las actualizaciones de varios campos de un mismo registro conceptual requerirán actualizar varias tablas, e igualmente las inserciones y eliminaciones requerirán operaciones sobre varias tablas. Por esta razón, en bases de datos pensadas para procesamiento transaccional en línea (OLTP) no debería usarse 6NF.

Sin embargo, en data warehouses, que no permiten actualizaciones interactivas y están especializados en consultas rápidas sobre grandes volúmenes de datos, algunos DBMS usan internamente una representación 6NF, conocida como almacenamiento columnar. Cuando el número de valores únicos de una columna es mucho menor que el número de filas de la tabla, el almacenamiento orientado a columnas permite ahorros significativos de espacio mediante compresión de datos. El almacenamiento columnar también permite la ejecución rápida de consultas por rango.

En todos estos casos, sin embargo, el diseñador de la base de datos no tiene que realizar manualmente la normalización a 6NF creando tablas separadas. Algunos DBMS especializados en warehousing usan almacenamiento columnar por defecto, pero el diseñador sigue viendo una única tabla de varias columnas. Otros permiten especificar un índice columnar para una tabla concreta.
