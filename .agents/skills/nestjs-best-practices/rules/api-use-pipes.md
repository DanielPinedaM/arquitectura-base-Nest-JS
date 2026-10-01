---
title: Usa pipes para la transformación del input
impact: MEDIUM
impactDescription: Los pipes aseguran que lleguen datos limpios y validados a tus handlers
tags: api, pipes, validation, transformation
---

## Usa pipes para la transformación del input

Usa pipes integrados como `ParseIntPipe`, `ParseUUIDPipe` y `DefaultValuePipe` para las transformaciones comunes. Crea pipes personalizados para las transformaciones específicas del negocio. Los pipes separan la lógica de validación/transformación de los controllers.

**Incorrecto (parseo manual de tipos en los handlers):**

```typescript
// Parseo manual de tipos en los handlers
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    // Validación manual en cada handler
    const uuid = id.trim();
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID');
    }
    return this.usersService.findOne(uuid);
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<User[]> {
    // Parseo manual y valores por defecto
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return this.usersService.findAll(pageNum, limitNum);
  }
}

// Coerción de tipos sin validación
@Get()
async search(@Query('price') price: string): Promise<Product[]> {
  const priceNum = +price; // NaN si es inválido, sin error
  return this.productsService.findByPrice(priceNum);
}
```

**Correcto (usa pipes integrados y personalizados):**

```typescript
// Usa pipes integrados para las transformaciones comunes
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    // Se garantiza que id es un UUID válido
    return this.usersService.findOne(id);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<User[]> {
    // Valores por defecto y conversión de tipos automáticos
    return this.usersService.findAll(page, limit);
  }

  @Get('by-status/:status')
  async findByStatus(
    @Param('status', new ParseEnumPipe(UserStatus)) status: UserStatus,
  ): Promise<User[]> {
    return this.usersService.findByStatus(status);
  }
}

// Pipe personalizado para la lógica de negocio
@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    return date;
  }
}

@Get('reports')
async getReports(
  @Query('from', ParseDatePipe) from: Date,
  @Query('to', ParseDatePipe) to: Date,
): Promise<Report[]> {
  return this.reportsService.findBetween(from, to);
}

// Pipes de transformación personalizados
@Injectable()
export class NormalizeEmailPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value) return value;
    return value.trim().toLowerCase();
  }
}

// Parsea valores separados por comas
@Injectable()
export class ParseArrayPipe implements PipeTransform<string, string[]> {
  transform(value: string): string[] {
    if (!value) return [];
    return value.split(',').map((v) => v.trim()).filter(Boolean);
  }
}

@Get('products')
async findProducts(
  @Query('ids', ParseArrayPipe) ids: string[],
  @Query('email', NormalizeEmailPipe) email: string,
): Promise<Product[]> {
  // ids ya es un array, email está normalizado
  return this.productsService.findByIds(ids);
}

// Sanitiza el input HTML
@Injectable()
export class SanitizeHtmlPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value) return value;
    return sanitizeHtml(value, { allowedTags: [] });
  }
}

// Validation pipe global con transformación
// Transforma automáticamente a los tipos declarados en cada schema de zod
app.useGlobalPipes(new ZodValidationPipe());

// DTO con la transformación integrada en el schema
// z.object() elimina las propiedades que no son del DTO, z.strictObject() lanza una excepción ante propiedades adicionales
const findProductsSchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1), // Convierte los query strings en números

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().toLowerCase().optional(),

  categories: z
    .string()
    .transform((value) => value.split(','))
    .pipe(z.array(z.string()))
    .optional(),
});

export class FindProductsDto extends createZodDto(findProductsSchema) {}

@Get()
async findAll(@Query() dto: FindProductsDto): Promise<Product[]> {
  // dto ya está transformado y validado
  return this.productsService.findAll(dto);
}

// Personalización de los errores del pipe
@Injectable()
export class CustomParseIntPipe extends ParseIntPipe {
  constructor() {
    super({
      exceptionFactory: (error) =>
        new BadRequestException(`${error} must be a valid integer`),
    });
  }
}

// O usa opciones en los pipes integrados
@Get(':id')
async findOne(
  @Param(
    'id',
    new ParseIntPipe({
      errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      exceptionFactory: () => new NotAcceptableException('ID must be numeric'),
    }),
  )
  id: number,
): Promise<Item> {
  return this.itemsService.findOne(id);
}
```

Referencia: [NestJS Pipes](https://docs.nestjs.com/pipes)
