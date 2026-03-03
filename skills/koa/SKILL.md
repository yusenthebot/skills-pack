---
name: koa
description: >
  Expressive async middleware framework for Node.js by the Express team. Use when: async-first APIs, middleware composition, lightweight HTTP server, custom framework building. NOT for: batteries-included APIs (use Fastify/NestJS), beginners needing built-in routing/body parsing.
---

# koa

## Overview
Koa is a minimalist web framework designed by the team behind Express. It leverages async/await for cleaner middleware composition and eliminates callbacks. Koa does not bundle any middleware -- it provides only the core context (`ctx`) object and middleware cascading. You add routing, body parsing, and other features through separate packages like `koa-router` and `koa-body`.

## Installation
```bash
npm install koa
# Common companion packages:
npm install @koa/router koa-body koa-static
# TypeScript types
npm install --save-dev @types/koa @types/koa__router
```

## Core API / Commands

### Basic server
```js
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx) => {
  ctx.body = 'Hello Koa';
});

app.listen(3000);
```

### The ctx object
```js
app.use(async (ctx) => {
  // Request properties
  ctx.request.method;         // 'GET'
  ctx.request.url;            // '/path?q=1'
  ctx.request.path;           // '/path'
  ctx.request.query;          // { q: '1' }
  ctx.request.headers;        // request headers
  ctx.request.ip;             // client IP

  // Shortcuts (aliases to ctx.request.*)
  ctx.method;
  ctx.url;
  ctx.path;
  ctx.query;
  ctx.headers;
  ctx.ip;

  // Response
  ctx.status = 200;
  ctx.body = { message: 'ok' };       // JSON (auto Content-Type)
  ctx.body = 'text';                   // text/plain
  ctx.body = '<h1>HTML</h1>';          // text/html
  ctx.body = fs.createReadStream(path); // stream

  ctx.set('X-Custom-Header', 'value');
  ctx.type = 'application/json';
  ctx.redirect('/other');
});
```

### Async middleware cascade
```js
// Middleware executes "downstream", then control flows "upstream"
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();  // Pass control to next middleware
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(async (ctx, next) => {
  await next();
});

app.use(async (ctx) => {
  ctx.body = 'Hello World';
});
```

## Common Patterns

### Routing with @koa/router
```js
const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

router.get('/users', async (ctx) => {
  ctx.body = [{ id: 1, name: 'Alice' }];
});

router.get('/users/:id', async (ctx) => {
  ctx.body = { id: ctx.params.id };
});

router.post('/users', async (ctx) => {
  const body = ctx.request.body;
  ctx.status = 201;
  ctx.body = { id: 1, ...body };
});

// Nested routers
const apiRouter = new Router({ prefix: '/api' });
apiRouter.use('/users', router.routes(), router.allowedMethods());

app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

app.listen(3000);
```

### Body parsing and middleware stack
```js
const Koa = require('koa');
const { koaBody } = require('koa-body');
const serve = require('koa-static');
const cors = require('@koa/cors');

const app = new Koa();

// Middleware stack
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(koaBody({ multipart: true, formidable: { maxFileSize: 10 * 1024 * 1024 } }));
app.use(serve('./public'));

// Routes...
app.listen(3000);
```

### Error handling
```js
// Global error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };
    ctx.app.emit('error', err, ctx);
  }
});

// Throwing errors
app.use(async (ctx) => {
  ctx.throw(404, 'User not found');
  ctx.throw(403, 'Forbidden');
  // or
  const err = new Error('Bad request');
  err.status = 400;
  throw err;
});

// Error event listener
app.on('error', (err, ctx) => {
  console.error('Server error:', err.message);
});
```

### Shared state with ctx.state
```js
// Auth middleware sets user on ctx.state
const auth = async (ctx, next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');
  if (!token) ctx.throw(401, 'No token provided');
  ctx.state.user = await verifyToken(token);
  await next();
};

router.get('/profile', auth, async (ctx) => {
  ctx.body = ctx.state.user; // Available from auth middleware
});
```

## Configuration

Koa has minimal configuration. Most settings come from middleware packages.

```js
const app = new Koa();

app.proxy = true;              // Trust X-Forwarded-* headers (behind reverse proxy)
app.env = 'production';        // Defaults to NODE_ENV or 'development'
app.silent = true;             // Suppress default error logging to stderr
app.keys = ['secret1', 'secret2']; // Keys for signed cookies

// Signed cookies
ctx.cookies.set('session', 'value', { signed: true });
ctx.cookies.get('session', { signed: true });
```

## Tips & Gotchas
- Koa has NO built-in router, body parser, or static file serving. Install `@koa/router`, `koa-body`, and `koa-static` separately.
- Middleware must call `await next()` to pass control downstream. Forgetting `next()` means subsequent middleware never runs.
- The "onion" model means code AFTER `await next()` runs after downstream middleware, making it ideal for timing, logging, and response modification.
- `ctx.body = object` automatically sets Content-Type to `application/json`. Setting `ctx.body = string` sets it to `text/plain` or `text/html` if it contains HTML tags.
- Use `ctx.state` to pass data between middleware (e.g., authenticated user). Do not attach data directly to `ctx`.
- `ctx.throw(status, message)` is the idiomatic way to throw HTTP errors. It creates an error with a `.status` property.
- Koa requires Node.js 12+ (for async/await). Unlike Express, there are no callback-style middleware -- everything is async.
- Use `@koa/cors` (scoped package) not the older `koa-cors` which is unmaintained.
- `ctx.request.body` contains the parsed body (from koa-body). `ctx.body` is a SETTER for the response body -- do not confuse them.
- Koa 2.x uses async middleware. Koa 1.x used generators -- make sure you are using Koa 2 syntax.
