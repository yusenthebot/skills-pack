---
name: "uuid"
version: "13.0.0"
downloads: 877.5M/month
description: >
  RFC9562 UUIDs. Use when: Complete - Support for all RFC9562 UUID versions; Cross-platform - Support for..; Chrome, Safari, Firefox, and Edge. NOT for: server-side CLI utilities; database access layer.
---

# uuid

## Overview
RFC9562 UUIDs. <!-- -- This file is auto-generated from README_js.md.

## Installation
```bash
npm install uuid
```

## Core API / Usage
```bash
npm install uuid
```

```js
import { v4 as uuidv4 } from 'uuid';

uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
```

## Common Patterns
### Pattern 1

```js
import { NIL as NIL_UUID } from 'uuid';

NIL_UUID; // ⇨ '00000000-0000-0000-0000-000000000000'
```

### Pattern 2

```js
import { MAX as MAX_UUID } from 'uuid';

MAX_UUID; // ⇨ 'ffffffff-ffff-ffff-ffff-ffffffffffff'
```

### Pattern 3

```js
import { parse as uuidParse } from 'uuid';

// Parse a UUID
uuidParse('6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b'); // ⇨
// Uint8Array(16) [
//   110, 192, 189, 127,  17,
//   192,  67, 218, 151,  94,
//    42, 138, 217, 235, 174,
//    11
// ]
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/uuid) for configuration options and advanced settings.

## Tips & Gotchas
- This package is ESM-only. Use `import` syntax; `require()` is not supported.
- Includes built-in TypeScript type definitions.
- Works in both Node.js and browser environments.
- Starting with `uuid@12` CommonJS is no longer supported. See implications and motivation for details.
- Ordering of values in the byte arrays used by `parse()` and `stringify()` follows the left &Rarr; right order of hex-pairs in UUID strings. As shown in the example below.
