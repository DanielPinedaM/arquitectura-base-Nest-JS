---
title: Sanitiza la salida para prevenir XSS
impact: HIGH
impactDescription: Las vulnerabilidades XSS pueden comprometer las sesiones y los datos de los usuarios
tags: security, xss, sanitization, html
---

## Sanitiza la salida para prevenir XSS

Aunque las APIs de NestJS normalmente devuelven JSON (que los navegadores no ejecutan), existen riesgos de XSS al renderizar HTML, al almacenar contenido de los usuarios o cuando los frameworks de frontend manejan incorrectamente las respuestas de la API. Sanitiza el contenido generado por los usuarios antes de almacenarlo y usa headers Content-Type correctos.

**Incorrecto (almacenar HTML en bruto sin sanitizar):**

```typescript
// Almacena el HTML en bruto de los usuarios
@Injectable()
export class CommentsService {
  async create(dto: CreateCommentDto): Promise<Comment> {
    // El usuario puede inyectar: <script>steal(document.cookie)</script>
    return this.repo.save({
      content: dto.content, // En bruto, sin sanitizar
      authorId: dto.authorId,
    });
  }
}

// Devuelve HTML sin sanitizar
@Controller('pages')
export class PagesController {
  @Get(':slug')
  @Header('Content-Type', 'text/html')
  async getPage(@Param('slug') slug: string): Promise<string> {
    const page = await this.pagesService.findBySlug(slug);
    // Si page.content contiene input del usuario, es posible un XSS
    return `<html><body>${page.content}</body></html>`;
  }
}

// Refleja el input del usuario en los errores
@Get(':id')
async findOne(@Param('id') id: string): Promise<User> {
  const user = await this.repo.findOne({ where: { id } });
  if (!user) {
    // XSS si id contiene contenido malicioso y el error se renderiza
    throw new NotFoundException(`User ${id} not found`);
  }
  return user;
}
```

**Correcto (sanitiza el contenido y usa headers correctos):**

```typescript
// Sanitiza el contenido HTML antes de almacenarlo
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class CommentsService {
  private readonly sanitizeOptions: sanitizeHtml.IOptions = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  };

  async create(dto: CreateCommentDto): Promise<Comment> {
    return this.repo.save({
      content: sanitizeHtml(dto.content, this.sanitizeOptions),
      authorId: dto.authorId,
    });
  }
}

// Usa un validation pipe para eliminar el HTML
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z
    .string()
    .max(1000)
    .transform((value) => sanitizeHtml(value, { allowedTags: [] })),

  content: z.string().transform((value) =>
    sanitizeHtml(value, {
      allowedTags: ['p', 'br', 'b', 'i', 'a'],
      allowedAttributes: { a: ['href'] },
    }),
  ),
});

export class CreatePostDto extends createZodDto(createPostSchema) {}

// Establece headers Content-Type correctos
@Controller('api')
export class ApiController {
  @Get('data')
  @Header('Content-Type', 'application/json')
  async getData(): Promise<DataResponse> {
    // Respuesta JSON - el navegador no ejecutará scripts
    return this.service.getData();
  }
}

// Sanitiza los mensajes de error
@Get(':id')
async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
  const user = await this.repo.findOne({ where: { id } });
  if (!user) {
    // La validación del UUID asegura un formato seguro
    throw new NotFoundException('User not found');
  }
  return user;
}

// Usa Helmet para los headers de CSP
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  await app.listen(3000);
}
```

Referencia: [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
