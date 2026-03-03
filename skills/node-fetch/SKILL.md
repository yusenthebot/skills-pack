---
name: node-fetch
description: >
  Lightweight Fetch API polyfill for Node.js. Use when: needing browser-compatible fetch in Node.js, working with streams, building isomorphic libraries. NOT for: projects on Node 18+ with built-in fetch, browser-only code.
---

# node-fetch

## Overview
node-fetch brings the browser's `fetch()` API to Node.js with minimal deviation from the spec. It supports streaming request and response bodies, custom headers, abort signals, and most of the standard Fetch API surface. Version 3 is ESM-only, while version 2 supports CommonJS. On Node 18+, the built-in `fetch` (powered by undici) is available natively, reducing the need for this package.

## Installation
```bash
# v3 (ESM-only, Node 12.20+)
npm install node-fetch

# v2 (CommonJS compatible)
npm install node-fetch@2

yarn add node-fetch
pnpm add node-fetch
```

## Core API / Commands

### Basic Requests
```js
import fetch from 'node-fetch';

// GET request
const response = await fetch('https://api.example.com/users');
const data = await response.json();

// POST with JSON body
const res = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
});
const created = await res.json();
```

### Response Methods
```js
const res = await fetch(url);

await res.json();        // parse JSON body
await res.text();        // get body as string
await res.buffer();      // get body as Buffer (node-fetch extension)
await res.arrayBuffer(); // get body as ArrayBuffer
await res.blob();        // get body as Blob
```

## Common Patterns

### Streaming a Response Body
```js
import fetch from 'node-fetch';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

const response = await fetch('https://example.com/large-file.tar.gz');

if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

await pipeline(response.body, createWriteStream('/tmp/large-file.tar.gz'));
```

### Abort a Request with Timeout
```js
import fetch, { AbortError } from 'node-fetch';

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch('https://api.example.com/slow', {
    signal: controller.signal,
  });
  const data = await response.json();
  return data;
} catch (err) {
  if (err instanceof AbortError) {
    console.log('Request timed out');
  }
  throw err;
} finally {
  clearTimeout(timeout);
}
```

### Custom Headers and Authentication
```js
import fetch, { Headers } from 'node-fetch';

const headers = new Headers({
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
  'X-Request-Id': crypto.randomUUID(),
});

const res = await fetch('https://api.example.com/protected', { headers });
```

### Error Handling Pattern
```js
async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} from ${url}: ${body}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  return response.text();
}
```

## Configuration

```js
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

await fetch('https://api.example.com/data', {
  method: 'GET',
  headers: { 'Accept': 'application/json' },
  redirect: 'follow',        // 'follow' | 'manual' | 'error'
  follow: 20,                // max redirects (default: 20)
  compress: true,             // auto-decompress gzip/deflate
  size: 10 * 1024 * 1024,    // max response body size in bytes (0 = unlimited)
  agent: new HttpsProxyAgent('http://proxy:8080'), // custom agent
  highWaterMark: 1024 * 1024, // internal buffer size for streams
});
```

## Tips & Gotchas
- **v3 is ESM-only** — if your project uses `require()`, install `node-fetch@2` or use dynamic `import('node-fetch')`.
- **No automatic JSON parsing** — unlike axios, you must call `response.json()` explicitly; the body can only be consumed once.
- **response.ok checks are manual** — `fetch()` does not throw on 4xx/5xx; always check `response.ok` or `response.status`.
- **`response.body` is a Node.js Readable** — not a web ReadableStream. You can pipe it directly to `fs.createWriteStream`.
- **`res.buffer()` is a node-fetch extension** — not part of the Fetch spec; use `res.arrayBuffer()` for cross-platform code.
- **Body is consumed once** — calling `res.json()` or `res.text()` a second time throws. Clone the response first with `res.clone()` if you need the body twice.
- **On Node 18+, consider native fetch** — the built-in `globalThis.fetch` is powered by undici and does not require any package.
- **FormData requires a separate package** — node-fetch v3 does not bundle FormData; use the `formdata-polyfill` or `form-data` package.
