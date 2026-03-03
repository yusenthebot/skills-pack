---
name: hono
description: >
  Ultrafast, edge-first web framework supporting Cloudflare Workers, Bun, Deno, and Node.js. Use when: edge computing, multi-runtime APIs, lightweight middleware, Cloudflare Workers apps. NOT for: heavy server-side rendering, monolithic Express migration, apps needing deep Node.js-specific APIs.
---

# hono

## Overview
Hono is a small, fast, and multi-runtime web framework that runs on Cloudflare Workers, Bun, Deno, Fastly, AWS Lambda, and Node.js. It uses Web Standard APIs (Request/Response), has zero dependencies in its core, and provides first-class TypeScript support with type-safe routing and middleware. Hono's router is one of the fastest available, and it includes built-in middleware for common tasks.

## Installation
```bash
# Node.js
npm install hono
# Bun
bun add hono
# Deno
import { Hono } from 'https://deno.land/x/hono/mod.ts'
```

## Core API / Commands

### Basic app
```ts
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Hello Hono!'));
app.get('/json', (c) => c.json({ message: 'Hello' }));
app.get('/html', (c) => c.html('<h1>Hello</h1>'));

export default app;
```

### Routing
```ts
const app = new Hono();

// Path parameters
app.get('/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ id });
});

// Query parameters
app.get('/search', (c) => {
  const q = c.req.query('q');
  const page = c.req.query('page') ?? '1';
  return c.json({ q, page });
});

// Multiple methods
app.post('/users', async (c) => {
  const body = await c.req.json();
  return c.json(body, 201);
});

// Wildcard
app.get('/files/*', (c) => {
  return c.text(`Path: ${c.req.path}`);
});

// Route grouping
const api = new Hono();
api.get('/users', (c) => c.json([]));
api.get('/posts', (c) => c.json([]));
app.route('/api', api);
```

### Context object (c)
```ts
app.post('/example', async (c) => {
  // Request
  const body = await c.req.json();
  const formData = await c.req.formData();
  const header = c.req.header('Authorization');
  const url = c.req.url;
  const method = c.req.method;

  // Response helpers
  return c.json({ data: 'value' }, 200);
  return c.text('plain text');
  return c.html('<p>HTML</p>');
  return c.redirect('/other');
  return c.notFound();
  return c.body(null, 204);

  // Headers
  c.header('X-Custom', 'value');
  c.status(201);
});
```

## Common Patterns

### Middleware
```ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { bearerAuth } from 'hono/bearer-auth';
import { secureHeaders } from 'hono/secure-headers';

const app = new Hono();

// Built-in middleware
app.use('*', logger());
app.use('*', cors({ origin: 'http://localhost:3000' }));
app.use('*', secureHeaders());
app.use('/api/*', prettyJSON());
app.use('/admin/*', bearerAuth({ token: 'my-secret-token' }));

// Custom middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  c.header('X-Response-Time', `${ms}ms`);
});
```

### Validation with Zod
```ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono();

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

app.post(
  '/users',
  zValidator('json', createUserSchema),
  (c) => {
    const data = c.req.valid('json'); // Fully typed
    return c.json({ id: 1, ...data }, 201);
  }
);

// Validate query params
const searchSchema = z.object({
  q: z.string(),
  page: z.coerce.number().default(1),
});

app.get(
  '/search',
  zValidator('query', searchSchema),
  (c) => {
    const { q, page } = c.req.valid('query');
    return c.json({ q, page });
  }
);
```

### Runtime adapters
```ts
// Cloudflare Workers
export default app;

// Node.js
import { serve } from '@hono/node-server';
serve({ fetch: app.fetch, port: 3000 });

// Bun
export default { port: 3000, fetch: app.fetch };

// Deno
Deno.serve({ port: 3000 }, app.fetch);

// AWS Lambda
import { handle } from 'hono/aws-lambda';
export const handler = handle(app);
```

### JSX support
```tsx
import { Hono } from 'hono';
import { html } from 'hono/html';

const app = new Hono();

const Layout = (props: { children: any }) => html`
  <!DOCTYPE html>
  <html><body>${props.children}</body></html>
`;

app.get('/', (c) => {
  return c.html(
    <Layout>
      <h1>Hello from Hono JSX!</h1>
    </Layout>
  );
});
```

## Configuration

### App options
```ts
const app = new Hono({
  strict: true,   // Distinguish /path and /path/
  router: new RegExpRouter(),  // Choose router implementation
  getPath: (req) => req.url.replace(/^https?:\/\/[^/]+/, ''),
});
```

### tsconfig.json for JSX
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

## Tips & Gotchas
- Hono uses Web Standard APIs (Request/Response), not Node.js APIs -- `c.req` is NOT the same as Express's `req`. Use `c.req.json()`, `c.req.text()`, etc.
- The context object `c` is unique per request. Do not store it globally or share it between requests.
- `c.req.json()`, `c.req.text()`, and `c.req.formData()` return Promises -- always `await` them.
- Middleware must call `await next()` to continue to the next handler. Omitting `next()` short-circuits the chain.
- Built-in middleware (logger, cors, bearerAuth, etc.) is imported from `hono/<name>`, not from the main `hono` module.
- Use `@hono/zod-validator` for type-safe request validation. The validated data is available via `c.req.valid('json')`.
- Hono's RPC mode with `hc` (hono client) provides end-to-end type safety similar to tRPC.
- Error handling: use `app.onError((err, c) => { ... })` to define a global error handler.
- For Node.js, install `@hono/node-server` separately. The core `hono` package does not include a Node server.
- Hono's `app.route('/prefix', subApp)` is the way to organize routes into separate files -- it replaces Express's `Router`.
