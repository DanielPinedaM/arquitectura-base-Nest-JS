/**
respuesta que devuelven las operaciones de auth antes de que el interceptor las
normalice al contrato IResponse */
export interface IAuthResponse {
  status: number;
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
