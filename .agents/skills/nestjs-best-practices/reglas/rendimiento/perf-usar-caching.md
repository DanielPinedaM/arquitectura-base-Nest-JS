---
title: Usa el caching de forma estratégica
impact: HIGH
impactDescription: Reduce drásticamente la carga de la base de datos y los tiempos de respuesta
tags: performance, caching, redis, optimization
---

## Usa el caching de forma estratégica

Implementa caching para las operaciones costosas, los datos a los que se accede con frecuencia y las llamadas a APIs externas. Usa el CacheModule de NestJS con TTLs apropiados y estrategias de invalidación de la caché. No cachees todo; enfócate en las áreas de alto impacto.

**Incorrecto (sin caching o cachear todo):**

```typescript
// Sin caching para queries costosas y repetidas
@Injectable()
export class ProductsService {
  async getPopular(): Promise<Product[]> {
    // Ejecuta una query de agregación compleja en CADA petición
    return this.productsRepo
      .createQueryBuilder('p')
      .leftJoin('p.orders', 'o')
      .select('p.*, COUNT(o.id) as orderCount')
      .groupBy('p.id')
      .orderBy('orderCount', 'DESC')
      .limit(20)
      .getMany();
  }
}

// Cachea todo sin pensarlo
@Injectable()
export class UsersService {
  @CacheKey('users')
  @CacheTTL(3600)
  @UseInterceptors(CacheInterceptor)
  async findAll(): Promise<User[]> {
    // Cachear la lista de usuarios durante 1 hora es incorrecto si los datos cambian con frecuencia
    return this.usersRepo.find();
  }
}
```

**Correcto (caching estratégico con una invalidación correcta):**

```typescript
// Configura el módulo de caching
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: [
          new KeyvRedis(config.get('REDIS_URL')),
        ],
        ttl: 60 * 1000, // 60s por defecto
      }),
    }),
  ],
})
export class AppModule {}

// Caching manual para un control granular
@Injectable()
export class ProductsService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private productsRepo: ProductRepository,
  ) {}

  async getPopular(): Promise<Product[]> {
    const cacheKey = 'products:popular';

    // Intenta primero con la caché
    const cached = await this.cache.get<Product[]>(cacheKey);
    if (cached) return cached;

    // Cache miss - obtiene los datos y los cachea
    const products = await this.fetchPopularProducts();
    await this.cache.set(cacheKey, products, 5 * 60 * 1000); // TTL de 5 min
    return products;
  }

  // Invalida la caché cuando hay cambios
  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productsRepo.save({ id, ...dto });
    await this.cache.del('products:popular'); // Invalida
    return product;
  }
}

// Caching basado en decoradores con interceptor automático
@Controller('categories')
@UseInterceptors(CacheInterceptor)
export class CategoriesController {
  @Get()
  @CacheTTL(30 * 60 * 1000) // 30 minutos - las categorías cambian rara vez
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @CacheTTL(60 * 1000) // 1 minuto
  @CacheKey('category')
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }
}

// Invalidación de la caché basada en eventos
@Injectable()
export class CacheInvalidationService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  @OnEvent('product.created')
  @OnEvent('product.updated')
  @OnEvent('product.deleted')
  async invalidateProductCaches(event: ProductEvent) {
    await Promise.all([
      this.cache.del('products:popular'),
      this.cache.del(`product:${event.productId}`),
    ]);
  }
}
```

Referencia: [NestJS Caching](https://docs.nestjs.com/techniques/caching)
