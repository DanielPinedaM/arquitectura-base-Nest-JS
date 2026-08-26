/**
 * utilidades para leer valores de tipo desconocido sin recurrir al tipo any.
 *
 * reemplazan al optional chaining sobre variables sin tipar y conservan
 * exactamente su misma semantica */

/**
lee una key de un valor desconocido sin asumir su forma.

devuelve undefined cuando el valor no es un objeto, que es justo lo que
devolveria `valor?.key` sobre un primitivo, null o undefined */
export function readKey(value: unknown, key: string): unknown {
  if (value === null || typeof value !== 'object') return undefined;

  return (value as Record<string, unknown>)[key];
}

/**
devuelve el primer valor no nulo que encuentre recorriendo las keys en orden.

equivale a encadenar `valor?.key1 ?? valor?.key2 ?? ... ?? undefined` */
export function readFirstKey(value: unknown, keys: readonly string[]): unknown {
  for (const key of keys) {
    const found: unknown = readKey(value, key);
    if (found !== undefined && found !== null) return found;
  }

  return undefined;
}

/**
¿la variable es un objeto literal? */
export function isLiteralObject(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.prototype.toString.call(value) === '[object Object]')
  );
}
