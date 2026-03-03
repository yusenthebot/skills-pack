---
name: typeorm
description: >
  Full-featured TypeScript ORM supporting Active Record and Data Mapper patterns. Use when: building apps with SQL databases using decorators, defining entity relations, generating migrations, using QueryBuilder for complex queries. NOT for: NoSQL databases (except basic MongoDB support), projects avoiding decorator syntax, lightweight query needs.
---

# typeorm

## Overview
TypeORM is a comprehensive ORM for TypeScript and JavaScript that supports both Active Record and Data Mapper patterns. It works with PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, Oracle, and has experimental MongoDB support. TypeORM uses decorators to define entities and relations, provides a powerful QueryBuilder, handles migrations, and supports subscribers for lifecycle events.

## Installation
```bash
npm install typeorm reflect-metadata
npm install pg                      # PostgreSQL
# or: mysql2, better-sqlite3, mssql, oracledb

# TypeScript requirements
npm install -D typescript @types/node
```

In your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false
  }
}
```

## Core API / Commands

### DataSource Configuration
```ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Post } from './entities/Post';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'app',
  password: 'secret',
  database: 'myapp',
  synchronize: false,         // NEVER true in production
  logging: true,
  entities: [User, Post],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

await AppDataSource.initialize();
```

### Entity Definitions
```ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @Column()
  authorId: number;
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

### Repository (Data Mapper Pattern)
```ts
const userRepo = AppDataSource.getRepository(User);

// Create
const user = userRepo.create({ name: 'Alice', email: 'alice@example.com' });
await userRepo.save(user);

// Find
const found = await userRepo.findOneBy({ id: 1 });
const users = await userRepo.find({
  where: { active: true },
  order: { name: 'ASC' },
  take: 10,
  skip: 0,
});

// Find with relations
const userWithPosts = await userRepo.findOne({
  where: { id: 1 },
  relations: { posts: true, roles: true },
});

// Update
await userRepo.update(1, { name: 'Alice Updated' });

// Delete
await userRepo.delete(1);
// or soft delete (requires @DeleteDateColumn)
await userRepo.softDelete(1);
```

## Common Patterns

### QueryBuilder
```ts
const users = await userRepo
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')
  .where('user.active = :active', { active: true })
  .andWhere('user.age > :age', { age: 18 })
  .orderBy('user.name', 'ASC')
  .take(10)
  .skip(0)
  .getMany();

// Subquery
const usersWithRecentPosts = await userRepo
  .createQueryBuilder('user')
  .where((qb) => {
    const subQuery = qb.subQuery()
      .select('post.authorId')
      .from(Post, 'post')
      .where('post.createdAt > :date', { date: new Date('2025-01-01') })
      .getQuery();
    return `user.id IN ${subQuery}`;
  })
  .getMany();

// Raw SQL when needed
const result = await AppDataSource.query(
  'SELECT u.*, COUNT(p.id) as post_count FROM "user" u LEFT JOIN post p ON p."authorId" = u.id GROUP BY u.id'
);
```

### Transactions
```ts
// Using transaction manager
await AppDataSource.transaction(async (manager) => {
  const user = manager.create(User, { name: 'Bob', email: 'bob@example.com' });
  await manager.save(user);
  const post = manager.create(Post, { title: 'Hello', author: user });
  await manager.save(post);
});

// Using QueryRunner for manual control
const queryRunner = AppDataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
try {
  await queryRunner.manager.save(User, { name: 'Charlie', email: 'charlie@example.com' });
  await queryRunner.commitTransaction();
} catch (err) {
  await queryRunner.rollbackTransaction();
  throw err;
} finally {
  await queryRunner.release();
}
```

### Migrations
```bash
# Generate migration from entity changes
npx typeorm migration:generate src/migrations/AddUserAge -d src/data-source.ts

# Create empty migration
npx typeorm migration:create src/migrations/SeedData

# Run pending migrations
npx typeorm migration:run -d src/data-source.ts

# Revert last migration
npx typeorm migration:revert -d src/data-source.ts
```

```ts
// Migration file
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAge1234567890 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "age" integer`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "age"`);
  }
}
```

### Subscribers (Lifecycle Hooks)
```ts
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  beforeInsert(event: InsertEvent<User>) {
    console.log('Before insert:', event.entity);
  }

  afterUpdate(event: UpdateEvent<User>) {
    console.log('After update:', event.entity);
  }
}
```

## Configuration

| Option | Description |
|--------|-------------|
| `synchronize: true` | Auto-sync schema (dev only -- **never** in production) |
| `logging: true` | Log all SQL queries |
| `logging: ['query', 'error']` | Log specific categories |
| `migrationsRun: true` | Auto-run migrations on startup |
| `cache: { duration: 30000 }` | Enable query caching (30s) |
| `dropSchema: true` | Drop schema on every init (testing only) |
| `poolSize: 10` | Connection pool size |
| `extra: { max: 20 }` | Pass driver-specific pool options |

## Tips & Gotchas
- **Never** set `synchronize: true` in production -- it can drop columns and lose data. Always use migrations.
- `reflect-metadata` must be imported once at the application entry point before any entity is loaded.
- `tsconfig.json` must have `experimentalDecorators` and `emitDecoratorMetadata` set to `true`; without these, entity decorators silently fail.
- `find({ relations: { posts: true } })` loads relations eagerly; without it, relation properties are `undefined`, not empty arrays.
- `save()` performs an upsert (INSERT or UPDATE) -- it checks for a primary key to decide. Use `insert()` for guaranteed INSERT behavior.
- `remove()` requires loaded entities; `delete()` works with just an ID or conditions and is faster.
- QueryBuilder parameters use `:paramName` syntax (not `$1`), and parameter names must be unique across the entire query including subqueries.
- Lazy relations (`Promise<Post[]>`) require `relation: { lazy: true }` and each access triggers a query -- use `relations` in `find()` or `leftJoinAndSelect` in QueryBuilder for explicit loading instead.
- The CLI (`typeorm`) needs a compiled JS data source file or `ts-node` registered globally; use `npx typeorm-ts-node-commonjs` or `npx typeorm-ts-node-esm` for TypeScript projects.
