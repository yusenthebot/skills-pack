---
name: elysia
description: >
  Ergonomic Bun-first web framework. Use when: Bun-based APIs, type-safe routing with end-to-end types, high performance. NOT for: Node.js-only environments (use Fastify/Hono instead).
---

# elysia

> v1.4.27 — Ergonomic Framework for Human (Bun-first)

## Installation
```bash
bun add elysia
```

## Core API

```ts
import { Elysia, t } from 'elysia';

const app = new Elysia()
  .get('/', () => 'Hello Elysia')
  .get('/users/:id', ({ params: { id } }) => ({ id }))
  .post('/users', ({ body }) => body, {
    body: t.Object({
      name: t.String(),
      age: t.Number(),
    }),
  })
  .listen(3000);

console.log(`🦊 Running at ${app.server?.url}`);
```

## TypeBox Validation (built-in)

```ts
import { Elysia, t } from 'elysia';

new Elysia()
  .post('/login', ({ body }) => {
    // body is typed: { email: string, password: string }
    return authenticate(body);
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
    }),
    response: t.Object({
      token: t.String(),
      user: t.Object({ id: t.Number(), name: t.String() }),
    }),
  });
```

## Plugins & Middleware

```ts
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

new Elysia()
  .use(cors())
  .use(swagger())
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET }))
  .post('/sign', ({ jwt, body }) => jwt.sign(body))
  .get('/verify', ({ jwt, query }) => jwt.verify(query.token));
```

## Guards & Auth

```ts
new Elysia()
  .guard({
    beforeHandle({ headers, error }) {
      const auth = headers.authorization;
      if (!auth?.startsWith('Bearer ')) return error(401, 'Unauthorized');
    },
  }, (app) =>
    app
      .get('/protected', () => 'secret data')
      .delete('/resource/:id', ({ params }) => deleteResource(params.id))
  );
```

## Eden (type-safe client)

```ts
// Client gets full type safety from server
import { treaty } from '@elysiajs/eden';
import type { App } from './server';

const api = treaty<App>('localhost:3000');
const { data, error } = await api.users({ id: '1' }).get();
// data is typed based on server response
```

## Tips & Gotchas
- Elysia is optimized for Bun — performance advantage may be smaller on Node.js
- Uses TypeBox (not Zod) for validation — different syntax
- `t.Object()` validates AND provides TypeScript types — no separate type definitions needed
- Lifecycle hooks: `onRequest`, `beforeHandle`, `afterHandle`, `onError`
- Eden client generates types from your app at compile time — requires exporting `typeof app`
