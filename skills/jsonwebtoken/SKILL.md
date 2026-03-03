---
name: "jsonwebtoken"
version: "9.0.3"
downloads: 140.5M/month
description: >
  JSON Web Token implementation (symmetric and asymmetric). Use when: `algorithm` (default: `HS256`); `expiresIn`: expressed in seconds or a string describing a time span vercel/ms; `notBefore`: expressed in seconds or a string describing a time span vercel/ms. NOT for: fine-grained authorization rules; user profile CRUD.
---

# jsonwebtoken

## Overview
JSON Web Token implementation (symmetric and asymmetric). This was developed against `draft-ietf-oauth-json-web-token-08`.

## Installation
```bash
npm install jsonwebtoken
```

## Core API / Usage
```js
$ npm install jsonwebtoken
```

```js
var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
```

## Common Patterns
### Pattern 1

```js
// sign with RSA SHA256
var privateKey = fs.readFileSync('private.key');
var token = jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' });
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/jsonwebtoken) for configuration options and advanced settings.

## Tips & Gotchas
- Current version: 9.0.3. Check the changelog when upgrading across major versions.
- Refer to the official npm page for edge cases and advanced configuration.
