---
name: "fs-extra"
version: "11.3.4"
downloads: 612.2M/month
description: >
  fs-extra contains methods that aren't included in the vanilla Node.js fs package. Such as recursive mkdir, copy, and remove.. Use when: reading and writing files with extras; directory operations; file pattern matching. NOT for: database replacement; network storage without proper SDKs.
---

# fs-extra

## Overview
fs-extra contains methods that aren't included in the vanilla Node.js fs package. Such as recursive mkdir, copy, and remove.. Node.js: fs-extra ================= `fs-extra` adds file system methods that aren't included in the native `fs` module and adds promise support to the `fs` methods.

## Installation
```bash
npm install fs-extra
```

## Core API / Usage
```js
const fs = require('fs') // this is no longer necessary
```

```js
const fs = require('fs-extra')
```

## Common Patterns
### Pattern 1

```js
const fse = require('fs-extra')
```

### Pattern 2

```js
const fs = require('fs')
const fse = require('fs-extra')
```

### Pattern 3

```js
import { readFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { outputFile, outputFileSync } from 'fs-extra/esm'
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/fs-extra) for configuration options and advanced settings.

## Tips & Gotchas
- Supports both ESM (`import`) and CommonJS (`require()`).
- Current version: 11.3.4. Check the changelog when upgrading across major versions.
