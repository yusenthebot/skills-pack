---
name: fastify
description: >
  High-performance Node.js web framework with built-in JSON Schema validation and serialization. Use when: building fast REST APIs, schema-validated endpoints, plugin-based architecture, TypeScript APIs. NOT for: template-heavy server-rendered apps, beginner projects needing Express ecosystem.
---

# fastify

## Overview
Fastify is a web framework for Node.js focused on performance and developer experience. It is one of the fastest Node.js frameworks available, using JSON Schema for request validation and response serialization, which provides both type safety and a significant speed boost. Fastify uses a plugin architecture for encapsulation and code organization.

## Installation
```bash
npm install fastify
# TypeScript projects can use Fastify's built-in types (no @types needed)
```

## Core API / Commands

### Basic server
```js
const fastify = require('fastify')({ logger: true });

fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
```

### Routes with JSON Schema validation
```js
const opts = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
      },
      required: ['id'],
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', default: 1 },
        limit: { type: 'integer', default: 20 },
      },
    },
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
      },
      required: ['name', 'email'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' },
        },
      },
    },
  },
};

fastify.post('/users', opts, async (request, reply) => {
  const { name, email } = request.body;
  return { id: 1, name, email };
});
```

### Plugins
```js
// Define a plugin
async function userRoutes(fastify, options) {
  fastify.get('/users', async () => {
    return [{ id: 1, name: 'Alice' }];
  });

  fastify.get('/users/:id', async (request) => {
    return { id: request.params.id };
  });
}

// Register the plugin with a prefix
fastify.register(userRoutes, { prefix: '/api' });

// Register third-party plugins
fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:3000'],
});
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/jwt'), { secret: 'supersecret' });
```

## Common Patterns

### Hooks (lifecycle events)
```js
// Request lifecycle hooks
fastify.addHook('onRequest', async (request, reply) => {
  request.startTime = Date.now();
});

fastify.addHook('preHandler', async (request, reply) => {
  if (!request.headers.authorization) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

fastify.addHook('onSend', async (request, reply, payload) => {
  reply.header('X-Response-Time', Date.now() - request.startTime);
  return payload;
});

fastify.addHook('onResponse', async (request, reply) => {
  request.log.info({ responseTime: reply.elapsedTime }, 'request completed');
});
```

### Decorators
```js
// Decorate the fastify instance
fastify.decorate('db', new DatabaseClient());

// Decorate the request object
fastify.decorateRequest('user', null);

fastify.addHook('preHandler', async (request) => {
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (token) {
    request.user = await fastify.db.findUserByToken(token);
  }
});

fastify.get('/me', async (request) => {
  if (!request.user) throw fastify.httpErrors.unauthorized();
  return request.user;
});
```

### TypeScript with type providers
```ts
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

const app = Fastify().withTypeProvider<TypeBoxTypeProvider>();

app.post('/users', {
  schema: {
    body: Type.Object({
      name: Type.String(),
      email: Type.String({ format: 'email' }),
    }),
  },
}, async (request) => {
  // request.body is fully typed: { name: string, email: string }
  return { id: 1, ...request.body };
});

app.listen({ port: 3000 });
```

## Configuration

### Server options
```js
const fastify = require('fastify')({
  logger: true,                          // Enable pino logger
  trustProxy: true,                      // Behind a reverse proxy
  maxParamLength: 200,                   // Max URL parameter length
  bodyLimit: 1048576,                    // 1MB body limit
  caseSensitive: true,                   // Case-sensitive routes
  ignoreTrailingSlash: true,             // /foo and /foo/ are the same
  ajv: {                                 // Ajv validator options
    customOptions: {
      removeAdditional: 'all',           // Strip unknown properties
      coerceTypes: true,                 // Coerce string "1" to number 1
      allErrors: true,                   // Report all validation errors
    },
  },
});
```

## Tips & Gotchas
- Fastify handlers should return data directly (or use `reply.send()`) rather than calling `res.json()`. Returning a value automatically sends it as JSON.
- Always define a `response` schema for serialization -- it speeds up JSON stringification by 2-3x using `fast-json-stringify`.
- Plugin encapsulation means decorators and hooks registered inside a plugin are NOT visible to sibling plugins. Use `fastify-plugin` to break encapsulation when needed.
- Fastify uses Pino for logging by default. Access it via `request.log.info()` or `fastify.log.error()`. Do not use `console.log` in production.
- Validation errors return 400 automatically with a detailed error body. Customize with `setErrorHandler`.
- Use `@fastify/autoload` to automatically register all plugins/routes in a directory.
- The `preHandler` hook is the right place for authentication middleware. Use `onRequest` for very early checks.
- Fastify does not parse request bodies by default for `GET`/`HEAD`/`DELETE`. Only `POST`/`PUT`/`PATCH` bodies are parsed.
- Use `fastify.inject()` for testing routes without starting a real HTTP server -- it is extremely fast.
- Register plugins before calling `fastify.listen()`. Routes and plugins registered after listen may not work.
