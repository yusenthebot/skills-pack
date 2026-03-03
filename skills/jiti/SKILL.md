---
name: jiti
description: >
  Runtime TypeScript and ESM support for Node.js. Use when: loading TS config files at runtime, dynamic require() of TypeScript, tools that need to import TS without a build step. NOT for: production apps (use tsx or tsc), browser environments.
---

# jiti

> v2.6.1 — Runtime TypeScript and ESM support for Node.js

## Installation
```bash
npm install jiti
```

## Core Usage

```ts
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);

// Import TypeScript file at runtime
const config = await jiti.import('./config.ts');
const { default: myModule } = await jiti.import('./utils.ts');
```

## Common Patterns

### Load TypeScript config files
```ts
// Used internally by tools like Vite, Nuxt, etc.
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const userConfig = await jiti.import('./vite.config.ts');
```

### CLI shebang
```bash
#!/usr/bin/env node
// At the top of a JS file that imports TS modules
```

```ts
// run.mjs
import { createJiti } from 'jiti';
const jiti = createJiti(import.meta.url);
await jiti.import('./main.ts');
```

### As node loader
```bash
node --import jiti/register ./src/app.ts
```

### With require (CommonJS)
```ts
const { createJiti } = require('jiti');
const jiti = createJiti(__filename);
const mod = jiti('./config.ts');  // sync require
```

## Configuration

```ts
const jiti = createJiti(import.meta.url, {
  debug: false,             // log resolution details
  cache: true,              // cache transformed files
  sourceMaps: true,         // generate source maps
  interopDefault: true,     // unwrap default exports
  transformOptions: {       // passed to oxc-transform
    // ...
  },
});
```

## Tips & Gotchas
- jiti v2 uses `oxc-transform` — much faster than Babel
- Not a replacement for a build step in production — use `tsx` or `tsc` for production
- Used internally by Nuxt, Vite config loading, and many CLI tools
- `jiti/register` hook patches Node.js module resolution to support `.ts` files globally
- Type checking is **not** performed — it only transforms, like ts-node with `transpileOnly`
