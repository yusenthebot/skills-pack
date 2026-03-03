---
name: h3
description: >
  Minimal HTTP framework for high performance and portability. Use when: Nitro/Nuxt server routes, edge-compatible APIs, universal handlers across Node/Bun/Deno/Workers. NOT for: complex monolithic apps (use Fastify/Express).
---

# h3

> v2.0.1 — Minimal H(TTP) framework for high performance and portability

## Installation
```bash
npm install h3
```

## Core API

```ts
import { createApp, createRouter, defineEventHandler, readBody, getQuery } from 'h3';

const app = createApp();
const router = createRouter();

router.get('/', defineEventHandler(() => 'Hello World!'));

router.get('/users/:id', defineEventHandler((event) => {
  const id = event.context.params?.id;
  const query = getQuery(event);  // { page: '1' }
  return { id, ...query };
}));

router.post('/users', defineEventHandler(async (event) => {
  const body = await readBody(event);
  return { created: body };
}));

app.use(router);
```

## Request Helpers

```ts
import {
  getQuery,          // URL query params
  getRouterParam,    // route params (:id)
  readBody,          // parse JSON body
  readFormData,      // parse FormData
  getCookie,         // read cookie
  getHeader,         // read header
  getRequestIP,      // client IP
} from 'h3';
```

## Response Helpers

```ts
import {
  setResponseHeader,
  setResponseStatus,
  sendRedirect,
  setCookie,
} from 'h3';

defineEventHandler((event) => {
  setResponseHeader(event, 'X-Custom', 'value');
  setResponseStatus(event, 201);
  setCookie(event, 'session', 'token', { httpOnly: true });
  return { ok: true };
});
```

## Middleware

```ts
import { defineEventHandler, createApp } from 'h3';

const app = createApp({
  onError(error, event) {
    console.error(error);
  },
});

app.use(defineEventHandler((event) => {
  console.log(`${event.method} ${event.path}`);
  // return nothing to continue to next handler
}));
```

## Adapters

```ts
// Node.js
import { createServer } from 'node:http';
import { toNodeListener } from 'h3';
createServer(toNodeListener(app)).listen(3000);

// Bun
export default { fetch: app.fetch, port: 3000 };

// Cloudflare Workers
export default { fetch: app.fetch };
```

## Tips & Gotchas
- h3 is the foundation of Nitro and Nuxt server routes — same API
- `readBody()` parses JSON, text, and FormData automatically based on Content-Type
- Return a value from handler instead of using `res.send()` — h3 handles serialization
- Use `createError({ statusCode, message })` for HTTP errors
- Compatible with web standards (Request/Response) via adapters
