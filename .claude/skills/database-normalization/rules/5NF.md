# 5NF — Fifth normal form (quinta forma normal)

## Definición

La quinta forma normal (5NF), también conocida como forma normal de proyección–join (PJ/NF), es un nivel de normalización de bases de datos diseñado para eliminar la redundancia en bases de datos relacionales que registran hechos multivaluados, aislando múltiples relaciones semánticamente relacionadas. Se dice que una tabla está en 5NF si y solo si toda dependencia de join no trivial en esa tabla está implicada por las claves candidatas. Es la última forma normal en lo que respecta a eliminar redundancia.

También existe 6NF, pero su propósito no es eliminar redundancia y por eso solo la adoptan unos pocos data warehouses, donde puede ser útil para hacer las tablas irreducibles.

Una dependencia de join `*{A, B, … Z}` sobre R está implicada por la clave o claves candidatas de R si y solo si cada uno de A, B, …, Z es una superclave de R.

## Ejemplo

**Traveling-salesman product availability by brand**

| Traveling salesman | Brand | Product type |
|---|---|---|
| Jack Schneider | Acme | Vacuum cleaner |
| Jack Schneider | Acme | Breadbox |
| Mary Jones | Robusto | Pruning shears |
| Mary Jones | Robusto | Vacuum cleaner |
| Mary Jones | Robusto | Breadbox |
| Mary Jones | Robusto | Umbrella stand |
| Louis Ferguson | Robusto | Vacuum cleaner |
| Louis Ferguson | Robusto | Telescope |
| Louis Ferguson | Acme | Vacuum cleaner |
| Louis Ferguson | Acme | Lava lamp |
| Louis Ferguson | Nimbus | Tie rack |

El predicado de la tabla es: los productos del tipo designado por `product type`, fabricados por la marca designada por `brand`, están disponibles a través del vendedor designado por `traveling salesman`.

La primary key es la composición de las tres columnas. Nótese también que la tabla está en 4NF, ya que no hay dependencias multivaluadas (dependencias de join de 2 partes) en la tabla: ninguna columna que por sí sola no sea clave candidata ni superclave es determinante de las otras dos.

En ausencia de reglas que restrinjan las combinaciones válidas de vendedor, marca y tipo de producto, la tabla de tres atributos anterior es necesaria para modelar la situación correctamente.

Supóngase, sin embargo, que aplica la siguiente regla: un vendedor tiene ciertas marcas y ciertos tipos de producto en su repertorio. Si la marca B1 y la marca B2 están en su repertorio, y el tipo de producto P está en su repertorio, entonces (asumiendo que tanto B1 como B2 fabrican el tipo de producto P) el vendedor debe ofrecer el tipo de producto P de ambas marcas; es decir, el vendedor no puede vender solo el producto P de B1 o solo el producto P de B2.

En ese caso, es posible dividir la tabla en tres:

**Product types by traveling salesman**

| Traveling salesman | Product type |
|---|---|
| Jack Schneider | Vacuum cleaner |
| Jack Schneider | Breadbox |
| Mary Jones | Pruning shears |
| Mary Jones | Vacuum cleaner |
| Mary Jones | Breadbox |
| Mary Jones | Umbrella stand |
| Louis Ferguson | Telescope |
| Louis Ferguson | Vacuum cleaner |
| Louis Ferguson | Lava lamp |
| Louis Ferguson | Tie rack |

**Brands by traveling salesman**

| Traveling salesman | Brand |
|---|---|
| Jack Schneider | Acme |
| Mary Jones | Robusto |
| Louis Ferguson | Robusto |
| Louis Ferguson | Acme |
| Louis Ferguson | Nimbus |

**Product types by brand**

| Brand | Product type |
|---|---|
| Acme | Vacuum cleaner |
| Acme | Breadbox |
| Acme | Lava lamp |
| Robusto | Pruning shears |
| Robusto | Vacuum cleaner |
| Robusto | Breadbox |
| Robusto | Umbrella stand |
| Robusto | Telescope |
| Nimbus | Tie rack |

En este caso, es imposible que Louis Ferguson se niegue a ofrecer aspiradoras fabricadas por Acme (asumiendo que Acme fabrica aspiradoras) si vende cualquier otra cosa fabricada por Acme (lava lamp) y además vende aspiradoras de cualquier otra marca (Robusto).

Nótese cómo esta disposición ayuda a eliminar redundancia. Supóngase que Jack Schneider empieza a vender los productos breadboxes y vacuum cleaners de Robusto. En la disposición anterior habría que agregar dos entradas nuevas, una por cada tipo de producto (`<Jack Schneider, Robusto, breadboxes>`, `<Jack Schneider, Robusto, vacuum cleaners>`). Con la nueva disposición basta con agregar una sola entrada (`<Jack Schneider, Robusto>`) en "brands by traveling salesman".

## Uso

Solo en situaciones raras una tabla en 4NF no se ajusta a 5NF; por ejemplo, cuando las tablas descompuestas son cíclicas. Son situaciones en las que una restricción compleja del mundo real, que gobierna las combinaciones válidas de valores de atributos en la tabla 4NF, no está implícita en la estructura de esa tabla.

Si una tabla así no se normaliza a 5NF, la carga de mantener la consistencia lógica de los datos recae en parte sobre la aplicación responsable de las inserciones, eliminaciones y actualizaciones, y hay un riesgo elevado de que los datos de la tabla se vuelvan inconsistentes. En contraste, el diseño en 5NF excluye la posibilidad de tales inconsistencias.

Una tabla T está en quinta forma normal (5NF) o forma normal de proyección–join (PJ/NF) si no admite una descomposición sin pérdida en ningún número de tablas más pequeñas. Se excluye el caso en que todas las tablas más pequeñas resultantes de la descomposición tengan la misma clave candidata que la tabla T.
