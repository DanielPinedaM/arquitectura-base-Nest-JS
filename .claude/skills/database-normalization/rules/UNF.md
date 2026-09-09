# UNF — Unnormalized form (forma no normalizada)

## Definición

En la normalización de bases de datos, la forma no normalizada (UNF o 0NF), también conocida como relación no normalizada o forma no primera normal (N1NF o NF2), es un modelo de datos de base de datos (organización de los datos dentro de una base de datos) que no cumple ninguna de las condiciones de normalización definidas por el modelo relacional. Los sistemas de bases de datos que admiten datos no normalizados a veces se llaman no relacionales o NoSQL. En el modelo relacional, las relaciones no normalizadas pueden considerarse el punto de partida de un proceso de normalización.

"Forma no normalizada" no debe confundirse con desnormalización, donde la normalización se compromete deliberadamente en tablas seleccionadas de una base de datos relacional.

## Forma relacional

La normalización a primera forma normal exige que los datos iniciales se vean como relaciones. En los sistemas de bases de datos, las relaciones se representan como tablas. La vista relacional impone algunas restricciones sobre las tablas:

- **Sin filas duplicadas.** En la práctica esto se garantiza definiendo una o más columnas como primary key.
- **Las filas no tienen un orden intrínseco.** Aunque las tablas tienen que almacenarse y presentarse en algún orden, ese orden es inestable y depende de la implementación. Si hay que representar un orden específico, tiene que estar en forma de dato, por ejemplo con una columna "número".
- **Las columnas tienen nombres únicos dentro de la misma tabla.**
- **Cada columna tiene un dominio** (o tipo de dato) que define los valores permitidos en la columna.
- **Todas las filas de una tabla tienen el mismo conjunto de columnas.**

Esta definición no impide que las columnas tengan conjuntos o relaciones como valores, por ejemplo tablas anidadas. Esa es la diferencia principal con la primera forma normal.

Las bases de datos NoSQL, como las bases de datos documentales, típicamente no se ajustan a la vista relacional. Por ejemplo, una base de datos JSON o XML podría admitir registros duplicados y orden intrínseco. Una base de datos así se describe como no relacional. Pero también hay modelos de bases de datos que sí admiten la vista relacional y aun así no adoptan la primera forma normal. Esos modelos se llaman relaciones en forma no primera normal (abreviadas NFR, N1NF o NF2).

## Ejemplo con una columna cuyo valor es una tabla

**Customer**

| Customer | Cust_ID | Transactions |
|---|---|---|
| Abdulazziz | 1 | `[{Tr_ID: 12890, Date: 2003-10-14, Amount: −87}, {Tr_ID: 12904, Date: 2003-10-15, Amount: −50}]` |
| Abdurrahman | 2 | `[{Tr_ID: 12898, Date: 2003-10-14, Amount: −21}]` |
| Kenan | 3 | `[{Tr_ID: 12907, Date: 2003-10-15, Amount: −18}, {Tr_ID: 14920, Date: 2003-11-20, Amount: −70}, {Tr_ID: 15003, Date: 2003-11-27, Amount: −60}]` |

Esta tabla representa una relación donde una de las columnas (`Transactions`) es a su vez una relación. Es una relación válida, pero no cumple la primera forma normal, que no permite relaciones anidadas. La tabla está, por lo tanto, no normalizada.

## Aplicaciones modernas

Empresas como Google, Amazon y Facebook manejan grandes volúmenes de datos difíciles de almacenar de forma eficiente. Usan bases de datos NoSQL, basadas en los principios del modelo relacional no normalizado, para resolver el problema de almacenamiento. Algunos ejemplos de bases de datos NoSQL son MongoDB, Apache Cassandra y Redis.

## Qué hace este paso durante la normalización

UNF es el punto de partida, no un objetivo: documenta el modelo relacional tal como está hoy en el schema del ORM, antes de aplicar cualquier cambio. Sirve como línea base contra la cual se comparan las formas normales siguientes.
