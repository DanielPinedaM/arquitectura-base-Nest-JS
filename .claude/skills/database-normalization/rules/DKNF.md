# DKNF — Domain-key normal form (forma normal de dominio-clave)

## Definición

La forma normal de dominio-clave (DK/NF o DKNF) es una forma normal usada en la normalización de bases de datos que exige que la base de datos no contenga restricciones distintas de las restricciones de dominio y las restricciones de clave.

Una restricción de dominio especifica los valores permitidos para un atributo dado, mientras que una restricción de clave especifica los atributos que identifican unívocamente una fila en una tabla dada.

La forma normal de dominio-clave se alcanza cuando toda restricción sobre la relación es una consecuencia lógica de la definición de claves y dominios, y forzar las restricciones y condiciones de clave y de dominio hace que se cumplan todas las restricciones. Así se evitan todas las anomalías no temporales.

La razón para usar la forma normal de dominio-clave es evitar tener en la base de datos restricciones generales que no sean restricciones claras de dominio o de clave. La mayoría de las bases de datos pueden verificar fácilmente restricciones de dominio y de clave sobre los atributos. Las restricciones generales, en cambio, requerirían normalmente programación específica en la base de datos en forma de stored procedures (a menudo del tipo trigger), que son costosos de mantener y costosos de ejecutar para la base de datos. Por eso las restricciones generales se dividen en restricciones de dominio y de clave.

Es mucho más fácil construir una base de datos nueva directamente en forma normal de dominio-clave que convertir bases de datos que están en formas normales inferiores y pueden contener numerosas anomalías. Sin embargo, construir con éxito una base de datos en forma normal de dominio-clave sigue siendo una tarea difícil, incluso para programadores de bases de datos experimentados. Así, aunque la forma normal de dominio-clave elimina los problemas que se encuentran en la mayoría de las bases de datos, tiende a ser la forma normal más costosa de alcanzar. Aun así, no alcanzarla puede acarrear costos ocultos a largo plazo, debido a las anomalías que aparecen con el tiempo en bases de datos que se ajustan solo a formas normales inferiores.

La tercera forma normal, la forma normal de Boyce–Codd, la cuarta forma normal y la quinta forma normal son casos especiales de la forma normal de dominio-clave. Todas tienen dependencias funcionales, multivaluadas o de join que pueden convertirse en superclaves. Los dominios en esas formas normales no estaban restringidos, así que todas las restricciones de dominio se satisfacen. Sin embargo, transformar una forma normal superior en forma normal de dominio-clave no siempre es una transformación que preserve dependencias y, por lo tanto, no siempre es posible.

## Ejemplo

Una violación de DKNF ocurre en la siguiente tabla:

**Wealthy Person**

| Wealthy Person | Wealthy Person Type | Net Worth in Dollars |
|---|---|---|
| Steve | Millionaire | 124,543,621 |
| Roderick | Billionaire | 6,553,228,893 |
| Katrina | Billionaire | 8,829,462,998 |
| Gary | Millionaire | 495,565,211 |

Asúmase que el dominio de `Wealthy Person` consiste en los nombres de todas las personas adineradas de una muestra predefinida; que el dominio de `Wealthy Person Type` consiste en los valores `Millionaire` y `Billionaire`; y que el dominio de `Net Worth in Dollars` consiste en todos los enteros mayores o iguales a 1.000.000.

Existe una restricción que vincula `Wealthy Person Type` con `Net Worth in Dollars`, aunque no podamos deducir uno del otro. La restricción dicta que un `Millionaire` tendrá un patrimonio neto de 1.000.000 a 999.999.999 inclusive, mientras que un `Billionaire` tendrá un patrimonio neto de 1.000.000.000 o más. Esta restricción no es ni una restricción de dominio ni una restricción de clave; por lo tanto no podemos depender de las restricciones de dominio y de clave para garantizar que no entre a la base de datos una combinación inconsistente de `Wealthy Person Type` / `Net Worth in Dollars`.

La violación de DKNF podría eliminarse quitando la columna `Wealthy Person Type`. La condición de millonario o billonario de la persona adinerada queda determinada por su `Net Worth in Dollars`, tal como se define en la tabla `Wealthiness Status`, así que no se pierde información útil.

**Wealthy Person**

| Wealthy Person | Net Worth in Dollars |
|---|---|
| Steve | 124,543,621 |
| Roderick | 6,553,228,893 |
| Katrina | 8,829,462,998 |
| Gary | 495,565,211 |

**Wealthiness Status**

| Status | Minimum | Maximum |
|---|---|---|
| Millionaire | 1,000,000 | 999,999,999 |
| Billionaire | 1,000,000,000 | 999,999,999,999 |

## Foreign keys

Las relaciones que son imposibles de expresar como foreign keys son violaciones evidentes de DKNF. Por ejemplo, un atributo `Parent ID` que apunta a una de varias tablas referenciadas, dependiendo de un segundo atributo `Parent Type`, viola DKNF.
