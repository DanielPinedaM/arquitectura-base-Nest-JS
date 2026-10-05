---
title: Usa el Repository Pattern para el acceso a datos
impact: CRITICAL
impactDescription: Desacopla la lógica de negocio de la base de datos
tags: architecture, repository, data-access
---

## Usa el Repository Pattern para el acceso a datos

Crea repositories personalizados para encapsular las queries complejas y la lógica de la base de datos. Esto mantiene los servicios enfocados en la lógica de negocio, facilita el testing con repositories mock y permite cambiar las implementaciones de la base de datos sin afectar al código de negocio.

**Incorrecto (queries complejas en los servicios):**

```typescript
// Queries complejas en los servicios
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
  ) {}

  async findActiveWithOrders(minOrders: number): Promise<User[]> {
    // Lógica de queries compleja mezclada con lógica de negocio
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'order')
      .where('user.isActive = :active', { active: true })
      .andWhere('user.deletedAt IS NULL')
      .groupBy('user.id')
      .having('COUNT(order.id) >= :min', { min: minOrders })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  // El servicio se sobrecarga con lógica de queries
}
```

**Correcto (repository personalizado con queries encapsuladas):**

```typescript
// Repository personalizado con queries encapsuladas
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findActiveWithMinOrders(minOrders: number): Promise<User[]> {
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'order')
      .where('user.isActive = :active', { active: true })
      .andWhere('user.deletedAt IS NULL')
      .groupBy('user.id')
      .having('COUNT(order.id) >= :min', { min: minOrders })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }
}

// Servicio limpio, solo con lógica de negocio
@Injectable()
export class UsersService {
  constructor(private usersRepo: UsersRepository) {}

  async getActiveUsersWithOrders(): Promise<User[]> {
    return this.usersRepo.findActiveWithMinOrders(1);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = new User();
    user.email = dto.email;
    user.name = dto.name;
    return this.usersRepo.save(user);
  }
}
```

Referencia: [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
