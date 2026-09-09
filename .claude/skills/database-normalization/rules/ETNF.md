# ETNF — Essential tuple normal form (forma normal de tupla esencial)

## Definición

La forma normal de tupla esencial (ETNF) es una forma normal usada en la normalización de bases de datos. Se sitúa estrictamente entre la cuarta forma normal (4NF) y la quinta forma normal (5NF). Según el artículo original, ETNF, aunque estrictamente más débil que 5NF, es exactamente igual de efectiva que 5NF para eliminar la redundancia de tuplas.

## Historia

Hugh Darwen, C. J. Date y Ronald Fagin introdujeron ETNF en su artículo de marzo de 2012.

## Definición formal

ETNF es un concepto del campo de la normalización de bases de datos, que es el proceso de organizar los atributos de una base de datos relacional para reducir la redundancia y mejorar la integridad de los datos. ETNF es una forma normal específica que busca asegurar que el esquema de la base de datos esté libre de redundancia indeseable y de anomalías de dependencia, centrándose en las tuplas esenciales, que son el conjunto mínimo de tuplas necesario para representar los datos con exactitud.

Las características clave de ETNF incluyen:

- **Reducción de redundancia:** ETNF minimiza la duplicación de datos asegurando que cada pieza de información se almacene una sola vez.
- **Eliminación de anomalías:** al organizar los datos en tuplas esenciales, ETNF ayuda a prevenir las anomalías de inserción, actualización y eliminación que pueden comprometer la integridad de los datos.
- **Preservación de dependencias:** ETNF mantiene las dependencias funcionales, asegurando que las relaciones entre los atributos de datos se preserven y se mantengan consistentes.

El objetivo de alcanzar ETNF en el diseño de una base de datos es crear un esquema robusto, eficiente y confiable que soporte una representación y manipulación de datos exactas.

## Criterio operativo

Una relación en 4NF viola ETNF cuando existe una dependencia de join no trivial en la que ningún componente es una superclave. En tal caso la relación se descompone en las proyecciones que componen esa dependencia de join. Véase el ejemplo `Supplier – Book – Franchisee` en [theory.md](theory.md), sección "Satisfacer ETNF".
