---
name: "sharp"
version: "0.34.5"
downloads: 154.9M/month
description: >
  High performance Node.js image processing, the fastest module to resize JPEG, PNG, WebP, GIF, AVIF and TIFF images. Use when: writing unit and integration tests; mocking dependencies and APIs; snapshot testing. NOT for: production runtime logic; replacing static type checking.
---

# sharp

## Overview
High performance Node.js image processing, the fastest module to resize JPEG, PNG, WebP, GIF, AVIF and TIFF images. It can be used with all JavaScript runtimes that provide support for Node-API v9, including Node.js (^18.17.0 or >= 20.3.0), Deno and Bun.

## Installation
```bash
npm install sharp
```

## Core API / Usage
```js
const semiTransparentRedPng = await sharp({
  create: {
    width: 48,
    height: 48,
    channels: 4,
    background: { r: 255, g: 0, b: 0, alpha: 0.5 }
  }
})
  .png
```

## Common Patterns
### Key Features

- **3 Dependencies**
- **7474 Dependents**
- **172 Versions**

## Configuration
See the [official documentation](https://www.npmjs.com/package/sharp) for configuration options and advanced settings.

## Tips & Gotchas
- Includes built-in TypeScript type definitions.
- Current version: 0.34.5. Check the changelog when upgrading across major versions.
