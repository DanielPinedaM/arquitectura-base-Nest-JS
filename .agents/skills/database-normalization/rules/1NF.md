# 1NF — First normal form (primera forma normal)

## Definición

La primera forma normal (1NF) es el nivel más básico de normalización de bases de datos. Se dice que una relación (o una tabla, en SQL) está en primera forma normal si cada campo es atómico, es decir, contiene un solo valor en lugar de un conjunto de valores o una tabla anidada. En otras palabras, una relación cumple la primera forma normal si ningún dominio de atributo (el conjunto de valores permitidos en una columna dada) tiene relaciones como elementos.

La mayoría de los sistemas gestores de bases de datos relacionales no admiten crear ni usar columnas cuyo valor sea una tabla, lo que significa que la mayoría de las bases de datos relacionales estarán en primera forma normal por necesidad. Fuera de ese caso, la normalización a 1NF consiste en eliminar las relaciones anidadas dividiéndolas en relaciones separadas asociadas entre sí mediante foreign keys. Este proceso es un paso necesario al mover datos de una base de datos no relacional (o NoSQL), como una que use un modelo jerárquico u orientado a documentos, a una base de datos relacional.

Una base de datos debe satisfacer 1NF para poder satisfacer las formas normales siguientes, como 2NF y 3NF, que permiten reducir la redundancia y las anomalías. Otros beneficios de adoptar 1NF incluyen mayor independencia y flexibilidad de los datos (incluyendo capacidades como las relaciones muchos a muchos) y la simplificación del álgebra relacional y del lenguaje de consulta necesarios para describir operaciones sobre la base de datos.

1NF es obligatoria para las bases de datos relacionales, mientras que las demás formas normales son guías de diseño.

## Por qué 1NF elimina las relaciones anidadas

El modelo relacional es una mejora sobre las bases de datos jerárquicas. Una diferencia clave está en cómo se representan las relaciones entre registros. En una base de datos jerárquica, las relaciones uno a muchos se representan por contención: un solo registro puede contener conjuntos de registros (conocidos como grupos repetidos) como valores de atributo. Pero la jerarquía no es lo bastante flexible ni expresiva para modelos de datos más complejos. Por ejemplo, las relaciones muchos a muchos no se pueden representar mediante jerarquía. Por eso el modelo relacional elimina los registros anidados y representa la relación mediante foreign keys. Esto permite expresar relaciones más ricas, ya que un registro puede participar en varias relaciones.

Una traducción directa de una base de datos jerárquica a relaciones representaría los grupos repetidos como relaciones anidadas. Así, la normalización se define como eliminar las relaciones anidadas y representar en su lugar la relación uno a muchos mediante foreign keys.

El modelo relacional distingue entre datos "atómicos" y "compuestos". Los datos atómicos (o "no descomponibles") incluyen tipos básicos como números y cadenas: en términos generales, "no pueden descomponerse en piezas más pequeñas por el DBMS (excluyendo ciertas funciones especiales)". Los datos compuestos están formados por estructuras como relaciones (o tablas, en SQL) que contienen varias piezas de datos atómicos y por lo tanto "pueden ser descompuestos por el DBMS".

En una relación, cada atributo (o columna) tiene un conjunto de valores permitidos conocido como su dominio (por ejemplo, el dominio de un atributo `Price` puede ser el conjunto de números no negativos con hasta 2 dígitos decimales). Cada tupla (o fila) de la relación contiene un valor por atributo, y cada uno debe ser un elemento de ese dominio. Se distingue entre atributos con "dominios simples", que contienen solo datos atómicos, y atributos con "dominios no simples", que contienen al menos alguna forma de dato compuesto. Los dominios no simples introducen un grado de complejidad estructural difícil de navegar, consultar y actualizar; por ejemplo, resultará costoso operar a través de varias relaciones anidadas (es decir, tablas que contienen otras tablas), como se encuentran en algunas bases de datos no relacionales.

La primera forma normal exige, por tanto, que todos los dominios de atributos sean dominios simples, de modo que el dato de cada campo sea atómico y ninguna relación tenga atributos cuyo valor sea una relación. En el modelo relacional se requiere que los valores de los dominios sobre los que se define cada relación sean atómicos respecto al DBMS. La normalización a 1NF es entonces un proceso de eliminar dominios no simples de todas las relaciones.

## Ejemplos

### Diseño que viola 1NF

Esta tabla de transacciones de tarjeta de crédito de clientes no cumple la primera forma normal, ya que cada cliente corresponde a un grupo repetido de transacciones. Un diseño así puede representarse en una base de datos jerárquica, pero no en una base de datos SQL, porque SQL no admite tablas anidadas.

**Customer**

| CustomerID | Name | Transactions |
|---|---|---|
| 1 | Abraham | `[{TransactionID: 12890, Date: 2003-10-14, Amount: −87}, {TransactionID: 12904, Date: 2003-10-15, Amount: −50}]` |
| 2 | Isaac | `[{TransactionID: 12898, Date: 2003-10-14, Amount: −21}]` |
| 3 | Jacob | `[{TransactionID: 12907, Date: 2003-10-15, Amount: −18}, {TransactionID: 14920, Date: 2003-11-20, Amount: −70}, {TransactionID: 15003, Date: 2003-11-27, Amount: −60}]` |

La evaluación de cualquier consulta relativa a las transacciones de los clientes implicaría, a grandes rasgos, dos etapas:

1. Desempaquetar los grupos de transacciones de uno o más clientes, permitiendo examinar las transacciones individuales de un grupo.
2. Derivar el resultado de la consulta a partir de los resultados de la primera etapa.

Por ejemplo, para averiguar la suma monetaria de todas las transacciones ocurridas en octubre de 2003 para todos los clientes, el DBMS tendría primero que desempaquetar el campo `Transactions` de cada cliente y luego sumar el `Amount` de cada transacción así obtenida cuya `Date` caiga en octubre de 2003.

### Diseño que cumple 1NF

Una base de datos así puede hacerse estructuralmente menos compleja y más flexible transformándola en una base de datos relacional en primera forma normal. Para normalizar la tabla de forma que cumpla la primera forma normal, los atributos con dominios no simples deben extraerse a relaciones separadas e independientes. Cada relación extraída gana una foreign key que referencia la primary key de la relación que originalmente la contenía. Este proceso puede aplicarse recursivamente a dominios no simples anidados en varios niveles (es decir, dominios que contienen tablas dentro de tablas dentro de tablas, y así sucesivamente).

En este ejemplo, `CustomerID` es la primary key de la relación contenedora y por lo tanto se añadirá como foreign key a la nueva relación:

**Customer**

| CustomerID | Name |
|---|---|
| 1 | Abraham |
| 2 | Isaac |
| 3 | Jacob |

**Transaction**

| CustomerID | TransactionID | Date | Amount |
|---|---|---|---|
| 1 | 12890 | 2003-10-14 | −87 |
| 1 | 12904 | 2003-10-15 | −50 |
| 2 | 12898 | 2003-10-14 | −21 |
| 3 | 12907 | 2003-10-15 | −18 |
| 3 | 14920 | 2003-11-20 | −70 |
| 3 | 15003 | 2003-11-27 | −60 |

En este diseño modificado, la primary key es `{CustomerID}` en la primera relación y `{CustomerID, TransactionID}` en la segunda.

Ahora que una única relación de "nivel superior" contiene todas las transacciones, será más simple ejecutar consultas sobre la base de datos. Para encontrar la suma monetaria de todas las transacciones de octubre, el DBMS simplemente encuentra todas las filas con una `Date` que caiga en octubre y suma los campos `Amount`. Todos los valores quedan ahora fácilmente expuestos al DBMS, mientras que antes algunos valores estaban embebidos en estructuras de nivel inferior que había que tratar de forma especial. En consecuencia, el diseño normalizado se presta bien al procesamiento de consultas de propósito general, cosa que el diseño no normalizado no hace.

Vale la pena notar que el diseño revisado también cumple los requisitos adicionales de la segunda y tercera forma normal.

## Fundamento

La normalización a 1NF es el componente teórico principal al trasladar una base de datos al modelo relacional. El uso de una base de datos relacional en 1NF trae ciertas ventajas:

- Permite almacenar los datos en arreglos bidimensionales regulares; admitir relaciones anidadas requeriría estructuras de datos más complejas.
- Permite el uso de un lenguaje de consulta más simple, como SQL, ya que cualquier ítem de datos puede identificarse usando solo el nombre de la relación, el nombre del atributo y la clave; direccionar ítems de datos anidados requeriría un lenguaje más complejo con soporte para rutas de datos jerárquicas.
- Representar relaciones mediante foreign keys es más flexible y admite capacidades como las relaciones muchos a muchos, mientras que un modelo jerárquico solo puede representar relaciones uno a uno o uno a muchos.
- Como localizar ítems de datos no está acoplado a una jerarquía padre–hijo, una base de datos en 1NF crea mayor independencia de datos y es más resistente a cambios estructurales a lo largo del tiempo.
- Desde 1NF se hace posible seguir normalizando (por ejemplo a 2NF o 3NF), lo que puede reducir la redundancia y las anomalías.

## Controversia sobre los valores compuestos

Hay cierta discusión sobre hasta qué punto se permiten en 1NF valores compuestos o complejos distintos de las relaciones (como arrays o datos XML). Las relaciones son el único tipo de dato compuesto permitido dentro del modelo relacional (si no en los dominios de atributos), ya que cualquier tipo adicional de dato compuesto añadiría complejidad sin añadir potencia; no obstante, el modelo permite específicamente "ciertas funciones especiales" como `SUBSTRING` para descomponer valores que de otro modo se considerarían atómicos.

Se ha señalado que el concepto de "valor atómico" es ambiguo, y que esa ambigüedad ha llevado a una confusión generalizada sobre cómo debe entenderse 1NF. En particular, la noción de valor atómico como "valor que no puede descomponerse" es problemática, pues parecería implicar que pocos tipos de datos, si es que alguno, son atómicos:

- Una cadena parecería no ser atómica, ya que un RDBMS típicamente ofrece operadores para descomponerla en subcadenas.
- Un número de punto fijo parecería no ser atómico, ya que un RDBMS típicamente ofrece operadores para descomponerlo en parte entera y parte fraccionaria.
- Un ISBN parecería no ser atómico, ya que incluye varias partes, entre ellas el grupo de registro, el registrante y los elementos de publicación.

La noción de atomicidad no tiene significado absoluto: un valor puede considerarse atómico para ciertos propósitos, pero puede considerarse un ensamblaje de elementos más básicos para otros. Si se acepta esta posición, 1NF no puede definirse en referencia a la atomicidad. Columnas que contienen cualquier tipo de dato concebible (desde cadenas y tipos numéricos hasta arrays y tablas) resultan entonces aceptables en una tabla 1NF, aunque quizá no siempre deseables; por ejemplo, puede ser deseable separar una columna `CustomerName` en dos columnas, `FirstName` y `Surname`.

## Definición alternativa de 1NF

Según una definición alternativa, una tabla está en primera forma normal si y solo si es "isomorfa a alguna relación", lo que significa concretamente que satisface las siguientes cinco condiciones:

1. No hay un orden específico de arriba a abajo de las filas.
2. No hay un orden específico de izquierda a derecha de las columnas.
3. No hay filas duplicadas.
4. Cada campo (o intersección de una fila y una columna) contiene exactamente un valor del dominio aplicable y nada más.
5. Todas las columnas son regulares (es decir, las filas no tienen componentes ocultos como row IDs, object IDs o timestamps ocultos).

Violar cualquiera de estas condiciones significaría que la tabla no es estrictamente relacional y, por lo tanto, que no está en primera forma normal.

Esta definición de 1NF permite atributos cuyo valor es una relación (tablas dentro de tablas), que resultan útiles en casos raros. Ejemplos de tablas (o vistas) que no cumplirían esta definición de primera forma normal son:

- Una tabla que carece de una restricción de clave única. Una tabla así podría admitir filas duplicadas, violando la condición 3.
- Una vista cuya definición obliga a devolver los resultados en un orden particular, de forma que el orden de las filas es un aspecto intrínseco y significativo de la vista, violando la condición 1. Las tuplas de las relaciones verdaderas no están ordenadas entre sí.
- Una tabla con al menos un atributo que admite `null`. Un atributo nullable violaría la condición 4, que exige que cada columna contenga exactamente un valor de su dominio. Este aspecto de la condición 4 es controvertido; marca una separación importante respecto de la versión del modelo relacional que sí contempla explícitamente los nulls.
