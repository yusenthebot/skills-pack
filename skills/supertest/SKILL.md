---
name: supertest
description: >
  HTTP assertion library for testing Node.js HTTP servers with a fluent chainable API. Use when: testing Express/Koa/Fastify route handlers, asserting HTTP status codes, headers, and response bodies without starting a live server. NOT for: E2E browser testing, testing external third-party APIs.
---

# supertest

## Overview

Supertest provides a high-level abstraction for testing HTTP servers in Node.js. It wraps `superagent` to provide a fluent API for making requests and asserting responses. You pass your Express/Koa/Fastify app directly — supertest binds it to an ephemeral port automatically, so no running server is needed. This makes it ideal for integration testing of API routes.

## Installation

```bash
npm install -D supertest
# For TypeScript:
npm install -D supertest @types/supertest
```

## Core API / Commands

### Basic GET request

```ts
import request from 'supertest';
import app from '../src/app'; // your Express app

describe('GET /api/users', () => {
  it('returns a list of users', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toHaveProperty('name');
  });
});
```

### POST with JSON body

```ts
it('creates a new user', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({ name: 'Alice', email: 'alice@example.com' })
    .set('Accept', 'application/json')
    .expect(201);

  expect(res.body.name).toBe('Alice');
  expect(res.body.id).toBeDefined();
});
```

### PUT and DELETE

```ts
it('updates a user', async () => {
  await request(app)
    .put('/api/users/1')
    .send({ name: 'Alice Updated' })
    .expect(200);
});

it('deletes a user', async () => {
  await request(app)
    .delete('/api/users/1')
    .expect(204);
});
```

## Common Patterns

### Authentication with Bearer token

```ts
it('accesses protected route with token', async () => {
  const loginRes = await request(app)
    .post('/api/login')
    .send({ email: 'admin@example.com', password: 'secret' });

  const token = loginRes.body.token;

  const res = await request(app)
    .get('/api/admin/dashboard')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  expect(res.body.role).toBe('admin');
});
```

### File upload

```ts
it('uploads an avatar image', async () => {
  const res = await request(app)
    .post('/api/users/1/avatar')
    .attach('avatar', 'tests/fixtures/photo.png')
    .expect(200);

  expect(res.body.avatarUrl).toMatch(/\/uploads\//);
});
```

### Testing error responses

```ts
it('returns 404 for missing user', async () => {
  const res = await request(app)
    .get('/api/users/99999')
    .expect(404);

  expect(res.body.error).toBe('User not found');
});

it('returns 422 for invalid input', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({ name: '' }) // missing required email
    .expect(422);

  expect(res.body.errors).toContainEqual(
    expect.objectContaining({ field: 'email' })
  );
});
```

## Configuration

Supertest has no configuration file. Configuration is done through the chaining API:

```ts
// Reusable agent with cookies (session persistence)
const agent = request.agent(app);

await agent.post('/login').send({ user: 'admin', pass: 'secret' });
// subsequent requests on `agent` carry the session cookie
await agent.get('/api/protected').expect(200);
```

```ts
// Custom base URL for external server testing
const api = request('http://localhost:4000');
await api.get('/health').expect(200);
```

## Tips & Gotchas

- **Pass the app, not a URL** — Pass your Express/Koa app instance directly to `request(app)`. Supertest starts and stops a server automatically on an ephemeral port, avoiding port conflicts.
- **`.expect()` is an assertion** — Each `.expect(200)` or `.expect('Content-Type', /json/)` call adds an assertion. If it fails, the test fails with a descriptive error.
- **Chain order matters for send/set** — Call `.set()` headers and `.send()` body before `.expect()` assertions.
- **Use `request.agent(app)` for sessions** — The agent persists cookies across requests, which is essential for testing session-based auth flows.
- **Do NOT call `app.listen()` in your test** — Supertest handles binding. If your app file calls `listen()`, export the app before that line.
- **Close database connections in `afterAll`** — Supertest closes the HTTP server, but open DB pools or other handles will keep Jest/Vitest from exiting. Use `--forceExit` as a last resort.
- **Combine with Jest/Vitest** — Supertest provides HTTP assertions, not a test runner. Use it inside `describe`/`it` blocks from your preferred framework.
- **Content type defaults** — `.send({ ... })` automatically sets `Content-Type: application/json`. For form data, use `.type('form').send('field=value')`.
