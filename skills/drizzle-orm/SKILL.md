---
name: drizzle-orm
description: >
  Lightweight TypeScript ORM with SQL-like query builder. Use when: building type-safe database queries, defining schemas in TypeScript, needing zero-overhead SQL generation with Postgres/MySQL/SQLite. NOT for: NoSQL databases, projects requiring Active Record pattern, heavy data-mapper abstractions.
---

# drizzle-orm

## Overview
Drizzle ORM is a lightweight, type-safe TypeScript ORM that embraces SQL rather than abstracting it away. It provides a SQL-like query builder that maps directly to SQL, schema declarations using TypeScript functions (`pgTable`, `mysqlTable`, `sqliteTable`), and a migration toolkit via `drizzle-kit`. Queries are fully type-inferred from your schema with zero runtime overhead.

## Installation
```bash
# Core ORM + your database driver
npm install drizzle-orm pg           # PostgreSQL
npm install drizzle-orm mysql2       # MySQL
npm install drizzle-orm better-sqlite3  # SQLite

# Migration toolkit (dev dependency)
npm install -D drizzle-kit
```

## Core API / Commands

### Schema Declaration (PostgreSQL)
```ts
import { pgTable, serial, text, integer, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  age: integer('age'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  publishedAt: timestamp('published_at'),
});
```

### Connecting to a Database
```ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });
```

### Basic Queries
```ts
import { eq, gt, like, and, or, desc, count } from 'drizzle-orm';

// SELECT
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.id, 1));

// INSERT
const inserted = await db.insert(users).values({
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
}).returning();

// UPDATE
await db.update(users)
  .set({ active: false })
  .where(eq(users.id, 1));

// DELETE
await db.delete(users).where(eq(users.id, 1));
```

## Common Patterns

### Joins and Filtering
```ts
const result = await db
  .select({
    postTitle: posts.title,
    authorName: users.name,
  })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .where(and(
    gt(users.age, 18),
    like(posts.title, '%typescript%'),
  ))
  .orderBy(desc(posts.publishedAt))
  .limit(10);
```

### Relations (Relational Query API)
```ts
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

// Query with relations (requires schema passed to drizzle())
const usersWithPosts = await db.query.users.findMany({
  with: { posts: true },
  where: eq(users.active, true),
});
```

### Transactions and Prepared Statements
```ts
// Transaction
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({ name: 'Bob', email: 'bob@example.com' }).returning();
  await tx.insert(posts).values({ title: 'First Post', authorId: user.id });
});

// Prepared statement
const getUserById = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder('id')))
  .prepare('get_user_by_id');

const user = await getUserById.execute({ id: 42 });
```

## Configuration

### drizzle.config.ts (for drizzle-kit)
```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Migration Commands
```bash
npx drizzle-kit generate    # Generate SQL migration files from schema changes
npx drizzle-kit migrate     # Apply pending migrations
npx drizzle-kit push        # Push schema directly (dev only, no migration files)
npx drizzle-kit studio      # Open Drizzle Studio GUI
npx drizzle-kit introspect  # Generate schema from existing database
```

## Tips & Gotchas
- Always pass `{ schema }` to `drizzle()` if you want to use the relational query API (`db.query.*`); without it, only the SQL-like API works.
- `sql.placeholder()` names must match the keys you pass to `.execute()` -- mismatches silently produce `undefined` values.
- `.returning()` is supported on PostgreSQL and SQLite but NOT on MySQL; use `insertId` from the result instead for MySQL.
- Use `.$inferSelect` and `.$inferInsert` on tables to extract TypeScript types: `type User = typeof users.$inferSelect;`.
- `drizzle-kit push` is great for prototyping but skips migration history -- use `generate` + `migrate` for production.
- Drizzle does not auto-pluralize or transform table/column names; what you write in the schema string is the exact SQL name.
- For bulk inserts, pass an array to `.values([...])` -- Drizzle batches them into a single INSERT statement.
- When using `onConflictDoUpdate`, the `target` must reference columns with a unique constraint or primary key.
