---
title: Optimiza las queries a la base de datos
impact: HIGH
impactDescription: Las queries a la base de datos suelen ser la mayor fuente de latencia
tags: performance, database, queries, optimization
---

## Optimiza las queries a la base de datos

Selecciona solo las columnas necesarias, usa índices apropiados, evita obtener relaciones de más y considera el rendimiento de las queries al diseñar tu acceso a datos. La mayor parte de la lentitud de las APIs se debe a queries ineficientes a la base de datos.

**Incorrecto (obtener datos de más y faltan índices):**

```typescript
// Selecciona todo cuando necesitas pocos campos
@Injectable()
export class UsersService {
  async findAllEmails(): Promise<string[]> {
    const users = await this.repo.find();
    // Obtiene TODAS las columnas de TODOS los usuarios
    return users.map((u) => u.email);
  }

  async getUserSummary(id: string): Promise<UserSummary> {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['posts', 'posts.comments', 'posts.comments.author', 'followers'],
    });
    // Obtiene de más un árbol de relaciones enorme
    return { name: user.name, postCount: user.posts.length };
  }
}

// Sin índices en las columnas consultadas con frecuencia
@Entity()
export class Order {
  @Column()
  userId: string; // Sin índice - escaneo completo de la tabla en cada búsqueda

  @Column()
  status: string; // Sin índice - filtrado por estado lento
}
```

**Correcto (selecciona solo los datos necesarios con índices apropiados):**

```typescript
// Selecciona solo las columnas necesarias
@Injectable()
export class UsersService {
  async findAllEmails(): Promise<string[]> {
    const users = await this.repo.find({
      select: ['email'], // Obtiene solo la columna email
    });
    return users.map((u) => u.email);
  }

  // Usa QueryBuilder para selecciones complejas
  async getUserSummary(id: string): Promise<UserSummary> {
    return this.repo
      .createQueryBuilder('user')
      .select('user.name', 'name')
      .addSelect('COUNT(post.id)', 'postCount')
      .leftJoin('user.posts', 'post')
      .where('user.id = :id', { id })
      .groupBy('user.id')
      .getRawOne();
  }

  // Obtén las relaciones solo cuando sea necesario
  async getFullProfile(id: string): Promise<User> {
    return this.repo.findOne({
      where: { id },
      relations: ['posts'], // Solo la relación inmediata
      select: {
        id: true,
        name: true,
        email: true,
        posts: {
          id: true,
          title: true,
        },
      },
    });
  }
}

// Agrega índices en las columnas consultadas con frecuencia
@Entity()
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['userId', 'status']) // Índice compuesto para un patrón de query común
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Pagina siempre los conjuntos de datos grandes
@Injectable()
export class OrdersService {
  async findAll(page = 1, limit = 20): Promise<PaginatedResult<Order>> {
    const [items, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

Referencia: [TypeORM Query Builder](https://typeorm.io/select-query-builder)
