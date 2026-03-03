---
name: ky
description: >
  Tiny and elegant HTTP client built on fetch. Use when: building browser or Node.js apps needing retry, hooks, JSON shorthand, and a small bundle. NOT for: streaming large files, environments without fetch, low-level HTTP control.
---

# ky

## Overview
Ky is a tiny (~3 KB) HTTP client that wraps the native `fetch` API with a cleaner, more ergonomic interface. It provides built-in retry on failure, lifecycle hooks, automatic JSON handling, timeout support, and search params helpers. Ky works in browsers, Node.js 18+, Deno, and any environment with a global `fetch`. It is a great choice when you want the simplicity of fetch with the convenience features of larger libraries.

## Installation
```bash
npm install ky
yarn add ky
pnpm add ky
```

## Core API / Commands

### Basic Requests
```js
import ky from 'ky';

// GET — .json() parses the response automatically
const users = await ky.get('https://api.example.com/users').json();

// POST with JSON body
const created = await ky.post('https://api.example.com/users', {
  json: { name: 'Alice', role: 'admin' },
}).json();

// Other methods
await ky.put(url, { json: body }).json();
await ky.patch(url, { json: body }).json();
await ky.delete(url).json();
```

### Creating a Custom Instance
```js
const api = ky.create({
  prefixUrl: 'https://api.example.com/v2',
  headers: { 'Authorization': `Bearer ${token}` },
  timeout: 30000,
  retry: 3,
});

const data = await api.get('users').json();
const user = await api.get('users/42').json();
```

## Common Patterns

### Hooks for Request/Response Lifecycle
```js
const api = ky.create({
  prefixUrl: 'https://api.example.com',
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('X-Request-Id', crypto.randomUUID());
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          const newToken = await refreshAccessToken();
          request.headers.set('Authorization', `Bearer ${newToken}`);
          return ky(request);
        }
      },
    ],
    beforeRetry: [
      ({ request, retryCount }) => {
        console.log(`Retrying ${request.url} (attempt ${retryCount})`);
      },
    ],
  },
});
```

### Search Parameters
```js
const results = await ky.get('https://api.example.com/search', {
  searchParams: {
    q: 'typescript',
    page: 1,
    limit: 20,
    tags: ['node', 'web'],
  },
}).json();
// URL: /search?q=typescript&page=1&limit=20&tags=node&tags=web
```

### Error Handling
```js
import ky, { HTTPError, TimeoutError } from 'ky';

try {
  const data = await ky.get('https://api.example.com/data').json();
} catch (error) {
  if (error instanceof HTTPError) {
    const body = await error.response.json();
    console.error(`API error ${error.response.status}:`, body.message);
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out');
  } else {
    throw error;
  }
}
```

## Configuration

```js
const api = ky.create({
  prefixUrl: 'https://api.example.com',
  timeout: 30000,           // ms before timeout (default: 10000)
  retry: {
    limit: 3,               // number of retries (default: 2)
    methods: ['get', 'put', 'delete'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    backoffLimit: 3000,      // max backoff time in ms
  },
  throwHttpErrors: true,     // throw on non-2xx (default: true)
  headers: {
    'Accept': 'application/json',
  },
});

// Extend an existing instance with overrides
const adminApi = api.extend({
  headers: { 'X-Admin': 'true' },
});
```

## Tips & Gotchas
- **Ky requires a global `fetch`** — on Node.js, use version 18+ or polyfill fetch before importing ky.
- **`json` option auto-sets Content-Type** — do not manually set `Content-Type: application/json` when using the `json` body option.
- **Retry is on by default** — ky retries failed GET requests twice with exponential backoff; set `retry: 0` to disable.
- **`prefixUrl` paths must not start with `/`** — use `api.get('users')` not `api.get('/users')`.
- **`throwHttpErrors` is true by default** — non-2xx responses throw an `HTTPError`; catch it or set `throwHttpErrors: false`.
- **`searchParams` handles arrays** — arrays are serialized by repeating the key (`tags=a&tags=b`), not bracket notation.
- **`.json()`, `.text()`, `.blob()` are on the ky response** — they return promises, just like native fetch.
- **Hooks can return a new Response** — `afterResponse` hooks that return a `Response` object replace the original response.
