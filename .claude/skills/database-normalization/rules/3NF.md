# 3NF — Third normal form (tercera forma normal)

## Definición

La tercera forma normal (3NF) es un nivel de normalización de bases de datos. Una relación (o tabla, en SQL) está en tercera forma normal si está en segunda forma normal y además carece de dependencias entre atributos ajenos a la clave, lo que significa que ningún atributo no primo depende funcionalmente de (es decir, contiene un hecho acerca de) ningún otro atributo no primo. En otras palabras, cada atributo no primo debe depender única y no transitivamente de cada clave candidata. Una máxima resume 3NF así: "un campo ajeno a la clave debe aportar un hecho sobre la clave, la clave completa y nada más que la clave".

Un ejemplo de violación de 3NF sería una relación `Patient` con los atributos `PatientID`, `DoctorID` y `DoctorName`, en la cual `DoctorName` dependería ante todo de `DoctorID` y solo transitivamente de la clave `PatientID` (a través de la dependencia de `DoctorID` respecto de `PatientID`). Un diseño así haría que el nombre de un médico quedara duplicado de forma redundante en cada uno de sus pacientes. Una base de datos que cumple 3NF almacenaría los nombres de los médicos en una relación `Doctor` separada, que `Patient` podría referenciar mediante una foreign key.

A 3NF le sigue la forma normal de Boyce–Codd, que busca prevenir anomalías posibles en relaciones con varias claves compuestas solapadas.

## Definición formal de la tercera forma normal

Una relación R está en 3NF si y solo si está en segunda forma normal (2NF) y todo atributo no primo de R depende no transitivamente de cada clave candidata. Un atributo no primo de R es un atributo que no pertenece a ninguna clave candidata de R.

Se define una dependencia transitiva de un conjunto de atributos Z respecto de un conjunto de atributos X como una cadena de dependencias funcionales X → Y → Z que debe satisfacerse para algún conjunto de atributos Y, donde no se cumple que Y → X, y los tres conjuntos deben ser disjuntos.

Existe una definición de 3NF equivalente a la anterior, pero expresada de otra forma. Establece que una tabla está en 3NF si y solo si, para cada una de sus dependencias funcionales X → Y, se cumple al menos una de las siguientes condiciones:

- X contiene a Y (es decir, Y es un subconjunto de X, con lo cual X → Y es una dependencia funcional trivial),
- X es una superclave,
- cada elemento de Y \ X, la diferencia de conjuntos entre Y y X, es un atributo primo (es decir, cada atributo en Y \ X está contenido en alguna clave candidata).

Dicho de forma más simple: la relación está en 3NF si y solo si, para toda dependencia funcional no trivial X → Y, X es una superclave o Y \ X está formado por atributos primos. Esta definición deja clara la diferencia entre 3NF y la más estricta forma normal de Boyce–Codd (BCNF): BCNF simplemente elimina la tercera alternativa ("cada elemento de Y \ X es un atributo primo").

En resumen, esta formulación señala con más claridad que la definición transitiva la "cláusula de escape" que 3NF concede al lado derecho de la dependencia. Para que una dependencia X → Y pase 3NF, aun si X no es superclave ni clave candidata, debe cumplirse que Y sea un atributo primo.

## Ejemplo

### Diseño que viola 3NF

La siguiente relación, con la clave compuesta `{Name, Year}`, no cumple los requisitos de 3NF. Los atributos no primos `WinnerName` y `WinnerBirthdate` dependen solo transitivamente de la clave compuesta, a través de su dependencia respecto del atributo no primo `WinnerID`. Esto crea redundancia y la posibilidad de inconsistencia en el caso de que un ganador de varios torneos reciba accidentalmente distintas fechas de nacimiento en distintas tuplas.

**Tournament**

| Name | Year | WinnerID | WinnerName | WinnerBirthdate |
|---|---|---|---|---|
| Indiana Invitational | 1998 | 1 | Al Fredrickson | 1975-07-21 |
| Cleveland Open | 1999 | 2 | Bob Albertson | 1968-09-28 |
| Des Moines Masters | 1999 | 1 | Al Fredrickson | 1975-07-21 |
| Indiana Invitational | 1999 | 3 | Chip Masterson | 1977-03-14 |

### Diseño que cumple 3NF

Para poner la relación en conformidad con 3NF, `WinnerID`, `WinnerName` y `WinnerBirthdate` pueden trasladarse a una tabla separada.

**Tournament**

| Name | Year | WinnerID |
|---|---|---|
| Indiana Invitational | 1998 | 1 |
| Cleveland Open | 1999 | 2 |
| Des Moines Masters | 1999 | 1 |
| Indiana Invitational | 1999 | 3 |

**Winner**

| WinnerID | Name | Birthdate |
|---|---|---|
| 1 | Al Fredrickson | 1975-07-21 |
| 2 | Bob Albertson | 1968-09-28 |
| 3 | Chip Masterson | 1977-03-14 |

El atributo `WinnerID` de `Tournament` actúa ahora como foreign key que referencia la primary key de `Winner`. A diferencia de antes, ya no es posible que un ganador esté asociado a varias fechas de nacimiento.

## "Nada más que la clave"

Una paráfrasis de la definición de 3NF, que parodia el juramento tradicional de decir la verdad en un tribunal, la resume así: "un campo ajeno a la clave debe aportar un hecho sobre la clave, la clave completa y nada más que la clave". Exigir que los atributos ajenos a la clave dependan de "la clave completa" asegura el cumplimiento de 2NF, y exigir además que dependan de "nada más que la clave" asegura el cumplimiento de 3NF.

Aunque la frase es un mnemónico útil, mencionar una sola clave hace que cumplirla sea necesario pero no suficiente para satisfacer 2NF y 3NF, que se ocupan de todas las claves candidatas de una relación y no solo de una cualquiera.

Adaptado para referirse a todos los campos y no solo a los ajenos a la clave, el resumen puede abarcar también la forma normal de Boyce–Codd, ligeramente más estricta, en la que los atributos primos no deben depender funcionalmente en absoluto. Se considera que los atributos primos aportan un hecho sobre la clave en el sentido de que aportan parte o la totalidad de la clave misma. Esta regla aplica solo a atributos que dependen funcionalmente, ya que aplicarla a todos los atributos prohibiría implícitamente las claves compuestas, dado que cada parte de una clave así violaría la cláusula de "la clave completa".

## Cómputo

Una relación siempre puede descomponerse en tercera forma normal, es decir, la relación R se reescribe como proyecciones R1, ..., Rn cuyo join es igual a la relación original. Además, esta descomposición no pierde ninguna dependencia funcional, en el sentido de que toda dependencia funcional sobre R puede derivarse de las dependencias funcionales que se cumplen sobre las proyecciones R1, ..., Rn. Más aún, tal descomposición puede computarse en tiempo polinomial.

Para descomponer una relación de 2NF a 3NF: dividir la tabla según el recubrimiento canónico de dependencias funcionales, y luego crear una relación para cada clave candidata de la relación original que no fuera ya un subconjunto de alguna relación de la descomposición.

## Consideraciones de uso en entornos de reporting

Aunque 3NF es ideal para el procesamiento por máquina, la naturaleza segmentada del modelo de datos puede resultar difícil de consumir intuitivamente por un usuario humano. La analítica mediante consultas, reportes y dashboards se facilita a menudo con un tipo distinto de modelo de datos que ofrece análisis precalculados: líneas de tendencia, cálculos acumulados por período (mes a la fecha, trimestre a la fecha, año a la fecha), cálculos acumulativos, estadísticas básicas (promedio, desviación estándar, medias móviles) y comparaciones con períodos previos (hace un año, hace un mes, hace una semana); por ejemplo el modelado dimensional y sus derivados. El marco de "tidy data" es 3NF, con las restricciones planteadas en lenguaje estadístico.
