---
name: superagent
description: >
  Fluent HTTP request library for Node.js and browsers with a chainable API. Use when: building HTTP clients with a readable chaining syntax, handling multipart uploads, needing plugin support. NOT for: projects wanting promise-first APIs, minimal bundle size.
---

# superagent

## Overview
SuperAgent is a mature, fluent HTTP client that works in both Node.js and the browser. Its chainable API makes building requests readable and expressive. It supports multipart file uploads, authentication helpers, redirect control, response parsing, plugins, and timeouts. SuperAgent has been a staple of the Node.js ecosystem since the early days and continues to be a solid choice for projects that value API clarity.

## Installation
```bash
npm install superagent
yarn add superagent
pnpm add superagent
```

## Core API / Commands

### Basic Requests
```js
import request from 'superagent';

// GET request
const { body } = await request.get('https://api.example.com/users');

// POST with JSON
const res = await request
  .post('https://api.example.com/users')
  .send({ name: 'Alice', email: 'alice@example.com' })
  .set('Accept', 'application/json');

console.log(res.status, res.body);
```

### Chaining API
```js
const res = await request
  .get('https://api.example.com/users')
  .query({ page: 2, limit: 20 })
  .set('Authorization', `Bearer ${token}`)
  .set('Accept', 'application/json')
  .timeout({ response: 5000, deadline: 30000 })
  .retry(3);
```

## Common Patterns

### File Upload (Multipart)
```js
const res = await request
  .post('https://api.example.com/upload')
  .attach('avatar', '/path/to/photo.jpg')
  .attach('document', Buffer.from('file contents'), 'report.pdf')
  .field('username', 'alice')
  .field('description', 'Profile photo and document');

console.log(res.body.urls);
```

### Authentication Helpers
```js
// Basic auth
const res = await request
  .get('https://api.example.com/protected')
  .auth('username', 'password');

// Bearer token
const res2 = await request
  .get('https://api.example.com/protected')
  .auth(token, { type: 'bearer' });
```

### Plugin System
```js
import request from 'superagent';
import prefix from 'superagent-prefix';
import nocache from 'superagent-no-cache';

// Apply plugins using .use()
const res = await request
  .get('/users')
  .use(prefix('https://api.example.com/v2'))
  .use(nocache);
```

### Error Handling
```js
try {
  const res = await request
    .get('https://api.example.com/data')
    .timeout({ response: 5000 });
} catch (err) {
  if (err.timeout) {
    console.error('Request timed out');
  } else if (err.status) {
    console.error(`HTTP ${err.status}: ${err.response?.body?.message}`);
  } else {
    console.error('Network error:', err.message);
  }
}
```

## Configuration

```js
// Timeout configuration
const res = await request
  .get(url)
  .timeout({
    response: 5000,   // wait 5s for the server to start responding
    deadline: 30000,  // allow 30s total for the entire request
  });

// Redirect control
const res2 = await request
  .get(url)
  .redirects(5)        // max number of redirects to follow (default: 5 in Node)
  .ok((res) => res.status < 500); // custom OK check — treat 4xx as non-errors

// TLS options (Node.js)
const res3 = await request
  .get('https://internal.example.com/api')
  .ca(fs.readFileSync('custom-ca.pem'))
  .cert(fs.readFileSync('client-cert.pem'))
  .key(fs.readFileSync('client-key.pem'));
```

## Tips & Gotchas
- **`.send()` auto-sets Content-Type** — passing an object sets `application/json`; passing a string sets `application/x-www-form-urlencoded`.
- **`.query()` can be called multiple times** — each call merges parameters; `request.get(url).query({a:1}).query({b:2})` produces `?a=1&b=2`.
- **Timeout has two parts** — `response` is time until first byte; `deadline` is total time including body transfer. Always set both.
- **`.ok()` customizes what counts as success** — by default, 4xx and 5xx throw. Use `.ok(res => res.status < 500)` to only throw on server errors.
- **`.retry(n)` retries on network errors and 5xx** — it does not retry on 4xx by default; combine with `.ok()` to customize.
- **Response body depends on Content-Type** — `res.body` is auto-parsed for JSON and form-encoded responses; other types give you a string or buffer.
- **`.attach()` is for files, `.field()` is for form fields** — do not mix `.send()` and `.attach()` in the same request.
- **Piping is supported** — `request.get(url).pipe(writeStream)` streams the response body directly to a writable stream in Node.js.
