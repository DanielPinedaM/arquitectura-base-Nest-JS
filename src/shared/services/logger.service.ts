import { log } from '@/shared/data-types/constants/logger.const';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { ENV_VARS, EnvironmentClass } from 'environments/env-config';
import * as fs from 'fs-extra';
import { DateTime } from 'luxon';
import * as path from 'path';
import pino from 'pino';
import * as rfs from 'rotating-file-stream';

@Injectable()
export class LoggerService {
  private readonly ROOT_LOGS_DIR: string = path.join(
    process.cwd(),
    'src',
    'logs',
  );
  readonly saveLog: pino.Logger;

  constructor(private readonly env: ConfigService<EnvironmentClass>) {
    /* createFileLogger() ya se encarga de crear la carpeta del ambiente */
    this.saveLog = this.createFileLogger();
  }

  /**
  crea logger de archivo rotado por fecha usando rotating-file-stream */
  createFileLogger(): pino.Logger {
    const logDir: string = this.getLogBaseDirForEnv();
    fs.ensureDirSync(logDir);

    const stream: rfs.RotatingFileStream = rfs.createStream(
      (time: number | Date) => {
        const date: Date = time instanceof Date ? time : new Date();
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

    const randomPart: string = randomBytes(8).toString('hex');

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
   asegurar q exista la carpeta de logs para el ambiente actual y mes actual */
  ensureLogDirectories(): void {
    const baseDir: string = this.getLogBaseDirForEnv();
    fs.ensureDirSync(baseDir);
  }

  /**
   console.log y guardar log de informacion */
  logInfo(message: string, meta: Record<string, unknown> = {}): void {
    const id: string = this.generateLogId();
    const time: string = DateTime.local().toFormat('hh:mm:ss a');

    if (this.env.get(ENV_VARS.SHOW_LOGS))
      log.info(`\x1b[32m ${message}\x1b[0m`);

    this.saveLog.info({ id, time, ...meta }, `✅ ${message}`);
  }

  /**
   console.log y guardar log de error */
  logError(message: string, meta: Record<string, unknown> = {}): void {
    const id: string = this.generateLogId();
    const time: string = DateTime.local().toFormat('hh:mm:ss a');

    if (this.env.get(ENV_VARS.SHOW_LOGS))
      log.error(`\x1b[31m ${message}\x1b[0m`);

    this.saveLog.error({ id, time, ...meta }, `❌ ${message}`);
  }
}
