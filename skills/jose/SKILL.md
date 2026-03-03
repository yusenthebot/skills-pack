---
name: "jose"
version: "6.1.3"
downloads: 173.6M/month
description: >
  JWA, JWS, JWE, JWT, JWK, JWKS for Node.js, Browser, Cloudflare Workers, Deno, Bun, and other Web-interoperable runtimes. Use when: JWT Claims Set Validation & Signature Verification using the `jwtVerify` function; Using a remote JSON Web Key Set (JWKS); Using a local JSON Web Key Set (JWKS). NOT for: timezone database hosting; building calendar UIs.
---

# jose

## Overview
JWA, JWS, JWE, JWT, JWK, JWKS for Node.js, Browser, Cloudflare Workers, Deno, Bun, and other Web-interoperable runtimes. # jose `jose` is a JavaScript module for JSON Object Signing and Encryption, providing support for JSON Web Tokens (JWT), JSON Web Signature (JWS), JSON Web Encryption (JWE), JSON Web Key (JWK), JSON Web Key Set (JWKS), and more.

## Installation
```bash
npm install jose
```

## Core API / Usage
```js
import * as jose from 'jose'
```

## Common Patterns
### Key Features

- **JWT Claims Set Validation & Signature Verification using the `jwtVerify` function**
- **Using a remote JSON Web Key Set (JWKS)**
- **Using a local JSON Web Key Set (JWKS)**
- **Signing using the `SignJWT` class**

## Configuration
See the [official documentation](https://www.npmjs.com/package/jose) for configuration options and advanced settings.

## Tips & Gotchas
- Supports both ESM (`import`) and CommonJS (`require()`).
- Works in both Node.js and browser environments.
