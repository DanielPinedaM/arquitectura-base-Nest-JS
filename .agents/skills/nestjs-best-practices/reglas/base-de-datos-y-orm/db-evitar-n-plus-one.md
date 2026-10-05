---
title: Evita los problemas de queries N+1
impact: HIGH
impactDescription: Las queries N+1 son uno de los asesinos del rendimiento más comunes
tags: database, n-plus-one, queries, performance
---

## Evita los problemas de queries N+1

Las queries N+1 ocurren cuando obtienes una lista de entidades y luego haces una query adicional por cada entidad para cargar los datos relacionados. Usa eager loading con `relations`, joins con el query builder o DataLoader para agrupar las queries de forma eficiente.

**Incorrecto (el lazy loading dentro de bucles provoca N+1):**

```typescript
// El lazy loading dentro de bucles provoca N+1
@Injectable()
export class OrdersService {
  async getOrdersWithItems(userId: string): Promise<Order[]> {
    const orders = await this.orderRepo.find({ where: { userId } });
    // 1 query para las órdenes

    for (const order of orders) {
      // N queries adicionales - ¡una por orden!
      order.items = await this.itemRepo.find({ where: { orderId: order.id } });
    }

    return orders;
  }
}

// Acceder a relaciones lazy sin cargarlas
@Controller('users')
export class UsersController {
  @Get()
  async findAll(): Promise<User[]> {
    const users = await this.userRepo.find();
    // Si User.posts usa lazy loading, la serialización dispara N queries
    return users; // Cada acceso a user.posts = 1 query
  }
}
```

**Correcto (usa relations para el eager loading):**

```typescript
// Usa la opción relations para el eager loading
@Injectable()
export class OrdersService {
  async getOrdersWithItems(userId: string): Promise<Order[]> {
    // Una sola query con JOIN
    return this.orderRepo.find({
      where: { userId },
      relations: ['items', 'items.product'],
    });
  }
}

// Usa QueryBuilder para joins complejos
@Injectable()
export class UsersService {
  async getUsersWithPostCounts(): Promise<UserWithPostCount[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.posts', 'post')
      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect('COUNT(post.id)', 'postCount')
      .groupBy('user.id')
      .getRawMany();
  }

  async getActiveUsersWithPosts(): Promise<User[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .leftJoinAndSelect('post.comments', 'comment')
      .where('user.isActive = :active', { active: true })
      .andWhere('post.status = :status', { status: 'published' })
      .getMany();
  }
}

// Usa las opciones de find para campos específicos
async getOrderSummaries(userId: string): Promise<OrderSummary[]> {
  return this.orderRepo.find({
    where: { userId },
    relations: ['items'],
    select: {
      id: true,
      total: true,
      status: true,
      items: {
        id: true,
        quantity: true,
        price: true,
      },
    },
  });
}

// Usa DataLoader en GraphQL para agrupar y cachear las queries
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class PostsLoader {
  constructor(private postsService: PostsService) {}

  readonly batchPosts = new DataLoader<string, Post[]>(async (userIds) => {
    // Una sola query para los posts de todos los usuarios
    const posts = await this.postsService.findByUserIds([...userIds]);

    // Agrupa por userId
    const postsMap = new Map<string, Post[]>();
    for (const post of posts) {
      const userPosts = postsMap.get(post.userId) || [];
      userPosts.push(post);
      postsMap.set(post.userId, userPosts);
    }

    // Devuelve en el mismo orden que el input
    return userIds.map((id) => postsMap.get(id) || []);
  });
}

// En el resolver
@ResolveField()
async posts(@Parent() user: User): Promise<Post[]> {
  // DataLoader agrupa múltiples llamadas en una sola query
  return this.postsLoader.batchPosts.load(user.id);
}

// Habilita el logging de queries en desarrollo para detectar N+1
TypeOrmModule.forRoot({
  logging: ['query', 'error'],
  logger: 'advanced-console',
});
```

Referencia: [TypeORM Relations](https://typeorm.io/relations)
