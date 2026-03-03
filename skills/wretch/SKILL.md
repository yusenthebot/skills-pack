---
name: wretch
description: >
  Tiny, fluent fetch wrapper with intuitive error handling. Use when: wanting a chainable API around fetch with per-status-code error catchers, middleware, and addon support. NOT for: non-fetch environments, projects needing built-in retry without addons.
---

# wretch

## Overview
Wretch is a tiny (~2 KB) wrapper around the Fetch API that provides a fluent, chainable interface with built-in error catchers for specific HTTP status codes. It supports addons for retry, query strings, and form data, as well as middleware for request/response transformation. Wretch works anywhere fetch is available — browsers, Node.js 18+, Deno, and service workers.

## Installation
```bash
npm install wretch
yarn add wretch
pnpm add wretch
```

## Core API / Commands

### Basic Requests
```js
import wretch from 'wretch';

// GET with JSON response
const users = await wretch('https://api.example.com/users')
  .get()
  .json();

// POST with JSON body
const created = await wretch('https://api.example.com/users')
  .post({ name: 'Alice', role: 'admin' })
  .json();

// Other methods
await wretch(url).put({ name: 'Bob' }).json();
await wretch(url).patch({ name: 'Bob' }).json();
await wretch(url).delete().res();
```

### Creating a Reusable Instance
```js
const api = wretch('https://api.example.com/v2')
  .auth(`Bearer ${token}`)
  .headers({ 'Accept': 'application/json' })
  .errorType('json');

const users = await api.url('/users').get().json();
const user = await api.url('/users/42').get().json();
```

## Common Patterns

### Per-Status Error Catchers
```js
const data = await wretch('https://api.example.com/data')
  .get()
  .notFound((error) => {
    console.log('Resource not found');
    return { fallback: true };
  })
  .unauthorized(async (error) => {
    const newToken = await refreshToken();
    return wretch('https://api.example.com/data')
      .auth(`Bearer ${newToken}`)
      .get()
      .json();
  })
  .forbidden(() => {
    throw new Error('Access denied');
  })
  .internalError((error) => {
    console.error('Server error:', error.json);
    return null;
  })
  .json();
```

### Middleware
```js
import wretch from 'wretch';

// Logging middleware
const logMiddleware = (next) => (url, opts) => {
  console.log(`${opts.method ?? 'GET'} ${url}`);
  const start = Date.now();
  return next(url, opts).then((res) => {
    console.log(`${url} completed in ${Date.now() - start}ms`);
    return res;
  });
};

const api = wretch('https://api.example.com')
  .middlewares([logMiddleware]);

await api.url('/users').get().json();
```

### Retry Addon
```js
import wretch from 'wretch';
import { retry } from 'wretch/addons/retry';

const data = await wretch('https://api.example.com/data')
  .addon(retry())
  .get()
  .retry({
    delayTimer: 500,
    maxAttempts: 3,
    until: (response) => response?.ok,
  })
  .json();
```

### Query String Addon
```js
import wretch from 'wretch';
import QueryAddon from 'wretch/addons/queryString';

const results = await wretch('https://api.example.com/search')
  .addon(QueryAddon)
  .query({ q: 'typescript', page: 1 })
  .query({ limit: 20 })
  .get()
  .json();
// URL: /search?q=typescript&page=1&limit=20
```

## Configuration

```js
import wretch from 'wretch';

// Set global defaults
const api = wretch('https://api.example.com')
  .auth(`Bearer ${token}`)
  .headers({
    'Accept': 'application/json',
    'X-App-Version': '1.0.0',
  })
  .content('application/json')
  .errorType('json')            // parse error bodies as JSON
  .resolve((chain) => chain.json()); // always parse response as JSON

// Use the pre-configured instance
const users = await api.url('/users').get();
const posts = await api.url('/posts').get();
```

## Tips & Gotchas
- **Wretch is immutable** — every method call returns a new wretch instance; the original is not modified. This makes it safe to share base instances.
- **`.errorType('json')` enables JSON error bodies** — without this, `error.json` is undefined in error catchers; call it on your base instance.
- **Error catchers are matched by status code** — `.notFound()` catches 404, `.unauthorized()` catches 401, `.forbidden()` catches 403, `.internalError()` catches 500. Use `.fetchError()` for network failures.
- **`.url()` appends to the base URL** — use `api.url('/users')` to build on the base; it concatenates, so include the leading slash.
- **Addons extend the API** — retry, query strings, form data, and abort are all separate addons to keep the core bundle tiny.
- **Deferred resolution** — `.json()`, `.text()`, `.blob()` at the end of the chain execute the request and parse the response; nothing is sent until a resolver is called.
- **Middleware runs in order** — middlewares are applied left to right; each wraps the next in the chain, similar to Express middleware.
- **`.resolve()` sets a default resolver** — useful for creating instances that always return JSON without needing `.json()` on every call.
