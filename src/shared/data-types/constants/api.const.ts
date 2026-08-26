/**
 * identidad de la API. viven aparte de main.ts porque las consumen tanto la
 * configuracion de Nest como swagger y el listado de endpoints en consola */

/** prefijo que Nest antepone a todas las rutas: /api/v1/... */
export const GLOBAL_PREFIX: string = 'api';

/* *********************************
 * swagger: documentación de la API *
 * ********************************** */
export const API_TITLE: string = 'Base';
export const API_DESCRIPTION: string = 'Descripción de API para base';
export const API_VERSION: string = '1';
