import {
  API_DESCRIPTION,
  API_TITLE,
  API_VERSION,
} from '@/shared/data-types/constants/api.const';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ENV_VARS, EnvironmentClass } from 'environments/env-config.schema';
import { cleanupOpenApiDoc } from 'nestjs-zod';

/* *********************************
 * swagger: documentación de la API *
 * ********************************** */
export function configSwagger(app: INestApplication): void {
  const env: ConfigService<EnvironmentClass> = app.get(ConfigService);
  const NODE_ENV: string = env.get<string>(ENV_VARS.NODE_ENV)!;

  /**
   * no montar la documentacion de la API en produccion para no exponerla
   * publicamente. el ambiente se lee desde ConfigService, no desde process.env */
  if (NODE_ENV === 'production') return;

  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle(API_TITLE)
    .setDescription(API_DESCRIPTION)
    .setVersion(API_VERSION)
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(document), {
    useGlobalPrefix: false,
  });
}
