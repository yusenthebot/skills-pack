---
name: got
description: >
  Human-friendly HTTP request library for Node.js. Use when: building Node.js services needing retry, pagination, streams, or HTTP/2. NOT for: browser environments, simple fetch-compatible code.
---

# got

## Overview
Got is a feature-rich HTTP request library designed specifically for Node.js. It provides built-in retry with backoff, pagination helpers, stream support, hooks for request lifecycle events, HTTP/2 support, and RFC-compliant caching. Got is ESM-only starting from v12 and focuses on providing a developer-friendly API with sensible defaults.

## Installation
```bash
npm install got
yarn add got
pnpm add got
```

## Core API / Commands

### Basic Requests
```js
import got from 'got';

// GET with JSON response
const data = await got('https://api.example.com/users').json();

// POST with JSON body
const response = await got.post('https://api.example.com/users', {
  json: { name: 'Alice', role: 'admin' },
}).json();

// Other methods
await got.put(url, { json: body }).json();
await got.patch(url, { json: body }).json();
await got.delete(url).json();
```

### Creating a Reusable Instance
```js
const api = got.extend({
  prefixUrl: 'https://api.example.com/v2',
  headers: { 'Authorization': `Bearer ${token}` },
  timeout: { request: 10000 },
  retry: { limit: 3 },
});

const users = await api('users').json();
const user = await api('users/42').json();
```

## Common Patterns

### Retry with Backoff
```js
const data = await got('https://api.example.com/data', {
  retry: {
    limit: 5,
    methods: ['GET', 'POST'],
    statusCodes: [408, 429, 500, 502, 503, 504],
    calculateDelay: ({ attemptCount }) => attemptCount * 1000,
  },
}).json();
```

### Pagination
```js
const allItems = await got.paginate.all('https://api.example.com/items', {
  pagination: {
    transform: (response) => JSON.parse(response.body).results,
    paginate: ({ response, currentItems }) => {
      const body = JSON.parse(response.body);
      if (!body.next) return false; // stop
      return { url: new URL(body.next) };
    },
  },
});
```

### Streaming Downloads
```js
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

await pipeline(
  got.stream('https://example.com/large-file.zip'),
  createWriteStream('/tmp/large-file.zip')
);
```

### Hooks for Lifecycle Events
```js
const api = got.extend({
  hooks: {
    beforeRequest: [
      (options) => {
        options.headers['x-request-id'] = crypto.randomUUID();
      },
    ],
    afterResponse: [
      (response) => {
        console.log(`${response.requestUrl} → ${response.statusCode}`);
        return response;
      },
    ],
    beforeRetry: [
      (error, retryCount) => {
        console.log(`Retry #${retryCount} for ${error.request.requestUrl}`);
      },
    ],
  },
});
```

## Configuration

```js
const client = got.extend({
  prefixUrl: 'https://api.example.com',
  timeout: {
    lookup: 1000,      // DNS lookup
    connect: 2000,     // TCP connect
    secureConnect: 2000, // TLS handshake
    request: 30000,    // total request time
  },
  retry: { limit: 3 },
  http2: true,         // enable HTTP/2
  throwHttpErrors: true,
  responseType: 'json',
  headers: { 'Accept': 'application/json' },
});
```

## Tips & Gotchas
- **Got v12+ is ESM-only** — you must use `import` not `require`. For CJS projects, stay on v11 or switch to dynamic `import()`.
- **Use `.json()` to get parsed data** — calling `got(url)` alone returns a `Response` object; chain `.json()` or `.text()` for the body.
- **`throwHttpErrors` is true by default** — non-2xx responses throw a `HTTPError`. Set `throwHttpErrors: false` to handle them manually.
- **Timeout is granular** — you can set individual timeouts for DNS lookup, TCP connect, TLS handshake, and total request time.
- **Merging instances** — `got.extend(a).extend(b)` deep-merges configs; hooks arrays are concatenated, not replaced.
- **`prefixUrl` requires no leading slash on paths** — use `api('users')` not `api('/users')` when a `prefixUrl` is set.
- **Stream mode is separate** — `got.stream()` returns a duplex stream and does not throw on HTTP errors; check the `response` event for status codes.
- **Pagination stops automatically** — if the `paginate` function returns `false` or `undefined`, iteration ends.
