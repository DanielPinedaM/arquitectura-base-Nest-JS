# 6NF — Sixth normal form (sexta forma normal)

## Definición

La sexta forma normal (6NF) es una forma normal usada en la normalización de bases de datos relacionales que extiende el álgebra relacional y generaliza los operadores relacionales (como el join) para admitir datos de intervalo, lo cual puede ser útil en bases de datos temporales.

El término 6NF también se usa para referirse a otro grado de normalización, conocido más comúnmente como forma normal de dominio-clave (DKNF); véase la sección "Otros significados".

## Definición formal

La sexta forma normal se define como una forma normal basada en una extensión del álgebra relacional.

Los operadores relacionales, como el join, se generalizan para admitir un tratamiento natural de los datos de intervalo, como secuencias de fechas o momentos en el tiempo, por ejemplo en bases de datos temporales. La sexta forma normal se basa entonces en ese join generalizado, así:

> Una relvar R [tabla] está en sexta forma normal (abreviada 6NF) si y solo si no satisface ninguna dependencia de join no trivial en absoluto — donde, como antes, una dependencia de join es trivial si y solo si al menos una de las proyecciones involucradas se toma sobre el conjunto de todos los atributos de la relvar [tabla] en cuestión.

También se da esta definición equivalente:

> La relvar R está en sexta forma normal (6NF) si y solo si toda dependencia de join de R es trivial — donde una dependencia de join es trivial si y solo si uno de sus componentes es igual al encabezado pertinente en su totalidad.

Cualquier relación en 6NF está también en 5NF.

La sexta forma normal está pensada para descomponer las variables de relación en componentes irreducibles. Aunque esto puede ser relativamente poco importante para variables de relación no temporales, puede ser importante al tratar con variables temporales u otros datos de intervalo. Por ejemplo, si una relación comprende el nombre, el estado y la ciudad de un proveedor, es posible que también queramos agregar datos temporales, como el tiempo durante el cual esos valores son, o fueron, válidos (por ejemplo, para datos históricos), pero los tres valores pueden variar independientemente entre sí y a distintos ritmos. Puede que queramos, por ejemplo, rastrear el historial de cambios del estado; una revisión de los costos de producción puede revelar que un cambio fue causado porque el proveedor cambió de ciudad y con ello lo que cobraba por la entrega.

## Uso

La sexta forma normal se usa en algunos data warehouses donde los beneficios superan a los inconvenientes, por ejemplo con anchor modeling. Aunque usar 6NF lleva a una explosión de tablas, las bases de datos modernas pueden podar las tablas de las consultas `select` (mediante un proceso llamado 'table elimination', de modo que una consulta puede resolverse sin siquiera leer algunas de las tablas a las que hace referencia) allí donde no son necesarias, y así acelerar las consultas que acceden solo a unos pocos atributos.

## Ejemplos

Para que una tabla esté en sexta forma normal tiene que estar primero en quinta forma normal, y además se requiere que cada tabla satisfaga únicamente dependencias de join triviales.

Tómese un ejemplo simple con una tabla que ya está en 5NF. En la tabla de usuarios, todos los atributos son no nulos y la primary key es `Username`:

**Users_table**

| Username | Department | Status |
|---|---|---|

Esta tabla está en 5NF porque cada dependencia de join está implicada por la única clave candidata de la tabla (`Username`). Más concretamente, las únicas dependencias de join posibles son `{username, status}` y `{username, department}`.

La versión en 6NF sería así:

**Users**

| Username | Status |
|---|---|

**Users_dept**

| Username | Department |
|---|---|

Es decir, de una tabla en 5NF, 6NF produce dos tablas.

Otro ejemplo:

**TABLE 1**

| Medic ID | Medic Name | Occupation | Type | Practice in years |
|---|---|---|---|---|
| 1 | Smith James | Orthopedic | Specialist | 23 |
| 2 | Miller Michael | Orthopedic | Probationer | 4 |
| 3 | Thomas Linda | Neurologist | Probationer | 5 |
| 4 | Scott Nancy | Orthopedic | Resident | 1 |
| 5 | Allen Brian | Neurologist | Specialist | 12 |
| 6 | Turner Steven | Ophthalmologist | Probationer | 3 |
| 7 | Collins Kevin | Ophthalmologist | Specialist | 7 |
| 8 | King Donald | Neurologist | Resident | 1 |
| 9 | Harris Sarah | Ophthalmologist | Resident | 2 |

Las dependencias de join de la tabla son `{medic name, occupation}`, `{medic name, practice in years}` y `{medic name, type}`. Se ve entonces que la tabla es 2NF, debido a la aparición de dependencia transitiva. Las siguientes tablas la llevan a 6NF:

**TABLE 2.1**

| Medic ID | Medic Name |
|---|---|
| 1 | Smith James |
| 2 | Miller Michael |
| 3 | Thomas Linda |
| 4 | Scott Nancy |
| 5 | Allen Brian |
| 6 | Turner Steven |
| 7 | Collins Kevin |
| 8 | King Donald |
| 9 | Harris Sarah |

**TABLE 2.2**

| Medic ID | Occupation |
|---|---|
| 1 | Orthopedic |
| 2 | Orthopedic |
| 3 | Neurologist |
| 4 | Orthopedic |
| 5 | Neurologist |
| 6 | Ophthalmologist |
| 7 | Ophthalmologist |
| 8 | Neurologist |
| 9 | Ophthalmologist |

**TABLE 2.3**

| Medic ID | Type |
|---|---|
| 1 | Specialist |
| 2 | Probationer |
| 3 | Probationer |
| 4 | Resident |
| 5 | Specialist |
| 6 | Probationer |
| 7 | Specialist |
| 8 | Resident |
| 9 | Resident |

**TABLE 2.4**

| Medic ID | Practice in years |
|---|---|
| 1 | 23 |
| 2 | 4 |
| 3 | 5 |
| 4 | 1 |
| 5 | 12 |
| 6 | 3 |
| 7 | 7 |
| 8 | 1 |
| 9 | 2 |

## Otros significados

La sexta forma normal (6NF) se usa a veces como sinónimo de forma normal de dominio-clave (DKNF).
