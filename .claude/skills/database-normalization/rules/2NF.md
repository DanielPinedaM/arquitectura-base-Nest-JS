# 2NF — Second normal form (segunda forma normal)

## Definición

La segunda forma normal (2NF) es un nivel de normalización de bases de datos definido por el científico de la computación inglés Edgar F. Codd. Una relación (o una tabla, en SQL) está en 2NF si está en primera forma normal (1NF) y no contiene dependencias parciales. Una dependencia parcial ocurre cuando un atributo no primo (es decir, uno que no forma parte de ninguna clave candidata) depende funcionalmente solo de un subconjunto propio de los atributos que componen una clave candidata. Para estar en 2NF, una relación debe tener todo atributo no primo dependiendo del conjunto completo de atributos de cada clave candidata.

Por ejemplo, una relación con la clave compuesta `{Country, District}` violaría 2NF si se le agregara cualquier atributo cuyo significado no dependiera tanto de `Country` como de `District`. Un atributo `CountryLeader` variaría entre países y aportaría información específica de cada `Country` pero no específica de cada `District`, y por lo tanto dependería solo de la mitad de la clave compuesta. Esto tendría varios inconvenientes, entre ellos que cada líder quedaría duplicado de forma redundante por cada `District` de su `Country`.

El propósito de normalizar a 2NF es reducir esa redundancia y hacer la estructura de la base de datos, en general, más clara y flexible, organizándola por dependencias funcionales. 2NF y la tercera forma normal (3NF) se definieron ambas en el artículo de Codd "Further Normalization of the Data Base Relational Model" en 1971, un año después de que Codd definiera 1NF en "A Relational Model of Data for Large Shared Data Banks" en 1970. Todas las formas normales forman parte del modelo relacional de diseño de bases de datos de Codd.

## Ejemplo

### Diseño que viola 2NF

La siguiente relación en primera forma normal contiene una clave compuesta, `{Manufacturer, Model}`. El atributo no primo `ManufacturerCountry` depende funcionalmente del atributo `Manufacturer` (ya que cada `Manufacturer` estará asociado a un `ManufacturerCountry` distinto), pero no del atributo `Model`. Por lo tanto, `ManufacturerCountry` depende solo de un subconjunto propio de la clave, `{Manufacturer}`, lo que lo hace parcialmente dependiente de la clave y viola 2NF.

**Toothbrush**

| Manufacturer | Model | ManufacturerCountry |
|---|---|---|
| Forte | X-Prime | Italy |
| Forte | Ultraclean | Italy |
| Dent-o-Fresh | EZbrush | USA |
| Brushmaster | SuperBrush | USA |
| Kobayashi | ST-60 | Japan |
| Hoch | Toothmaster | Germany |
| Hoch | X-Prime | Germany |

### Diseño que cumple 2NF

Para llevar a 2NF una relación que ya está en 1NF, todo atributo que dependa solo de parte de una clave compuesta debe extraerse a relaciones separadas donde los atributos de los que depende compongan la totalidad de una clave candidata. Como se ve abajo, el atributo `ManufacturerCountry` puede quitarse de la relación `Toothbrush` original y ponerse en una relación nueva donde el atributo `Manufacturer` compone la primary key completa. El nuevo atributo `Country` depende así de la clave completa y no solo de una parte de ella, de forma que la dependencia parcial anterior se convirtió en una dependencia completa y ambas relaciones quedan en 2NF.

**Toothbrush**

| Manufacturer | Model |
|---|---|
| Forte | X-Prime |
| Forte | Ultraclean |
| Dent-o-Fresh | EZbrush |
| Brushmaster | SuperBrush |
| Kobayashi | ST-60 |
| Hoch | Toothmaster |
| Hoch | X-Prime |

**Manufacturer**

| Manufacturer | Country |
|---|---|
| Forte | Italy |
| Dent-o-Fresh | USA |
| Brushmaster | USA |
| Kobayashi | Japan |
| Hoch | Germany |
