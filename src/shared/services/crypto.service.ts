import { log } from '@/shared/data-types/constants/logger.const';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AES, enc, lib, mode, pad } from 'crypto-js';
import { ENV_VARS, EnvironmentClass } from 'environments/env-config.schema';

/** llave y vector de inicializacion que usa el cifrado AES */
interface ICipherKeys {
  key: lib.WordArray;
  iv: lib.WordArray;
}

@Injectable()
export class CryptoService {
  constructor(private readonly env: ConfigService<EnvironmentClass>) {}

  /* eslint-disable-next-line @typescript-eslint/require-await --
     la firma asincrona es parte del contrato publico del service: los callers
     hacen await y encadenan estas llamadas dentro de un Promise.all */
  async encrypt(text: string): Promise<string> {
    const { key, iv } = this.getCipherKeys();

    const textoHexa: lib.WordArray = enc.Utf8.parse(text);
    const encrypted = AES.encrypt(textoHexa, key, {
      keySize: 128,
      iv: iv,
      mode: mode.CBC,
      padding: pad.Pkcs7,
    });

    // Aquí devolvemos todo el objeto cifrado en formato Base64
    return encrypted.toString();
  }

  /* eslint-disable-next-line @typescript-eslint/require-await --
     misma razon que encrypt(): la firma asincrona es parte del contrato */
  async decrypt(encryptedText: string): Promise<string> {
    const { key, iv } = this.getCipherKeys();

    // AES.decrypt ahora acepta el texto cifrado completo
    const decrypted: lib.WordArray = AES.decrypt(encryptedText, key, {
      iv: iv,
      mode: mode.CBC,
      padding: pad.Pkcs7,
    });

    return decrypted.toString(enc.Utf8);
  }

  async encryptJSON(data: Record<string, unknown>): Promise<string | null> {
    const text: string = JSON.stringify(data);
    return await this.encrypt(text);
  }

  async decryptJSON(encryptedJSON: string): Promise<unknown> {
    const decryptedJSON: string = await this.decrypt(encryptedJSON);

    if (this.isValidJSONparse(decryptedJSON)) return JSON.parse(decryptedJSON);

    log.error(`❌ [decryptJSON] error no es JSON valido ${decryptedJSON}`);
    return null;
  }

  /**
  llave y vector de inicializacion del cifrado.

  salen de las variables de entorno CRYPTO_SECRET_KEY y CRYPTO_IV, nunca del
  codigo fuente, para que cada ambiente pueda usar su propio secreto.
  env-config.ts ya valida al arrancar que ambas existan y midan 16 caracteres,
  por eso aqui se pueden afirmar con ! sin volver a comprobarlas.

  se derivan en cada llamada, igual que antes, para no compartir estado mutable
  entre peticiones: el service es singleton */
  private getCipherKeys(): ICipherKeys {
    return {
      // número hexadecimal de 16 dígitos como clave
      key: enc.Utf8.parse(this.env.get<string>(ENV_VARS.CRYPTO_SECRET_KEY)!),
      // Número hexadecimal como desplazamiento de clave
      iv: enc.Utf8.parse(this.env.get<string>(ENV_VARS.CRYPTO_IV)!),
    };
  }

  /**
  saber si puedo o no convertir de string a array u objeto con JSON.parse() */
  private isValidJSONparse = (string: string): boolean => {
    if (typeof string !== 'string') return false;

    try {
      JSON.parse(string);
      return true;
    } catch {
      return false;
    }
  };
}
