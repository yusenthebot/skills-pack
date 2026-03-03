---
name: express
description: >
  Minimal and flexible Node.js web framework for building APIs and web applications. Use when: REST APIs, server-rendered pages, middleware-based HTTP servers, rapid prototyping. NOT for: edge/serverless-first apps, real-time only (use Socket.io on top), static site generation.
---

# express

## Overview
Express is the most widely used Node.js web framework, providing a thin layer of fundamental web application features on top of Node's HTTP module. It offers routing, middleware composition, request/response utilities, and template engine support. Express is unopinionated, letting developers choose their own database, ORM, and project structure.

## Installation
```bash
npm install express
# TypeScript types
npm install --save-dev @types/express
```

## Core API / Commands

### Basic server
```js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### HTTP methods and routing
```js
// Route methods
app.get('/users', (req, res) => { /* ... */ });
app.post('/users', (req, res) => { /* ... */ });
app.put('/users/:id', (req, res) => { /* ... */ });
app.patch('/users/:id', (req, res) => { /* ... */ });
app.delete('/users/:id', (req, res) => { /* ... */ });

// Route parameters
app.get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});

// Query strings: GET /search?q=hello&page=2
app.get('/search', (req, res) => {
  const { q, page } = req.query;
  res.json({ query: q, page });
});

// Pattern matching
app.get('/files/*', (req, res) => { /* ... */ });
app.get('/users/:id(\\d+)', (req, res) => { /* numeric id only */ });
```

### Request and response
```js
// Request object
app.post('/api/data', (req, res) => {
  req.body;          // Parsed body (needs middleware)
  req.params;        // Route parameters
  req.query;         // Query string
  req.headers;       // Request headers
  req.method;        // HTTP method
  req.path;          // URL path
  req.ip;            // Client IP
  req.cookies;       // Cookies (needs cookie-parser)
});

// Response object
app.get('/api/example', (req, res) => {
  res.status(200).json({ message: 'ok' });
  res.send('text response');
  res.sendFile('/path/to/file.pdf');
  res.redirect('/new-location');
  res.redirect(301, '/permanent-new-location');
  res.set('X-Custom-Header', 'value');
  res.cookie('token', 'abc', { httpOnly: true });
  res.download('/path/to/file.zip');
});
```

### Middleware
```js
// Built-in middleware
app.use(express.json());                          // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));   // Parse form data
app.use(express.static('public'));                  // Serve static files

// Custom middleware
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};
app.use(logger);

// Route-specific middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // verify token...
  next();
};
app.get('/protected', auth, (req, res) => {
  res.json({ secret: 'data' });
});
```

## Common Patterns

### Router modules
```js
// routes/users.js
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});

router.post('/', (req, res) => {
  const user = req.body;
  res.status(201).json(user);
});

module.exports = router;

// app.js
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
```

### Error handling
```js
// Async error wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await db.findUser(req.params.id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  res.json(user);
}));

// Error handling middleware (must have 4 parameters)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});
```

### CORS and security setup
```js
const cors = require('cors');
const helmet = require('helmet');

app.use(helmet());                            // Security headers
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));     // Limit body size
app.disable('x-powered-by');                  // Hide Express fingerprint
```

## Configuration

### app.set() settings
```js
app.set('port', process.env.PORT || 3000);
app.set('env', 'production');
app.set('trust proxy', 1);          // Trust first proxy (for req.ip behind LB)
app.set('json spaces', 2);          // Pretty-print JSON
app.set('etag', 'weak');            // ETag generation
app.set('query parser', 'simple');  // Use querystring instead of qs
app.set('view engine', 'ejs');      // Template engine
app.set('views', './views');        // Template directory
```

## Tips & Gotchas
- Always place error-handling middleware (4 arguments: `err, req, res, next`) AFTER all routes -- Express matches middleware in order.
- `express.json()` must be used before route handlers that read `req.body` -- without it, `req.body` is `undefined`.
- Express 4 does not catch errors thrown in async route handlers. Use an async wrapper or upgrade to Express 5 which handles async errors natively.
- `res.json()` sets Content-Type to `application/json` automatically, while `res.send()` infers the type from the data.
- Calling `res.send()` or `res.json()` more than once throws "Cannot set headers after they are sent" -- always `return` after responding.
- Use `express.Router()` to organize routes into modular files and mount them with `app.use('/prefix', router)`.
- `app.use(express.static('public'))` serves files from the `public/` directory. Requests for `public/style.css` are served at `/style.css`.
- Use `app.set('trust proxy', 1)` behind a reverse proxy (nginx, AWS ALB) to get the real client IP in `req.ip`.
- The order of `app.use()` calls matters -- middleware is executed in the order it is registered.
- For file uploads, use the `multer` middleware. Express does not handle multipart form data natively.
