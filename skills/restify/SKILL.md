---
name: restify
description: >
  Framework optimized for building semantically correct RESTful web services at scale. Use when: strict REST API compliance, API versioning, built-in throttling/audit logging, enterprise Node.js APIs. NOT for: web apps with views, modern greenfield projects (use Fastify), lightweight microservices.
---

# restify

## Overview
Restify is a Node.js framework purpose-built for creating REST APIs. Unlike general-purpose web frameworks, Restify focuses on API-specific concerns like content negotiation, versioned routes, request throttling, audit logging, and DTrace support. It has been used in production at companies like Netflix and Joyent for high-traffic API services.

## Installation
```bash
npm install restify
# TypeScript types
npm install --save-dev @types/restify
```

## Core API / Commands

### Basic server
```js
const restify = require('restify');

const server = restify.createServer({
  name: 'my-api',
  version: '1.0.0',
});

// Built-in plugins
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());
server.use(restify.plugins.acceptParser(server.acceptable));

server.get('/hello', (req, res, next) => {
  res.send({ message: 'Hello World' });
  return next();
});

server.listen(3000, () => {
  console.log('%s listening at %s', server.name, server.url);
});
```

### HTTP methods and routing
```js
// CRUD routes
server.get('/users', (req, res, next) => {
  res.send([{ id: 1, name: 'Alice' }]);
  return next();
});

server.post('/users', (req, res, next) => {
  const user = req.body;
  res.send(201, { id: 2, ...user });
  return next();
});

server.put('/users/:id', (req, res, next) => {
  res.send({ id: req.params.id, ...req.body });
  return next();
});

server.patch('/users/:id', (req, res, next) => {
  res.send({ id: req.params.id, ...req.body });
  return next();
});

server.del('/users/:id', (req, res, next) => {
  res.send(204);
  return next();
});

// Route parameters
server.get('/users/:id', (req, res, next) => {
  const id = req.params.id;
  res.send({ id, name: 'Alice' });
  return next();
});

// Query parameters (requires queryParser plugin)
server.get('/search', (req, res, next) => {
  const { q, page, limit } = req.query;
  res.send({ q, page, limit });
  return next();
});
```

### Versioned routes
```js
// Version-based routing
server.get('/users', restify.plugins.conditionalHandler([
  {
    version: '1.0.0',
    handler: (req, res, next) => {
      res.send([{ name: 'Alice' }]);  // v1: no email field
      return next();
    },
  },
  {
    version: '2.0.0',
    handler: (req, res, next) => {
      res.send([{ name: 'Alice', email: 'alice@example.com' }]); // v2: with email
      return next();
    },
  },
]));

// Client specifies version via header:
// Accept-Version: ~2.0
```

## Common Patterns

### Built-in plugins
```js
const server = restify.createServer();

// Body parsing
server.use(restify.plugins.bodyParser({
  mapParams: false,          // Don't merge body into req.params
  maxBodySize: 1024 * 1024,  // 1MB limit
}));

// Query string parsing
server.use(restify.plugins.queryParser({ mapParams: false }));

// Gzip response
server.use(restify.plugins.gzipResponse());

// Request throttling
server.use(restify.plugins.throttle({
  burst: 100,     // Max concurrent requests
  rate: 50,       // Steady-state requests/second
  ip: true,       // Throttle per IP
}));

// CORS
const corsMiddleware = require('restify-cors-middleware2');
const cors = corsMiddleware({
  origins: ['http://localhost:3000'],
  allowHeaders: ['Authorization'],
});
server.pre(cors.preflight);
server.use(cors.actual);
```

### Audit logging
```js
const restify = require('restify');

const server = restify.createServer();

// Audit logger (logs every request/response)
server.on('after', restify.plugins.auditLogger({
  log: require('bunyan').createLogger({
    name: 'audit',
    stream: process.stdout,
  }),
  event: 'after',
  printLog: true,
}));
```

### Error handling
```js
const errors = require('restify-errors');

server.get('/users/:id', (req, res, next) => {
  const user = findUser(req.params.id);
  if (!user) {
    return next(new errors.NotFoundError('User not found'));
  }
  if (!isAuthorized(req)) {
    return next(new errors.ForbiddenError('Access denied'));
  }
  res.send(user);
  return next();
});

// Global error handler
server.on('restifyError', (req, res, err, callback) => {
  console.error(err);
  return callback();
});

// Common restify-errors:
// BadRequestError (400)
// UnauthorizedError (401)
// ForbiddenError (403)
// NotFoundError (404)
// ConflictError (409)
// InternalServerError (500)
```

### Middleware chain
```js
// Route-specific middleware chain
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return next(new errors.UnauthorizedError('No token'));
  }
  req.user = verifyToken(token);
  return next();
};

const authorize = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return next(new errors.ForbiddenError('Insufficient permissions'));
  }
  return next();
};

server.get('/admin/stats', authenticate, authorize('admin'), (req, res, next) => {
  res.send({ users: 100, requests: 5000 });
  return next();
});
```

## Configuration

### Server options
```js
const server = restify.createServer({
  name: 'my-api',
  version: '1.0.0',
  acceptable: ['application/json'],  // Accepted content types
  url: 'https://api.example.com',    // Base URL for Location headers
  strictNext: true,                  // Error if next() called with wrong args
  handleUncaughtExceptions: true,    // Catch unhandled errors
  maxParamLength: 200,               // Max URL parameter length
});
```

### Event hooks
```js
// Before routing (pre-route middleware)
server.pre(restify.plugins.pre.sanitizePath());  // Remove double slashes
server.pre(restify.plugins.pre.userAgentConnection()); // Handle legacy clients

// After each request
server.on('after', (req, res, route, err) => {
  // Logging, metrics, cleanup
});
```

## Tips & Gotchas
- Always call `return next()` at the end of every handler. Forgetting `next()` causes the request to hang and never complete.
- Use `server.del()` for DELETE routes, not `server.delete()`. This is a common source of confusion.
- Restify's `res.send()` automatically sets Content-Type based on the data type. Objects get `application/json`, strings get `text/plain`.
- `restify.plugins.bodyParser()` handles both JSON and URL-encoded bodies. Set `mapParams: false` to prevent body fields from leaking into `req.params`.
- Versioned routes use the `Accept-Version` header. Clients send `Accept-Version: ~1.0` to match any 1.x handler.
- Use `restify-errors` for standardized HTTP errors. Passing an error to `next(err)` triggers Restify's error handling chain.
- `server.pre()` runs BEFORE routing. Use it for request sanitization, CORS preflight, and logging. `server.use()` runs AFTER routing.
- Restify is not designed for serving HTML or static files. It is optimized for JSON API endpoints.
- The built-in `throttle` plugin provides per-IP rate limiting without external dependencies (like Redis).
- Restify uses Bunyan for structured JSON logging by default. Combine with the audit logger for comprehensive request/response logging.
