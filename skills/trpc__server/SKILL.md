---
name: "@trpc/server"
description: >
  End-to-end typesafe API framework for TypeScript, sharing types between client and server with zero code generation. Use when: full-stack TypeScript apps, type-safe RPCs, Next.js/React apps needing typed API layer. NOT for: public REST APIs, non-TypeScript clients, GraphQL-style APIs.
---

# @trpc/server

## Overview
tRPC lets you build fully typesafe APIs without schemas, code generation, or runtime overhead. You define procedures (queries, mutations) on the server, and the TypeScript compiler automatically infers the types on the client. This means any change to your API contract is immediately caught by TypeScript. tRPC works with any framework via adapters (Express, Fastify, Next.js, etc.).

## Installation
```bash
# Server
npm install @trpc/server zod
# Client
npm install @trpc/client @trpc/react-query @tanstack/react-query
```

## Core API / Commands

### Initialize tRPC
```ts
// server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

// Create context type
interface Context {
  user?: { id: string; name: string };
  db: DatabaseClient;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
```

### Define a router
```ts
// server/routers/user.ts
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const userRouter = router({
  // Query (GET-like)
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany();
  }),

  // Query with input
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { id: input.id } });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
      return user;
    }),

  // Mutation (POST-like)
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({ data: input });
    }),

  // Mutation with output validation
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
```

### Merge routers
```ts
// server/routers/_app.ts
import { router } from '../trpc';
import { userRouter } from './user';
import { postRouter } from './post';

export const appRouter = router({
  user: userRouter,
  post: postRouter,
});

// Export the type for the client
export type AppRouter = typeof appRouter;
```

## Common Patterns

### Middleware and protected procedures
```ts
import { TRPCError } from '@trpc/server';

const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,  // user is now non-nullable in downstream
    },
  });
});

export const protectedProcedure = publicProcedure.use(isAuthed);

// Usage
export const postRouter = router({
  create: protectedProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ctx.user is guaranteed to exist here
      return ctx.db.post.create({
        data: { ...input, authorId: ctx.user.id },
      });
    }),
});
```

### Adapters
```ts
// Express adapter
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

const app = express();
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }) => ({
      user: req.user,
      db: prisma,
    }),
  })
);
app.listen(3000);

// Next.js App Router adapter
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
```

### Client usage (React)
```ts
// utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();

// Component
function UserList() {
  const { data, isLoading } = trpc.user.list.useQuery();
  const createUser = trpc.user.create.useMutation({
    onSuccess: () => utils.user.list.invalidate(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map(user => <p key={user.id}>{user.name}</p>)}
      <button onClick={() => createUser.mutate({ name: 'Bob', email: 'bob@example.com' })}>
        Add User
      </button>
    </div>
  );
}
```

### Vanilla client (no React)
```ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers/_app';

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({ url: 'http://localhost:3000/trpc' }),
  ],
});

const users = await client.user.list.query();
const newUser = await client.user.create.mutate({ name: 'Alice', email: 'alice@example.com' });
```

## Configuration

### Error handling
```ts
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    };
  },
});
```

### tRPC error codes
| Code | HTTP Status | Use case |
|------|------------|----------|
| `BAD_REQUEST` | 400 | Invalid input |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_SERVER_ERROR` | 500 | Server errors |

## Tips & Gotchas
- tRPC requires both client and server to be in the same TypeScript project (or monorepo) for type inference to work. It is NOT for public APIs consumed by third parties.
- Always validate inputs with Zod (or another validator). The `.input()` call defines both runtime validation and TypeScript types.
- Use `httpBatchLink` on the client to automatically batch multiple simultaneous requests into a single HTTP call.
- The `AppRouter` type is exported from the server but only used as a TYPE import on the client -- no server code is bundled into the client.
- Middleware in tRPC uses a functional pattern: call `next()` and return its result. You can modify the context by passing a new `ctx` to `next()`.
- Use `TRPCError` with proper error codes instead of throwing generic errors -- this ensures proper HTTP status codes in the response.
- tRPC v11 uses the fetch adapter by default for modern runtimes. The Express/Fastify adapters are separate imports.
- For subscriptions (real-time), use `@trpc/server`'s subscription procedure with WebSocket or SSE transport.
- Output validation (`.output()`) is optional but useful for ensuring your API never leaks sensitive fields.
- Use `trpc.useUtils()` (React) to access cache utilities like `invalidate()`, `setData()`, and `prefetch()`.
