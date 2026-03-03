---
name: "@trpc/server"
description: >
  End-to-end type-safe API framework. Use when: full-stack TypeScript apps sharing types between client and server, replacing REST with type safety. NOT for: public APIs consumed by third parties, non-TypeScript clients.
---

# @trpc/server

> v11.11.0 — End-to-end typesafe APIs

## Installation
```bash
npm install @trpc/server @trpc/client @trpc/react-query
npm install zod  # for input validation
```

## Server Setup

```ts
// server/trpc.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
```

## Define Router

```ts
// server/router.ts
import { router, publicProcedure } from './trpc';
import { z } from 'zod';

export const appRouter = router({
  user: router({
    list: publicProcedure.query(async () => {
      return db.users.findMany();
    }),
    byId: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return db.users.findUnique({ where: { id: input.id } });
      }),
    create: publicProcedure
      .input(z.object({ name: z.string(), email: z.string().email() }))
      .mutation(async ({ input }) => {
        return db.users.create({ data: input });
      }),
  }),
});

export type AppRouter = typeof appRouter;
```

## HTTP Adapter (Express)

```ts
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express from 'express';
import { appRouter } from './router';

const app = express();
app.use('/trpc', createExpressMiddleware({ router: appRouter }));
```

## Client (React)

```ts
// client/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/router';

export const trpc = createTRPCReact<AppRouter>();

// Usage in component:
const { data: users } = trpc.user.list.useQuery();
const createUser = trpc.user.create.useMutation();

await createUser.mutateAsync({ name: 'Alice', email: 'alice@test.com' });
```

## Auth Middleware

```ts
const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { user: ctx.session.user } });
});

export const protectedProcedure = t.procedure.use(isAuthed);
```

## Tips & Gotchas
- `AppRouter` type must be exported and imported by client — never the actual router implementation
- Mutations use `.useMutation()`, queries use `.useQuery()` on client
- Input validation with Zod is the standard pattern — enforced on server automatically
- Use `@trpc/server/adapters/next` for Next.js API routes
- tRPC v11 supports React Server Components via `@trpc/react-query/rsc`
