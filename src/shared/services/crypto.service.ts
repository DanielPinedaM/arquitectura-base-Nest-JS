import {
  IV_AUTH,
  SECRET_KEY_AUTHENTICATION,
} from '@/app/features/auth/data-types/constants/auth.const';
import { Injectable } from '@nestjs/common';
import { AES, enc, mode, pad } from 'crypto-js';

@Injectable()
export class CryptoService {
  async encrypt(text: string): Promise<string> {
    const key = enc.Utf8.parse(SECRET_KEY_AUTHENTICATION); // número hexadecimal de 16 dígitos como clave
    const iv = enc.Utf8.parse(IV_AUTH); // Número hexadecimal como desplazamiento de clave

    const textoHexa = enc.Utf8.parse(text);
    const encrypted = AES.encrypt(textoHexa, key, {
      keySize: 128,
      iv: iv,
      mode: mode.CBC,
      padding: pad.Pkcs7,
    });

    // Aquí devolvemos todo el objeto cifrado en formato Base64
    return encrypted.toString();
  }

  async decrypt(encryptedText: string): Promise<string> {
    const key = enc.Utf8.parse(SECRET_KEY_AUTHENTICATION);
    const iv = enc.Utf8.parse(IV_AUTH);

    // AES.decrypt ahora acepta el texto cifrado completo
    const decrypted = AES.decrypt(encryptedText, key, {
      iv: iv,
      mode: mode.CBC,
      padding: pad.Pkcs7,
    });

    return decrypted.toString(enc.Utf8);
  }

  async encryptJSON(data: Record<string, any>): Promise<string | null> {
    const text: string = JSON.stringify(data);
    return await this.encrypt(text);
  }

  async decryptJSON(encryptedJSON: string): Promise<any | null> {
    const decryptedJSON: string | null = await this.decrypt(encryptedJSON);

    if (this.isValidJSONparse(decryptedJSON)) return JSON.parse(decryptedJSON);

    console.error('❌ [decryptJSON] error no es JSON valido ', decryptedJSON);
    return null;
  }

  /**
  saber si puedo o no convertir de string a array u objeto con JSON.parse() */
  private isValidJSONparse = (string: string): boolean => {
    if (typeof string !== 'string') return false;

    try {
      JSON.parse(string);
      return true;
    } catch (error) {
      return false;
    }
  };
}
