---
title: Usa migraciones de base de datos
impact: HIGH
impactDescription: Permite cambios de schema de la base de datos seguros y repetibles
tags: database, migrations, typeorm, schema
---

## Usa migraciones de base de datos

Nunca uses `synchronize: true` en producción. Usa migraciones para todos los cambios de schema. Las migraciones proporcionan control de versiones para tu base de datos, permiten rollbacks seguros y aseguran la consistencia en todos los entornos.

**Incorrecto (usar synchronize o SQL manual):**

```typescript
// Usa synchronize en producción
TypeOrmModule.forRoot({
  type: 'postgres',
  synchronize: true, // ¡PELIGROSO en producción!
  // Puede eliminar columnas, tablas o datos
});

// SQL manual en producción
@Injectable()
export class DatabaseService {
  async addColumn(): Promise<void> {
    await this.dataSource.query('ALTER TABLE users ADD COLUMN age INT');
    // Sin control de versiones, sin rollback, inconsistente entre entornos
  }
}

// Modifica las entidades sin migración
@Entity()
export class User {
  @Column()
  email: string;

  @Column() // Agregado sin migración
  newField: string; // Hará crash en producción si synchronize es false
}
```

**Correcto (usa migraciones para todos los cambios de schema):**

```typescript
// Configura TypeORM para las migraciones
// data-source.ts
export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false, // Siempre false en producción
  migrationsRun: true, // Ejecuta las migraciones al arrancar
});

// app.module.ts
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get('DB_HOST'),
    synchronize: config.get('NODE_ENV') === 'development', // Solo en dev
    migrations: ['dist/migrations/*.js'],
    migrationsRun: true,
  }),
});

// migrations/1705312800000-AddUserAge.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAge1705312800000 implements MigrationInterface {
  name = 'AddUserAge1705312800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agrega la columna con un valor por defecto para manejar las filas existentes
    await queryRunner.query(`
      ALTER TABLE "users" ADD "age" integer DEFAULT 0
    `);

    // Agrega un índice para las columnas consultadas con frecuencia
    await queryRunner.query(`
      CREATE INDEX "IDX_users_age" ON "users" ("age")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Implementa siempre down para el rollback
    await queryRunner.query(`DROP INDEX "IDX_users_age"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "age"`);
  }
}

// Renombrado seguro de una columna (en dos pasos)
export class RenameNameToFullName1705312900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Paso 1: Agrega la nueva columna
    await queryRunner.query(`
      ALTER TABLE "users" ADD "full_name" varchar(255)
    `);

    // Paso 2: Copia los datos
    await queryRunner.query(`
      UPDATE "users" SET "full_name" = "name"
    `);

    // Paso 3: Agrega la restricción NOT NULL
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "full_name" SET NOT NULL
    `);

    // Paso 4: Elimina la columna anterior (después de verificar que la app funciona)
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "name"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "name" varchar(255)`);
    await queryRunner.query(`UPDATE "users" SET "name" = "full_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "full_name"`);
  }
}
```

Referencia: [TypeORM Migrations](https://typeorm.io/migrations)
