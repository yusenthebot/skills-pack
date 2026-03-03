---
name: "hono"
version: "4.12.4"
downloads: 80.1M/month
description: >
  Web framework built on Web Standards. Use when: Ultrafast 🚀 - The router `RegExpRouter` is really fast. Not using linear loops. Fast; Lightweight 🪶 - The `hono/tiny` preset is under 12kB. Hono has zero dependencies and uses only the Web Standard API; Multi-runtime 🌍 - Works on Cloudflare Workers, Fastly Compute, Deno, Bun, AWS Lambda, Lambda@Edge, or Node.js. The same code runs on all platforms. NOT for: client-side browser applications; static file serving without a server.
---

# hono

## Overview
Web framework built on Web Standards. It works on any JavaScript runtime: Cloudflare Workers, Fastly Compute, Deno, Bun, Vercel, AWS Lambda, Lambda@Edge, and Node.js.

## Installation
```bash
npm install hono
```

## Core API / Usage
```js
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hono!'))

export default app
```

```bash
npm create hono@latest
```

## Common Patterns
### Key Features

- **Ultrafast 🚀 - The router `RegExpRouter` is really fast. Not using linear loops. Fast.**
- **Lightweight 🪶 - The `hono/tiny` preset is under 12kB. Hono has zero dependencies and uses only the Web Standard API.**
- **Multi-runtime 🌍 - Works on Cloudflare Workers, Fastly Compute, Deno, Bun, AWS Lambda, Lambda@Edge, or Node.js. The same code runs on all platforms.**
- **Batteries Included 🔋 - Hono has built-in middleware, custom middleware, and third-party middleware. Batteries included.**

### Example

```bash
npm create hono@latest
```

## Configuration
```js
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hono!'))

export default app
```

## Tips & Gotchas
- Includes built-in TypeScript type definitions.
- Current version: 4.12.4. Check the changelog when upgrading across major versions.
