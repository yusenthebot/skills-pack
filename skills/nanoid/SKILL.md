---
name: nanoid
description: >
  Tiny (118 bytes), secure URL-friendly unique ID generator. Use when: generating IDs for records, tokens, slugs. NOT for: UUIDs with specific RFC format requirements (use uuid), sequential IDs.
---

# nanoid

> v5.1.6 — 118 bytes, crypto-secure, URL-safe

## Installation
```bash
npm install nanoid  # v5 ESM
npm install nanoid@3  # CommonJS compatible
```

## Core API

```ts
import { nanoid, customAlphabet, urlAlphabet } from 'nanoid';

// Default: 21 chars, URL-safe alphabet
nanoid()      // 'V1StGXR8_Z5jdHi6B-myT'
nanoid(10)    // 'IRFa-VaY2b'

// Custom size
nanoid(6)    // Short ID: 'abc123'

// Custom alphabet
const id = customAlphabet('1234567890', 8);
id()  // '30490912'

const shortId = customAlphabet('abcdefghijklmnopqrstuvwxyz', 6);
shortId()  // 'mxynoz'
```

## Common Patterns

### DB record IDs
```ts
import { nanoid } from 'nanoid';

const post = {
  id: nanoid(),  // primary key
  title: 'Hello World',
};
```

### Short URL slugs
```ts
const slug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);
const url = `https://short.ly/${slug()}`;  // 'https://short.ly/abc1def2'
```

### Session tokens
```ts
const token = nanoid(32);  // 32-char cryptographically secure token
```

### Non-secure (faster)
```ts
import { nanoid } from 'nanoid/non-secure';  // no crypto, faster, not for security
```

## Collision Probability

| Size | ~Hours for 1% collision probability at 1000 IDs/hr |
|------|-----------------------------------------------------|
| 8    | 1 hour                                              |
| 13   | 3 years                                             |
| 21   | 2 million years (default)                           |

## Tips & Gotchas
- nanoid v5 is ESM-only — use v3 for CommonJS
- Default 21-char ID has 126 bits of randomness — extremely collision resistant
- `customAlphabet` returns a **function** — call it to generate IDs
- Uses `crypto.randomInt()` internally — safe for security tokens
- URL-safe: no `+`, `/`, `=` — safe in URLs without encoding
