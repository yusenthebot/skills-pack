---
name: prisma
description: >
  TypeScript ORM with type-safe queries. Use when: relational database access, migrations, type-safe queries with autocomplete. NOT for: NoSQL databases, simple scripts without migrations, performance-critical bulk operations.
---

# prisma

## Installation
```bash
npm install prisma @prisma/client
npx prisma init  # creates prisma/schema.prisma + .env
```

## Schema (prisma/schema.prisma)

```prisma
datasource db {
  provider = "postgresql"  // sqlite, mysql, sqlserver
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

## Core Client

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CRUD
const user = await prisma.user.create({
  data: { email: 'alice@example.com', name: 'Alice' },
});

const users = await prisma.user.findMany({
  where: { posts: { some: { published: true } } },
  include: { posts: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
});

await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Alice Updated' },
});

await prisma.user.delete({ where: { id: 1 } });
```

## Common Patterns

### Singleton (avoid too many connections)
```ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Transactions
```ts
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'bob@example.com' } }),
  prisma.post.create({ data: { title: 'Hello', authorId: 1 } }),
]);

// Interactive transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'carol@example.com' } });
  await tx.post.create({ data: { title: 'Post', authorId: user.id } });
});
```

### Upsert
```ts
await prisma.user.upsert({
  where: { email: 'alice@example.com' },
  update: { name: 'Alice New' },
  create: { email: 'alice@example.com', name: 'Alice New' },
});
```

### Raw queries
```ts
const users = await prisma.$queryRaw`SELECT * FROM "User" WHERE id = ${userId}`;
```

## Migrations

```bash
npx prisma migrate dev --name add_user_table   # create + apply migration
npx prisma migrate deploy                       # apply in production
npx prisma db push                             # push without migration (prototyping)
npx prisma studio                              # GUI browser
npx prisma generate                            # regenerate client after schema change
```

## Tips & Gotchas
- Run `prisma generate` after every schema change — client won't update otherwise
- Use `prisma.$disconnect()` in scripts/lambdas to release connections
- `findFirst` vs `findUnique`: `findUnique` only works on `@unique` or `@id` fields
- `include` fetches related records; `select` limits which fields to return (can't use both)
- Prisma's `Int` maps to JavaScript `number` — use `BigInt` field type for large IDs
- For Next.js: use the singleton pattern to avoid "Too many connections" in hot reload
