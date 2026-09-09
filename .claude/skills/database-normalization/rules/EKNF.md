# EKNF — Elementary key normal form (forma normal de clave elemental)

## Definición

La forma normal de clave elemental (EKNF) es una mejora sutil sobre la tercera forma normal, de modo que las tablas en EKNF están en 3NF por definición. Esto ocurre cuando hay más de una clave compuesta única y esas claves se solapan. Tales casos pueden causar información redundante en la columna o columnas solapadas.

## Historia

EKNF fue definida por Carlo Zaniolo en 1982.

## Definición formal

Una tabla está en EKNF si y solo si todas sus dependencias funcionales elementales empiezan en claves completas o terminan en atributos de clave elemental. Para toda dependencia funcional completa y no trivial de la forma X → Y, o bien X es una clave, o bien Y es (parte de) una clave elemental.

En esta definición:

- Una **dependencia funcional elemental** es una dependencia funcional completa (una dependencia funcional no trivial X → A tal que no existe una dependencia funcional X' → A que también se cumpla siendo X' un subconjunto estricto de X).
- Una **clave elemental** es una clave X para la cual existe un atributo A tal que X → A es una dependencia funcional elemental.

## Ejemplo

Considérese el siguiente escenario: hay un proceso de pedido de gafas en el que deben especificarse una montura (`frame`) y un lente (`lens`). El producto lente debe ser un lente y el producto montura debe ser una montura. Para mantener esta restricción se añade el tipo de producto a la fila de cada producto.

**Orders**

| Person | FrameId | FrameProductType | LensId | LensProductType |
|---|---|---|---|---|
| Larry | 1 | Frame | 3 | Lens |
| Moe | 2 | Frame | 4 | Lens |
| Moe | 1 | Frame | 4 | Lens |

**Product**

| Id | Name | Type |
|---|---|---|
| 1 | Standard | Frame |
| 2 | Custom | Frame |
| 3 | Standard | Lens |
| 4 | Custom | Lens |

En el escenario anterior habría una restricción sobre `FrameProductType` y `LensProductType` obligándolos a ser `Frame` y `Lens` respectivamente, y habría una relación de foreign key hacia `Product` tanto por `Id` como por `productType`, para el par `FrameId, FrameProductType` y para el par `LensId, LensProductType` respectivamente.

Para que esa relación de foreign key funcione, debe crearse una "clave elemental" en la tabla `Product` sobre `Id` y `Type`. Esto se consigue generalmente mediante una restricción de clave única. Sin esa relación y esa restricción, podría seleccionarse un lente como montura y una montura como lente.
