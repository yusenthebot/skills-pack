---
name: msw
description: >
  API mocking library that intercepts requests at the network level using Service Workers (browser) or custom interceptors (Node.js). Use when: mocking REST/GraphQL APIs in tests or during development, replacing fetch/axios mocks with realistic network behavior. NOT for: mocking non-HTTP modules, production traffic interception.
---

# msw

## Overview

Mock Service Worker (MSW) intercepts HTTP requests at the network level rather than stubbing `fetch` or `axios`. This means your application code runs exactly as in production — the same fetch calls, headers, and error handling — while MSW provides controlled responses. Version 2.x uses a new `http`/`HttpResponse` API and supports both browser (Service Worker) and Node.js (request interceptors) environments.

## Installation

```bash
npm install -D msw
# For browser mocking, generate the Service Worker script:
npx msw init ./public --save
```

## Core API / Commands

### Defining REST handlers (v2 API)

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: 3, ...body },
      { status: 201 }
    );
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params;
    return new HttpResponse(null, { status: 204 });
  }),
];
```

### Node.js setup (for tests)

```ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Browser setup (for development/Storybook)

```ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

const worker = setupWorker(...handlers);
await worker.start({
  onUnhandledRequest: 'bypass',
});
```

## Common Patterns

### Dynamic responses based on request

```ts
http.get('/api/users/:id', ({ params }) => {
  const { id } = params;

  if (id === '999') {
    return HttpResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return HttpResponse.json({ id: Number(id), name: 'Alice' });
}),

http.get('/api/search', ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  return HttpResponse.json({
    results: [{ title: `Result for "${query}"` }],
  });
}),
```

### Override handlers per test

```ts
it('shows error state when API fails', async () => {
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    })
  );

  render(<UserList />);
  await screen.findByText('Something went wrong');
});
```

### GraphQL mocking

```ts
import { graphql, HttpResponse } from 'msw';

export const graphqlHandlers = [
  graphql.query('GetUser', ({ variables }) => {
    return HttpResponse.json({
      data: {
        user: { id: variables.id, name: 'Alice' },
      },
    });
  }),

  graphql.mutation('CreateUser', async ({ variables }) => {
    return HttpResponse.json({
      data: {
        createUser: { id: '4', name: variables.name },
      },
    });
  }),
];
```

## Configuration

### Server options

```ts
const server = setupServer(...handlers);

server.listen({
  onUnhandledRequest: 'error',   // 'warn' | 'error' | 'bypass'
});
```

### Lifecycle events (for logging/debugging)

```ts
server.events.on('request:start', ({ request }) => {
  console.log('Intercepted:', request.method, request.url);
});

server.events.on('response:mocked', ({ request, response }) => {
  console.log('Mocked response for:', request.url, response.status);
});
```

## Tips & Gotchas

- **Always call `server.resetHandlers()` in `afterEach`** — Per-test overrides from `server.use()` accumulate. Resetting ensures test isolation.
- **`onUnhandledRequest: 'error'` in tests** — Set this to catch requests you forgot to mock. In development/browser, use `'bypass'` to let real requests through.
- **MSW v2 breaking changes** — v2 replaced `rest` with `http`, `ctx.json()` with `HttpResponse.json()`, and `ctx.status()` with the second argument to `HttpResponse`. Ensure code examples match v2.
- **Request body parsing** — Use `await request.json()`, `await request.text()`, or `await request.formData()` inside handlers. The request object is a standard Fetch API `Request`.
- **Network-level interception** — Because MSW intercepts at the network level, it works with any HTTP client (fetch, axios, got, etc.) without additional configuration.
- **Use `passthrough()` to skip mocking** — Return `passthrough()` from a handler to let the request reach the real server: useful for hybrid mocking.
- **Delay responses** — Use `await delay(ms)` inside handlers to simulate network latency: `import { delay } from 'msw'; await delay(500);`.
- **Cookies and headers** — Set response cookies via `HttpResponse` options: `new HttpResponse(body, { headers: { 'Set-Cookie': 'token=abc' } })`.
