---
name: "glob"
version: "13.0.6"
downloads: 1.2B/month
description: >
  the most correct and second fastest glob implementation in JavaScript. Use when: writing unit and integration tests; mocking dependencies and APIs; snapshot testing. NOT for: production runtime logic; replacing static type checking.
---

# glob

## Overview
the most correct and second fastest glob implementation in JavaScript. # Glob Match files using the patterns the shell uses.

## Installation
```bash
npm install glob
```

## Core API / Usage
```bash
npm install glob-bin
```

```js
// load using import
import { glob, globSync, globStream, globStreamSync, Glob } from 'glob'
// or using commonjs, that's fine, too
const {
  glob,
  globSync,
  globStream,
  globStreamSync,
  Glob,
} = require('glob')
```

## Common Patterns
### Pattern 1

```js
// all js files, but don't look in node_modules
const jsfiles = await glob('**/*.js', { ignore: 'node_modules/**' })
```

### Pattern 2

```js
// pass in a signal to cancel the glob walk
const stopAfter100ms = await glob('**/*.css', {
  signal: AbortSignal.timeout(100),
})
```

### Pattern 3

```js
// multiple patterns supported as well
const images = await glob(['css/*.{png,jpeg}', 'public/*.{png,jpeg}'])
```

## Configuration
```js
// construct a Glob object if you wanna do it that way, which
// allows for much faster walks if you have to look in the same
// folder multiple times.
const g = new Glob('**/foo', {})
// glob objects are async iterators, can also do globIterate() or
// g.iterate(), same deal
```

## Tips & Gotchas
- The npm package name is _not_ `node-glob` that's a > different thing that was abandoned years ago. Just `glob`.
- Current version: 13.0.6. Check the changelog when upgrading across major versions.
