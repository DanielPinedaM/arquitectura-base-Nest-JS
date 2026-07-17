import { log } from '@/shared/data-types/constants/logger.const';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_VARS, EnvironmentClass } from 'environments/env-config';
import * as fs from 'fs-extra';
import { DateTime } from 'luxon';
import * as path from 'path';
import pino from 'pino';
import * as rfs from 'rotating-file-stream';

@Injectable()
export class LoggerService {
  private ROOT_LOGS_DIR: string = path.join(process.cwd(), 'src', 'logs');
  saveLog!: pino.Logger;

  constructor(private env: ConfigService<EnvironmentClass>) {
    this.ensureLogDirectories();
    this.saveLog = this.createFileLogger();
  }

  /**
  crea logger de archivo rotado por fecha usando rotating-file-stream */
  createFileLogger(): pino.Logger {
    const logDir: string = this.getLogBaseDirForEnv();
    fs.ensureDirSync(logDir);

    const stream = rfs.createStream(
      (time: number | Date) => {
        const date = time instanceof Date ? time : new Date();
        return `${DateTime.fromJSDate(date).toFormat('yyyy-MM-dd')}.log`;
      },
      {
        interval: '1d', // diario
        path: logDir,
        maxFiles: 365, // opcional: mantener hasta 1 año
      },
    );

    return pino({ level: 'info' }, stream);
  }

  /**
  ID para cada uno de los logs q se guardan en los archivos */
  generateLogId(): string {
    const timePart: string =
      Date.now() + Number(process.hrtime.bigint() % 1_000_000n).toString(36);

    const randomPart: string = require('crypto').randomBytes(8).toString('hex');

    return `${timePart}-${randomPart}`;
  }

  /**
  nombre del mes actual */
  getCurrentMonthName(): string {
    return DateTime.local().toFormat('LLLL');
  }

  /**
   nombre de la carpeta base donde se guardan los logs:
   src/logs/{ENV}/{NombreMes}/ */
  getLogBaseDirForEnv(): string {
    const envName: string = this.env.get<string>(ENV_VARS.NODE_ENV)!;
    const monthName: string = this.getCurrentMonthName();
    return path.join(this.ROOT_LOGS_DIR, envName, monthName);
  }

  /**
   ruta absoluta para generar archivos con los logs
   src/logs/{ENV}/{NombreMes}/app.{año-mes-dia}.log */
  getLogFileBase(): string {
    const baseDir: string = this.getLogBaseDirForEnv();
    // archivo base (pino-roll añadirá la fecha según dateFormat)
    return path.join(baseDir, 'app.log');
  }

  /**
   asegurar q exista la carpeta de logs para el ambiente actual y mes actual */
  ensureLogDirectories(): void {
    const baseDir = this.getLogBaseDirForEnv();
    fs.ensureDirSync(baseDir);
  }

  /**
   console.log y guardar log de informacion */
  logInfo(message: string, meta: Record<string, any> = {}): void {
    const id: string = this.generateLogId();
    const time: string = DateTime.local().toFormat('hh:mm:ss a');

    if (this.env.get(ENV_VARS.SHOW_LOGS))
      log.info(`\x1b[32m ${message}\x1b[0m`);

    this.saveLog.info({ id, time, ...meta }, `✅ ${message}`);
  }

  /**
   console.log y guardar log de error */
  logError(message: string, meta: Record<string, any> = {}) {
    const id: string = this.generateLogId();
    const time: string = DateTime.local().toFormat('hh:mm:ss a');

    if (this.env.get(ENV_VARS.SHOW_LOGS))
      log.error(`\x1b[31m ${message}\x1b[0m`);

    this.saveLog.error({ id, time, ...meta }, `❌ ${message}`);
  }
}
