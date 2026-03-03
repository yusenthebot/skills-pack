---
name: polka
description: >
  Micro web server that is Express-compatible but significantly faster and smaller. Use when: lightweight HTTP servers, Express-compatible middleware, performance-critical microservices, SvelteKit adapter. NOT for: large enterprise apps, built-in body parsing, apps needing Express's full feature set.
---

# polka

## Overview
Polka is an extremely minimal and performant web server for Node.js. It provides an Express-compatible API surface (middleware, routing, req/res extensions), but with a smaller footprint and roughly 33% better throughput. Polka is used internally by SvelteKit and is ideal when you want Express-style ergonomics without the overhead. It supports sub-applications, middleware, and route parameters just like Express.

## Installation
```bash
npm install polka
# For body parsing (polka has no built-in parser)
npm install @polka/parse
# or use standard middleware
npm install body-parser
```

## Core API / Commands

### Basic server
```js
const polka = require('polka');

polka()
  .get('/', (req, res) => {
    res.end('Hello Polka!');
  })
  .listen(3000, () => {
    console.log('Running on port 3000');
  });
```

### Routing
```js
const polka = require('polka');

const app = polka();

// HTTP methods
app.get('/users', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify([{ id: 1, name: 'Alice' }]));
});

app.post('/users', (req, res) => {
  // Body needs to be parsed by middleware
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ id: 2, ...req.body }));
});

app.put('/users/:id', (req, res) => {
  res.end(`Update user ${req.params.id}`);
});

app.delete('/users/:id', (req, res) => {
  res.writeHead(204);
  res.end();
});

// Route parameters
app.get('/users/:id', (req, res) => {
  res.end(`User ID: ${req.params.id}`);
});

// Query string (automatically parsed)
app.get('/search', (req, res) => {
  // req.query is auto-populated
  res.end(`Search: ${req.query.q}, Page: ${req.query.page}`);
});

app.listen(3000);
```

### Middleware
```js
const polka = require('polka');
const { json } = require('body-parser');
const cors = require('cors');

const app = polka();

// Use Express-compatible middleware
app.use(json());
app.use(cors());

// Custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Path-specific middleware
app.use('/api', (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    res.writeHead(401);
    return res.end('Unauthorized');
  }
  next();
});

app.get('/api/data', (req, res) => {
  res.end(JSON.stringify({ secret: 'data' }));
});

app.listen(3000);
```

## Common Patterns

### Sub-applications
```js
const polka = require('polka');

// Users sub-app
const users = polka()
  .get('/', (req, res) => {
    res.end(JSON.stringify([{ id: 1, name: 'Alice' }]));
  })
  .get('/:id', (req, res) => {
    res.end(JSON.stringify({ id: req.params.id }));
  })
  .post('/', (req, res) => {
    res.writeHead(201);
    res.end(JSON.stringify(req.body));
  });

// Posts sub-app
const posts = polka()
  .get('/', (req, res) => {
    res.end(JSON.stringify([{ id: 1, title: 'Hello' }]));
  });

// Mount sub-apps
polka()
  .use('/api/users', users)
  .use('/api/posts', posts)
  .listen(3000);
```

### JSON response helper
```js
const polka = require('polka');
const { json } = require('body-parser');

// Helper to send JSON responses (polka doesn't have res.json)
const send = (res, code, data) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

polka()
  .use(json())
  .get('/users', (req, res) => {
    send(res, 200, [{ id: 1, name: 'Alice' }]);
  })
  .post('/users', (req, res) => {
    send(res, 201, { id: 2, ...req.body });
  })
  .get('/users/:id', (req, res) => {
    const user = findUser(req.params.id);
    if (!user) return send(res, 404, { error: 'Not found' });
    send(res, 200, user);
  })
  .listen(3000);
```

### Error handling
```js
const polka = require('polka');

polka()
  .use((req, res, next) => {
    try {
      // middleware logic
      next();
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  })
  .get('/fail', (req, res) => {
    // Polka's onError handler
    throw new Error('Something went wrong');
  })
  .listen(3000, () => console.log('Running'));

// Custom error handler
polka({
  onError: (err, req, res) => {
    res.writeHead(err.code || 500);
    res.end(JSON.stringify({ error: err.message }));
  },
  onNoMatch: (req, res) => {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  },
}).listen(3000);
```

## Configuration

### Constructor options
```js
const app = polka({
  // Custom error handler
  onError: (err, req, res, next) => {
    res.writeHead(err.code || 500);
    res.end(err.message);
  },
  // Custom 404 handler
  onNoMatch: (req, res) => {
    res.writeHead(404);
    res.end('Not Found');
  },
  // Use an existing http.Server
  server: require('http').createServer(),
});
```

## Tips & Gotchas
- Polka does NOT have `res.json()`, `res.send()`, or `res.status()`. Use Node's native `res.writeHead()` and `res.end()` or write a small helper function.
- `req.params` and `req.query` are populated automatically by Polka -- no additional middleware needed for those.
- Polka is fully compatible with Express middleware (body-parser, cors, helmet, etc.) because it follows the `(req, res, next)` convention.
- There is no built-in body parser. Install `body-parser` or `@polka/parse` for JSON/form parsing.
- Polka's `app.use('/path', subApp)` supports sub-applications for modular route organization, similar to Express's `Router`.
- The `onError` and `onNoMatch` options in the constructor give you global control over error and 404 responses.
- Polka is ~33% faster than Express in benchmarks due to its simpler routing algorithm and reduced overhead.
- Since Polka uses raw `res.end()`, make sure to set `Content-Type` headers manually when sending JSON.
- Polka does not support template engines (like EJS or Pug) out of the box -- it is intended for API servers and microservices.
- The `app.listen()` method returns a Promise, making it easy to `await` in async startup code.
