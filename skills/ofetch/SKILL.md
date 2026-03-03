---
name: ofetch
description: >
  Universal fetch library with auto-retry, JSON parsing, and interceptors. Use when: building apps that run in Node.js, browser, and workers with a single API; needing auto-retry and smart defaults. NOT for: low-level HTTP control, streaming large responses.
---

# ofetch

## Overview
ofetch (formerly ohmyfetch) is a universal HTTP client from the unjs ecosystem that works seamlessly across Node.js, browsers, Cloudflare Workers, Deno, and Bun. It provides automatic JSON parsing, built-in retry with backoff, base URL support, request/response interceptors, and smart error handling. ofetch is the HTTP layer used internally by Nuxt and Nitro.

## Installation
```bash
npm install ofetch
yarn add ofetch
pnpm add ofetch
```

## Core API / Commands

### Basic Requests
```js
import { ofetch } from 'ofetch';

// GET — automatically parses JSON responses
const users = await ofetch('https://api.example.com/users');

// POST with JSON body
const created = await ofetch('https://api.example.com/users', {
  method: 'POST',
  body: { name: 'Alice', role: 'admin' },
  // body is auto-serialized to JSON
});

// Other methods
await ofetch('/users/1', { method: 'PUT', body: { name: 'Bob' } });
await ofetch('/users/1', { method: 'PATCH', body: { name: 'Bob' } });
await ofetch('/users/1', { method: 'DELETE' });
```

### Creating a Pre-configured Instance
```js
import { ofetch } from 'ofetch';

const apiFetch = ofetch.create({
  baseURL: 'https://api.example.com/v2',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  },
  retry: 2,
});

const users = await apiFetch('/users');
const user = await apiFetch('/users/42');
```

## Common Patterns

### Interceptors
```js
const apiFetch = ofetch.create({
  baseURL: 'https://api.example.com',

  async onRequest({ request, options }) {
    const token = await getAccessToken();
    options.headers.set('Authorization', `Bearer ${token}`);
    console.log(`→ ${options.method} ${request}`);
  },

  async onResponse({ request, response }) {
    console.log(`← ${response.status} ${request}`);
  },

  async onRequestError({ request, error }) {
    console.error(`Request failed: ${request}`, error);
  },

  async onResponseError({ request, response }) {
    if (response.status === 401) {
      console.error('Unauthorized — token may be expired');
    }
  },
});
```

### Query Parameters
```js
const results = await ofetch('https://api.example.com/search', {
  query: {
    q: 'typescript',
    page: 1,
    limit: 20,
  },
});
// URL: /search?q=typescript&page=1&limit=20
```

### Response Types
```js
// JSON (default for JSON content-type)
const data = await ofetch('/api/data');

// Explicit text response
const html = await ofetch('/page', { responseType: 'text' });

// ArrayBuffer for binary data
const buffer = await ofetch('/file.zip', { responseType: 'arrayBuffer' });

// Blob
const blob = await ofetch('/image.png', { responseType: 'blob' });

// Raw Response object
const response = await ofetch.raw('/api/data');
console.log(response.status, response._data);
```

### Error Handling
```js
import { ofetch, FetchError } from 'ofetch';

try {
  const data = await ofetch('https://api.example.com/data');
} catch (error) {
  if (error instanceof FetchError) {
    console.error('Status:', error.statusCode);
    console.error('Message:', error.statusMessage);
    console.error('Response body:', error.data); // auto-parsed JSON error body
  }
}
```

## Configuration

```js
const apiFetch = ofetch.create({
  baseURL: 'https://api.example.com',
  retry: 3,                          // retry count (default: 1 for GET/HEAD, 0 for others)
  retryDelay: 500,                   // ms between retries (uses exponential backoff)
  retryStatusCodes: [408, 409, 425, 429, 500, 502, 503, 504],
  timeout: 30000,                    // request timeout in ms
  headers: {
    'Accept': 'application/json',
  },
  responseType: 'json',              // 'json' | 'text' | 'arrayBuffer' | 'blob'
  parseResponse: JSON.parse,         // custom response parser
});
```

## Tips & Gotchas
- **JSON is auto-parsed** — ofetch detects `application/json` content-type and parses automatically; no need to call `.json()`.
- **JSON body is auto-serialized** — passing an object as `body` auto-stringifies it and sets `Content-Type: application/json`.
- **Retry is on by default for GET/HEAD** — GET and HEAD requests retry once on network errors and 5xx; POST/PUT/PATCH/DELETE do not retry by default.
- **`query` option replaces manual URL building** — use `query: { key: 'value' }` instead of concatenating query strings.
- **`ofetch.raw()` returns the full Response** — use it when you need headers, status codes, or the raw Response object; the parsed body is in `response._data`.
- **`FetchError` includes parsed error body** — `error.data` contains the auto-parsed response body for error responses, so you can read API error messages directly.
- **Works everywhere without polyfills** — ofetch uses Node.js built-in fetch on Node 18+, falls back to a bundled implementation on older versions, and uses native fetch in browsers and workers.
- **Base URL concatenation** — `baseURL` is prepended to relative paths; absolute URLs (starting with `http://` or `https://`) ignore the base URL.
- **Interceptors receive mutable options** — `onRequest` can modify headers, query params, and body before the request is sent.
