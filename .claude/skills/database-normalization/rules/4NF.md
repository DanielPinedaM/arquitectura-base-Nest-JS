# 4NF — Fourth normal form (cuarta forma normal)

## Definición

La cuarta forma normal (4NF) es una forma normal usada en la normalización de bases de datos. Introducida por Ronald Fagin en 1977, 4NF es el siguiente nivel de normalización después de la forma normal de Boyce–Codd (BCNF). Mientras que la segunda, la tercera y la forma normal de Boyce–Codd se ocupan de las dependencias funcionales, 4NF se ocupa de un tipo más general de dependencia conocido como dependencia multivaluada. Una tabla está en 4NF si y solo si, para cada una de sus dependencias multivaluadas no triviales X ↠ Y, X es una superclave, es decir, X es una clave candidata o un superconjunto de ella.

## Dependencias multivaluadas

Si los encabezados de columna de una tabla de base de datos relacional se dividen en tres agrupaciones disjuntas X, Y y Z, entonces, en el contexto de una fila particular, podemos referirnos a los datos bajo cada grupo de encabezados como x, y y z respectivamente.

Una dependencia multivaluada X ↠ Y significa que si elegimos cualquier x que efectivamente aparezca en la tabla (llamémoslo xc) y compilamos una lista de todas las combinaciones xc·y·z que aparecen en la tabla, encontraremos que xc está asociado a las mismas entradas y independientemente de z. Es decir, esencialmente la presencia de z no aporta información útil para restringir los posibles valores de y.

Una dependencia multivaluada trivial X ↠ Y es aquella en la que o bien Y es un subconjunto de X, o bien X e Y juntos forman el conjunto completo de atributos de la relación.

Una dependencia funcional es un caso especial de dependencia multivaluada. En una dependencia funcional X → Y, cada x determina exactamente un y, nunca más de uno.

## Ejemplo

**Pizza Delivery Permutations**

| Restaurant | Pizza variety | Delivery area |
|---|---|---|
| A1 Pizza | Thick Crust | Springfield |
| A1 Pizza | Thick Crust | Shelbyville |
| A1 Pizza | Thick Crust | Capital City |
| A1 Pizza | Stuffed Crust | Springfield |
| A1 Pizza | Stuffed Crust | Shelbyville |
| A1 Pizza | Stuffed Crust | Capital City |
| Elite Pizza | Thin Crust | Capital City |
| Elite Pizza | Stuffed Crust | Capital City |
| Vincenzo's Pizza | Thick Crust | Springfield |
| Vincenzo's Pizza | Thick Crust | Shelbyville |
| Vincenzo's Pizza | Thin Crust | Springfield |
| Vincenzo's Pizza | Thin Crust | Shelbyville |

Cada fila indica que un restaurante dado puede entregar una variedad dada de pizza en un área dada.

La tabla no tiene atributos ajenos a la clave, porque su única clave candidata es `{Restaurant, Pizza variety, Delivery area}`. Por lo tanto cumple todas las formas normales hasta BCNF. Sin embargo, si asumimos que las variedades de pizza que ofrece un restaurante no se ven afectadas por el área de entrega, o a la inversa, que las áreas de entrega no se ven afectadas por las variedades de pizza (es decir, un restaurante ofrece todas las variedades que hace en todas las áreas que abastece), entonces no cumple 4NF. El problema es que la tabla presenta dos dependencias multivaluadas no triviales sobre el atributo `{Restaurant}`, que no es superclave:

- `{Restaurant}` ↠ `{Pizza variety}`
- `{Restaurant}` ↠ `{Delivery area}`

Estas dependencias multivaluadas no triviales sobre un atributo que no es superclave reflejan el hecho de que las variedades de pizza que un restaurante ofrece son independientes de las áreas a las que reparte. Esta situación produce redundancia en la tabla: por ejemplo, se nos dice tres veces que A1 Pizza ofrece Stuffed Crust, y si A1 Pizza empieza a producir pizzas Cheese Crust habrá que agregar varias filas, una por cada área de entrega de A1 Pizza. Además, nada impide hacerlo mal: podríamos agregar filas de Cheese Crust para todas las áreas de entrega de A1 Pizza salvo una, incumpliendo así la dependencia multivaluada `{Restaurant}` ↠ `{Pizza variety}`.

Para eliminar la posibilidad de estas anomalías, hay que poner los hechos sobre las variedades ofrecidas en una tabla distinta de la de los hechos sobre las áreas de entrega, obteniendo dos tablas que están ambas en 4NF:

**Varieties by restaurant**

| Restaurant | Pizza variety |
|---|---|
| A1 Pizza | Thick Crust |
| A1 Pizza | Stuffed Crust |
| Elite Pizza | Thin Crust |
| Elite Pizza | Stuffed Crust |
| Vincenzo's Pizza | Thick Crust |
| Vincenzo's Pizza | Thin Crust |

**Delivery areas by restaurant**

| Restaurant | Delivery area |
|---|---|
| A1 Pizza | Springfield |
| A1 Pizza | Shelbyville |
| A1 Pizza | Capital City |
| Elite Pizza | Capital City |
| Vincenzo's Pizza | Springfield |
| Vincenzo's Pizza | Shelbyville |

En contraste, si las variedades de pizza que ofrece un restaurante sí variaran legítimamente de un área de entrega a otra, la tabla original de tres columnas satisfaría 4NF.

Ronald Fagin demostró que siempre es posible alcanzar 4NF. El teorema de Rissanen también es aplicable a las dependencias multivaluadas.

## 4NF en la práctica

Un artículo de 1992 de Margaret S. Wu señala que la enseñanza de la normalización de bases de datos típicamente se detiene antes de 4NF, quizá por la creencia de que las tablas que violan 4NF (pero cumplen todas las formas normales inferiores) rara vez se encuentran en aplicaciones de negocio. Esa creencia puede no ser exacta: Wu reporta que, en un estudio de cuarenta bases de datos organizacionales, más del 20 % contenía una o más tablas que violaban 4NF cumpliendo todas las formas normales inferiores.

## Normalización más allá de 4NF

Solo en situaciones raras una tabla en 4NF no se ajusta a la forma normal superior 5NF. Son situaciones en las que una restricción compleja del mundo real, que gobierna las combinaciones válidas de valores de atributos en la tabla 4NF, no está implícita en la estructura de esa tabla.
