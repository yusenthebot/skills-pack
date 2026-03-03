---
name: "nanoid"
version: "5.1.6"
downloads: 435.9M/month
description: >
  A tiny (118 bytes), secure URL-friendly unique string ID generator. Use when: Small. 118 bytes (minified and brotlied). No dependencies; Safe. It uses hardware random generator. Can be used in clusters; Short IDs. It uses a larger alphabet than UUID (`A-Za-z0-9_-`). NOT for: server-side CLI utilities; database access layer.
---

# nanoid

## Overview
A tiny (118 bytes), secure URL-friendly unique string ID generator. > “An amazing level of senseless perfectionism, > which is simply impossible not to respect.” Small.

## Installation
```bash
npm install nanoid
```

## Core API / Usage
```js
import { nanoid } from 'nanoid'
model.id = nanoid() //=> "V1StGXR8_Z5jdHi6B-myT"
```

## Common Patterns
### Key Features

- **Small. 118 bytes (minified and brotlied). No dependencies.**
- **Safe. It uses hardware random generator. Can be used in clusters.**
- **Short IDs. It uses a larger alphabet than UUID (`A-Za-z0-9_-`).**
- **Portable. Nano ID was ported**

## Configuration
See the [official documentation](https://www.npmjs.com/package/nanoid) for configuration options and advanced settings.

## Tips & Gotchas
- Current version: 5.1.6. Check the changelog when upgrading across major versions.
- Refer to the official npm page for edge cases and advanced configuration.
