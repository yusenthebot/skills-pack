---
name: dotenv
description: >
  Load .env files into process.env. Use when: managing environment variables in Node.js, local dev config, keeping secrets out of code. NOT for: production secrets management (use Vault/AWS Secrets Manager), browser environments.
---

# dotenv

## Installation
```bash
npm install dotenv
```

## Core Usage

```ts
// At the very top of your entry file
import 'dotenv/config';  // ESM — auto-loads .env
// or
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.DATABASE_URL);
```

## .env File Format

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
PORT=3000
NODE_ENV=development
SECRET_KEY="my secret with spaces"
# Comments are ignored
EMPTY=
MULTILINE="line1\nline2"
```

## Common Patterns

### Multiple environments
```ts
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
// .env.development, .env.staging, .env.production
```

### Override existing env vars
```ts
dotenv.config({ override: true });  // .env values override process.env
```

### Custom path
```ts
dotenv.config({ path: '/etc/app/.env' });
```

### With Zod validation (recommended)
```ts
import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SECRET_KEY: z.string().min(32),
});

export const env = EnvSchema.parse(process.env);
// env.PORT is number, env.DATABASE_URL is string — fully typed
```

### dotenv-expand (variable expansion)
```bash
npm install dotenv-expand
```
```bash
# .env
BASE_URL=https://api.example.com
USERS_URL=${BASE_URL}/users
```
```ts
import dotenvExpand from 'dotenv-expand';
dotenvExpand.expand(dotenv.config());
```

## Tips & Gotchas
- `.env` should be in `.gitignore` — commit `.env.example` with placeholder values instead
- `dotenv/config` import (ESM) is the cleanest approach — no need for `dotenv.config()` call
- Values are always strings — coerce numbers with `parseInt()` or Zod's `z.coerce.number()`
- In production, set env vars directly (Heroku, Railway, Docker) — don't use dotenv
- `dotenv.config()` silently does nothing if `.env` doesn't exist (returns `{ parsed: undefined }`)
- For monorepos, specify the path: `dotenv.config({ path: '../../.env' })`
