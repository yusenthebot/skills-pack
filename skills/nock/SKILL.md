---
name: nock
description: >
  HTTP server mocking and expectations library for Node.js that intercepts outgoing HTTP/HTTPS requests. Use when: testing code that makes HTTP calls without hitting real servers, recording and replaying HTTP interactions, testing error/timeout scenarios. NOT for: browser-side mocking (use MSW), mocking non-HTTP protocols.
---

# nock

## Overview

Nock intercepts outgoing HTTP and HTTPS requests from Node.js at the `http.ClientRequest` level, allowing you to define expected requests and their responses without running a real server. It works with any HTTP client library (axios, got, node-fetch, undici in some configurations) and is especially useful for testing API integrations, handling edge cases like timeouts and errors, and recording real API responses for replay.

## Installation

```bash
npm install -D nock
# For TypeScript:
npm install -D nock @types/nock
```

## Core API / Commands

### Basic request interception

```ts
import nock from 'nock';

// Intercept a GET request
const scope = nock('https://api.example.com')
  .get('/users')
  .reply(200, [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]);

// Your code makes the request as normal
const users = await fetchUsers(); // calls https://api.example.com/users
expect(users).toHaveLength(2);

// Verify the interceptor was used
expect(scope.isDone()).toBe(true);
```

### POST with request body matching

```ts
nock('https://api.example.com')
  .post('/users', { name: 'Charlie', email: 'charlie@example.com' })
  .reply(201, { id: 3, name: 'Charlie' });
```

### Matching headers and query parameters

```ts
nock('https://api.example.com', {
  reqheaders: {
    authorization: 'Bearer my-token',
  },
})
  .get('/users')
  .query({ page: 1, limit: 10 })
  .reply(200, { users: [], total: 0 });
```

## Common Patterns

### Simulating errors and timeouts

```ts
// HTTP error response
nock('https://api.example.com')
  .get('/users/999')
  .reply(404, { error: 'Not found' });

// Network error (connection refused, DNS failure)
nock('https://api.example.com')
  .get('/health')
  .replyWithError('ECONNREFUSED');

// Simulate timeout
nock('https://api.example.com')
  .get('/slow-endpoint')
  .delayConnection(5000)
  .reply(200, { ok: true });
```

### Interceptor persistence

```ts
// One-time (default) — interceptor is consumed after first match
nock('https://api.example.com').get('/status').reply(200, 'ok');

// Persist — interceptor stays active for multiple requests
nock('https://api.example.com').get('/status').reply(200, 'ok').persist();

// Repeat N times
nock('https://api.example.com').get('/status').times(3).reply(200, 'ok');
```

### Recording and playback

```ts
import nock from 'nock';

// Start recording real HTTP calls
nock.recorder.rec({
  output_objects: true,
  dont_print: true,
});

// ... make real HTTP requests ...

// Get recorded interactions
const recordings = nock.recorder.play();
nock.recorder.clear();

// Later, load recordings as interceptors
const scope = nock.define(recordings);
```

## Configuration

### Global settings

```ts
// Disable real HTTP requests (fail if unmatched)
nock.disableNetConnect();

// Allow only specific hosts
nock.disableNetConnect();
nock.enableNetConnect('localhost');       // allow localhost
nock.enableNetConnect(/127\.0\.0\.1/);   // allow by regex

// Re-enable all connections
nock.enableNetConnect();
```

### Cleanup in tests

```ts
afterEach(() => {
  nock.cleanAll();       // remove all interceptors
  nock.restore();        // restore http to normal (if using nock.activate)
  nock.enableNetConnect(); // re-enable real requests
});

afterAll(() => {
  nock.abortPendingRequests();
});
```

## Tips & Gotchas

- **Interceptors are consumed once by default** — A `nock().get().reply()` intercept handles exactly one matching request, then is removed. Use `.persist()` or `.times(n)` if multiple requests are expected.
- **Always call `nock.cleanAll()` in `afterEach`** — Leftover interceptors from one test can silently interfere with subsequent tests.
- **Use `nock.disableNetConnect()` in tests** — This ensures no real HTTP requests escape your mocks. Any unmatched request throws an error immediately.
- **Nock matches the full URL** — The base URL passed to `nock()` must match exactly (protocol + host). Path, query, and body are matched separately.
- **Order matters for sequential interceptors** — If you define two interceptors for the same endpoint, the first match is consumed first (FIFO).
- **`scope.isDone()` verifies all interceptors were used** — Call this at the end of your test to ensure every expected request was actually made.
- **Nock does NOT work with native `fetch` in Node 18+** — Node's built-in `fetch` (backed by undici) bypasses `http.ClientRequest`. Use `node-fetch` or set `--no-experimental-fetch` for Nock to work, or consider MSW which supports native fetch.
- **Use `.matchHeader()` for per-request header checks** — More flexible than setting `reqheaders` on the scope: `nock(url).matchHeader('accept', 'application/json').get('/').reply(200)`.
- **Dynamic replies** — Pass a function to `.reply()` for dynamic responses: `.reply(200, (uri, body) => ({ received: body }))`.
