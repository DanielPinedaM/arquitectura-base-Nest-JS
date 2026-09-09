# BCNF — Boyce–Codd normal form (forma normal de Boyce–Codd)

## Definición

La forma normal de Boyce–Codd (BCNF o 3.5NF) es una forma normal usada en la normalización de bases de datos. Es una versión ligeramente más estricta de la tercera forma normal (3NF). Al usar BCNF, una base de datos elimina todas las redundancias basadas en dependencias funcionales.

## Historia

Edgar F. Codd publicó su artículo original "A Relational Model of Data for Large Shared Databanks" en junio de 1970. Fue la primera vez que se publicó la noción de base de datos relacional. Todo el trabajo posterior, incluido el método de la forma normal de Boyce–Codd, se basó en ese modelo relacional.

La forma normal de Boyce–Codd fue descrita por primera vez por Ian Heath en 1971, y Chris Date también la ha llamado forma normal de Heath.

BCNF fue desarrollada formalmente en 1974 por Raymond F. Boyce y Edgar F. Codd para abordar ciertos tipos de anomalías que 3NF, tal como se definió originalmente, no trataba.

Chris Date ha señalado que una definición de lo que hoy conocemos como BCNF apareció en un artículo de Ian Heath en 1971. Date escribe:

> Dado que esa definición precedió en unos tres años a la propia definición de Boyce y Codd, me parece que BCNF debería llamarse por derecho forma normal de Heath. Pero no es así.

## Definición formal

Si un esquema relacional está en BCNF, entonces toda la redundancia basada en dependencias funcionales ha sido eliminada, aunque pueden seguir existiendo otros tipos de redundancia. Un esquema relacional R está en forma normal de Boyce–Codd si y solo si, para cada una de sus dependencias funcionales X → Y, se cumple al menos una de las siguientes condiciones:

- X → Y es una dependencia funcional trivial (Y ⊆ X),
- X es una superclave del esquema R.

Si un esquema relacional está en BCNF, entonces está automáticamente también en 3NF, porque BCNF es una forma más estricta de 3NF. Aunque todas las relaciones en BCNF satisfacen las condiciones de 3NF, no todas las relaciones en 3NF satisfacen los requisitos más estrictos de BCNF, que elimina toda la redundancia causada por dependencias funcionales.

## Relación con las tablas en 3NF

Solo en casos raros una tabla en 3NF no cumple los requisitos de BCNF. Una tabla en 3NF que no tiene varias claves candidatas solapadas está garantizada en BCNF. Dependiendo de cuáles sean sus dependencias funcionales, una tabla en 3NF con dos o más claves candidatas solapadas puede o no estar en BCNF.

Un ejemplo de tabla en 3NF que no cumple BCNF es:

**Today's court bookings**

| Court | Start time | End time | Rate type |
|---|---|---|---|
| 1 | 09:30 | 10:30 | SAVER |
| 1 | 11:00 | 12:00 | SAVER |
| 1 | 14:00 | 15:30 | STANDARD |
| 2 | 10:00 | 11:30 | PREMIUM-B |
| 2 | 11:30 | 13:30 | PREMIUM-B |
| 2 | 15:00 | 16:30 | PREMIUM-A |

- Cada fila de la tabla representa una reserva de cancha en un club de tenis. Ese club tiene una cancha dura (`Court 1`) y una cancha de césped (`Court 2`).
- Una reserva se define por su `Court` y el período durante el cual la cancha está reservada.
- Además, cada reserva tiene un `Rate Type` asociado. Hay cuatro tipos de tarifa distintos:
  - `SAVER`, para reservas de `Court 1` hechas por socios.
  - `STANDARD`, para reservas de `Court 1` hechas por no socios.
  - `PREMIUM-A`, para reservas de `Court 2` hechas por socios.
  - `PREMIUM-B`, para reservas de `Court 2` hechas por no socios.

Las superclaves de la tabla son:

- S1 = `{Court, Start time}`
- S2 = `{Court, End time}`
- S3 = `{Rate type, Start time}`
- S4 = `{Rate type, End time}`
- S5 = `{Court, Start time, End time}`
- S6 = `{Rate type, Start time, End time}`
- S7 = `{Court, Rate type, Start time}`
- S8 = `{Court, Rate type, End time}`
- ST = `{Court, Rate type, Start time, End time}`, la superclave trivial

Nótese que, aunque en la tabla anterior los atributos `Start time` y `End time` no tienen valores duplicados, hay que admitir que en otros días dos reservas distintas en `Court 1` y `Court 2` podrían empezar a la misma hora o terminar a la misma hora. Por eso `{Start time}` y `{End time}` no pueden considerarse superclaves de la tabla.

Las claves candidatas de la tabla son S1, S2, S3 y S4. Solo esas son claves candidatas (es decir, superclaves mínimas para esa relación) porque, por ejemplo, S1 ⊂ S5, así que S5 no puede ser clave candidata.

Dado que 2NF prohíbe las dependencias funcionales parciales de atributos no primos, y que 3NF prohíbe las dependencias funcionales transitivas de atributos no primos respecto de claves candidatas: en la tabla `Today's court bookings` no hay atributos no primos, es decir, todos los atributos pertenecen a alguna clave candidata. Por lo tanto la tabla cumple tanto 2NF como 3NF.

La tabla no cumple BCNF. Esto se debe a la dependencia `Rate type → Court`, en la que el atributo determinante es `Rate type`, del cual depende `Court`. Nótese que (1) `{Rate type}` no es una superclave y (2) `{Court}` no es un subconjunto de `{Rate type}`. La dependencia `Rate type → Court` se respeta, dado que un `Rate type` solo debería aplicar a una única cancha.

El diseño puede corregirse para que cumpla BCNF:

**Rate types**

| Rate type | Court | Member flag |
|---|---|---|
| SAVER | 1 | Yes |
| STANDARD | 1 | No |
| PREMIUM-A | 2 | Yes |
| PREMIUM-B | 2 | No |

**Today's bookings**

| Court | Start time | End time | Member flag |
|---|---|---|---|
| 1 | 09:30 | 10:30 | Yes |
| 1 | 11:00 | 12:00 | Yes |
| 1 | 14:00 | 15:30 | No |
| 2 | 10:00 | 11:30 | No |
| 2 | 11:30 | 13:30 | No |
| 2 | 15:00 | 16:30 | Yes |

Las claves candidatas de `Rate types` son `{Rate type}` y `{Court, Member flag}`; las de `Today's bookings` son `{Court, Start time}` y `{Court, End time}`. Ambas tablas están en BCNF. Cuando `{Rate type}` es clave en `Rate types`, es imposible que un `Rate type` esté asociado a dos canchas distintas, de modo que usar `{Rate type}` como clave elimina la anomalía que afectaba a la tabla original.

## Alcanzabilidad de BCNF

En algunos casos, una tabla que no está en BCNF no puede descomponerse en tablas que satisfagan BCNF y a la vez preserven las dependencias que se cumplían en la tabla original. Beeri y Bernstein mostraron en 1979 que, por ejemplo, un conjunto de dependencias funcionales `{AB → C, C → B}` no puede representarse mediante un esquema BCNF.

Considérese la siguiente tabla, que no está en BCNF, cuyas dependencias funcionales siguen el patrón `{AB → C, C → B}`:

**Nearest shops**

| Person | Shop type | Nearest shop |
|---|---|---|
| Davidson | Optician | Eagle Eye |
| Davidson | Hairdresser | Snippets |
| Wright | Bookshop | Merlin Books |
| Fuller | Bakery | Doughy's |
| Fuller | Hairdresser | Sweeney Todd's |
| Fuller | Optician | Eagle Eye |

Para cada combinación `Person / Shop type`, la tabla indica qué tienda de ese tipo está geográficamente más cerca del domicilio de la persona. Se asume, por simplicidad, que una misma tienda no puede ser de más de un tipo.

Las claves candidatas de la tabla son `{Person, Shop type}` y `{Person, Nearest shop}`. Como los tres atributos son atributos primos (pertenecen a claves candidatas), la tabla está en 3NF. Sin embargo, la tabla no está en BCNF, ya que el atributo `Shop type` depende funcionalmente de un atributo que no es superclave: `Nearest shop`.

La violación de BCNF significa que la tabla está sujeta a anomalías. Por ejemplo, `Eagle Eye` podría cambiar su `Shop type` a "Optometrist" en el registro de `Fuller` mientras conserva el `Shop type` "Optician" en el registro de `Davidson`. Esto implicaría respuestas contradictorias a la pregunta "¿cuál es el `Shop type` de Eagle Eye?". Almacenar el `Shop type` de cada tienda una sola vez parecería preferible, pues evitaría que ocurrieran esas anomalías:

**Nearest shops by person**

| Person | Shop |
|---|---|
| Davidson | Eagle Eye |
| Davidson | Snippets |
| Wright | Merlin Books |
| Fuller | Doughy's |
| Fuller | Sweeney Todd's |
| Fuller | Eagle Eye |

**Shops**

| Shop | Shop type |
|---|---|
| Eagle Eye | Optician |
| Snippets | Hairdresser |
| Merlin Books | Bookshop |
| Doughy's | Bakery |
| Sweeney Todd's | Hairdresser |

En este diseño revisado, `Nearest shops by person` tiene la clave candidata `{Person, Shop}` y `Shops` tiene la clave candidata `{Shop}`. Desafortunadamente, aunque este diseño cumple BCNF, es inaceptable por otro motivo: permite registrar varias tiendas del mismo tipo contra la misma persona. Dicho de otro modo, sus claves candidatas no garantizan que se respete la dependencia funcional `{Person, Shop type} → {Shop}`.

Es posible un diseño que elimine todas esas anomalías, aunque no cumpla BCNF. Ese diseño introduce una forma normal nueva, conocida como forma normal de clave elemental (EKNF), y consiste en la tabla `Nearest shops` original complementada con la tabla `Shop` descrita arriba. La estructura de tablas generada por el algoritmo de generación de esquemas de Bernstein es en realidad EKNF, aunque esa mejora sobre 3NF no se había reconocido cuando se diseñó el algoritmo:

**Nearest shops**

| Person | Shop type | Nearest shop |
|---|---|---|
| Davidson | Optician | Eagle Eye |
| Davidson | Hairdresser | Snippets |
| Wright | Bookshop | Merlin Books |
| Fuller | Bakery | Doughy's |
| Fuller | Hairdresser | Sweeney Todd's |
| Fuller | Optician | Eagle Eye |

**Shop**

| Shop | Shop type |
|---|---|
| Eagle Eye | Optician |
| Snippets | Hairdresser |
| Merlin Books | Bookshop |
| Doughy's | Bakery |
| Sweeney Todd's | Hairdresser |

Si se define una restricción de integridad referencial que obligue a que `{Shop type, Nearest shop}` de la primera tabla referencie a un `{Shop type, Shop}` de la segunda tabla, entonces las anomalías de datos descritas antes quedan prevenidas.

## Intratabilidad

Determinar si un esquema de base de datos en tercera forma normal viola la forma normal de Boyce–Codd es NP-completo.

## Descomposición en BCNF

Si una relación R no está en BCNF a causa de una dependencia funcional X → Y, entonces R puede descomponerse en BCNF reemplazando esa relación por dos subrelaciones:

- Una con los atributos X⁺ (el cierre de X),
- y otra con los atributos (R − X⁺) + X. Nótese que R representa todos los atributos de la relación original.

Verificar si ambas subrelaciones están en BCNF y repetir el proceso recursivamente con cualquier subrelación que no lo esté.
