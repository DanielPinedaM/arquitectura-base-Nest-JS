/**
 * encriptar y desencriptar texto.
 *
 * estas constantes viven en shared y no dentro de la feature de auth porque las
 * consume CryptoService, que es un servicio transversal. si se quedaran en
 * app/features/auth, shared dependeria de una feature y se invertiria la
 * direccion de las dependencias */
export const SECRET_KEY_AUTHENTICATION: string = 'GestionAlcaldeCO';
export const IV_AUTH: string = 'encryptionIntVec';
