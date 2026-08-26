/**
 * alias con los que una respuesta puede traer cada parte de su contenido.
 *
 * StandardizeSuccessResponseInterceptor los recorre en orden y gana el primero
 * que exista, para poder normalizar respuestas que vienen escritas en español o
 * en ingles sin obligar a cada service a usar un nombre unico */

/** donde puede venir el contenido util de la respuesta */
export const DATA_KEYS: readonly string[] = [
  'data',
  'datos',
  'dato',
  'result',
  'results',
  'payload',
  'respuesta',
  'respuestas',
  'response',
  'responses',
  'content',
  'contenido',
  'value',
  'valor',
];

/** donde puede venir el mensaje dirigido al usuario */
export const MESSAGE_KEYS: readonly string[] = [
  'mensaje',
  'message',
  'msg',
  'mensajeUsuario',
  'mensajeExito',
  'mensajeError',
  'descripcion',
  'descripcionError',
  'detalle',
  'detalles',
  'texto',
  'textoError',
  'userMessage',
  'successMessage',
  'errorMessage',
  'description',
  'errorDescription',
  'detail',
  'details',
  'text',
  'errorText',
];

/** donde puede venir la paginacion */
export const PAGINATION_KEYS: readonly string[] = [
  'pagination',
  'paginacion',
  'paginador',
];

/**
 * keys que se borran del contenido antes de responder porque ya viajan en la
 * raiz de IResponse y no se deben duplicar dentro de data */
export const RESPONSE_METADATA_KEYS: readonly string[] = [
  'status',
  'statusCode',
  ...MESSAGE_KEYS,
];
