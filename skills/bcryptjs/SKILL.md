---
name: "bcryptjs"
version: "3.0.3"
downloads: 26.7M/month
description: >
  Optimized bcrypt in plain JavaScript with zero dependencies, with TypeScript support. Compatible to 'bcrypt'.. Use when: From GitHub via jsDelivr:<br />; Callback<`T`>: `(err: Error | null, result?: T) => void`<br />; ProgressCallback: `(percentage: number) => void`<br />. NOT for: runtime application logic; package management (use npm/yarn).
---

# bcryptjs

## Overview
Optimized bcrypt in plain JavaScript with zero dependencies, with TypeScript support. Compatible to 'bcrypt'.. Compatible to the C++ bcrypt binding on Node.js and also working in the browser.

## Installation
```bash
npm install bcryptjs
```

## Core API / Usage
```js
$> npm install bcryptjs
```

```js
import bcrypt from "bcryptjs";
```

## Common Patterns
### Pattern 1

```js
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync("B4c0/\/", salt);
// Store hash in your password DB
```

### Pattern 2

```js
// Load hash from your password DB
bcrypt.compareSync("B4c0/\/", hash); // true
bcrypt.compareSync("not_bacon", hash); // false
```

### Pattern 3

```js
const hash = bcrypt.hashSync("bacon", 10);
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/bcryptjs) for configuration options and advanced settings.

## Tips & Gotchas
- Includes built-in TypeScript type definitions.
- Works in both Node.js and browser environments.
