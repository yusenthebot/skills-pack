---
name: undici
description: >
  High-performance HTTP/1.1 client for Node.js that powers the built-in fetch. Use when: needing maximum HTTP performance, connection pooling, custom dispatchers, or low-level control. NOT for: browser environments, simple REST calls where axios/ky suffice.
---

# undici

## Overview
Undici is a high-performance HTTP/1.1 client written from scratch for Node.js. It is the engine behind Node.js's built-in `fetch()` (available since Node 18). Undici provides connection pooling, a dispatcher architecture, interceptors, mock utilities for testing, and significantly better throughput than the legacy `http` module. It is the recommended way to make HTTP requests in modern Node.js when you need performance or low-level control.

## Installation
```bash
npm install undici
yarn add undici
pnpm add undici
```

## Core API / Commands

### Using fetch (Undici's spec-compliant implementation)
```js
import { fetch } from 'undici';

// GET
const res = await fetch('https://api.example.com/users');
const data = await res.json();

// POST with JSON
const res2 = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' }),
});
```

### Using the request API
```js
import { request } from 'undici';

const { statusCode, headers, body } = await request('https://api.example.com/users', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` },
});

const data = await body.json();
console.log(statusCode, data);
```

### Using the Client directly
```js
import { Client } from 'undici';

const client = new Client('https://api.example.com', {
  keepAliveTimeout: 30000,
  keepAliveMaxTimeout: 600000,
  pipelining: 10,
});

const { statusCode, body } = await client.request({
  path: '/users',
  method: 'GET',
});

const data = await body.json();
client.close();
```

## Common Patterns

### Connection Pooling
```js
import { Pool } from 'undici';

const pool = new Pool('https://api.example.com', {
  connections: 20,      // max concurrent connections
  pipelining: 6,        // requests per connection
});

// Reuse the pool for all requests
const results = await Promise.all(
  ids.map(async (id) => {
    const { body } = await pool.request({
      path: `/users/${id}`,
      method: 'GET',
    });
    return body.json();
  })
);

await pool.close();
```

### Mocking for Tests
```js
import { MockAgent, setGlobalDispatcher } from 'undici';

const mockAgent = new MockAgent();
setGlobalDispatcher(mockAgent);

const mockPool = mockAgent.get('https://api.example.com');

mockPool.intercept({
  path: '/users/1',
  method: 'GET',
}).reply(200, { id: 1, name: 'Alice' });

// Now any fetch/request to https://api.example.com/users/1 returns the mock
const res = await fetch('https://api.example.com/users/1');
const data = await res.json();
// data === { id: 1, name: 'Alice' }

mockAgent.close();
```

### Streaming Response Body
```js
import { request } from 'undici';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

const { body } = await request('https://example.com/large-file.zip');

await pipeline(body, createWriteStream('/tmp/large-file.zip'));
```

## Configuration

```js
import { Agent, setGlobalDispatcher } from 'undici';

// Set global dispatcher with custom settings
const agent = new Agent({
  keepAliveTimeout: 30000,
  keepAliveMaxTimeout: 600000,
  connections: 50,
  pipelining: 10,
  connect: {
    rejectUnauthorized: true,  // TLS verification
    timeout: 5000,
  },
});

setGlobalDispatcher(agent);
```

## Tips & Gotchas
- **Always consume the response body** — undici keeps connections open until the body is fully consumed. Use `await body.json()`, `await body.text()`, or `await body.dump()` to release the connection.
- **`body.dump()` discards the body** — call this when you only need status/headers, to avoid connection leaks.
- **Undici powers Node's built-in fetch** — on Node 18+, `globalThis.fetch` uses undici under the hood, but importing directly gives you access to `Client`, `Pool`, and `MockAgent`.
- **Pipelining multiplies throughput** — setting `pipelining: 10` allows 10 requests to be in-flight on a single TCP connection (HTTP/1.1 pipelining).
- **MockAgent is excellent for testing** — it intercepts requests at the dispatcher level, no need for nock or msw for simple cases.
- **`request()` returns a different shape than `fetch()`** — `request()` gives `{ statusCode, headers, body }` while `fetch()` gives a spec-compliant `Response`.
- **Use `Pool` for concurrent workloads** — a `Pool` manages multiple TCP connections and distributes requests across them for maximum throughput.
- **Error codes differ from http module** — undici throws `UND_ERR_*` error codes (e.g., `UND_ERR_CONNECT_TIMEOUT`); handle them specifically in catch blocks.
