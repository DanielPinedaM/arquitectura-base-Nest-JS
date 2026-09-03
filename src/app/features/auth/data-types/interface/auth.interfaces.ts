/**
datos publicos del usuario autenticado, sin los campos sensibles ni internos
(id, password, creationDate) que login() descarta antes de responder */
export interface IAuthenticatedUser {
  email: string;
  username: string;
}

/**
respuesta del login, que ademas del mensaje devuelve los datos publicos del
usuario que inicio sesion */
export interface ILoginResponse {
  message: string;
  data: IAuthenticatedUser;
}

/**
respuesta del logout, que solo confirma el cierre de sesion porque la cookie del
token ya se limpio en la response */
export interface ILogoutResponse {
  message: string;
}

/**
respuesta del registro de un usuario nuevo */
export interface IRegisterResponse {
  message: string;
}

/**
credenciales ya desencriptadas que llegan cifradas desde el cliente */
export interface IDecryptedCredentials {
  decryptedEmail: string;
  decryptedPassword: string;
}

/**
datos del usuario que viajan dentro del JWT.

son opcionales porque generateToken() los lee con optional chaining sobre el
usuario que recibe */
export interface IJwtPayload {
  id?: number;
  email?: string;
  username?: string;
}
