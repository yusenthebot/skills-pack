---
name: uuid
description: >
  Generate RFC9562 compliant UUIDs. Use when: standards-compliant UUIDs required (v4 random, v7 time-ordered), interop with other systems, database primary keys. NOT for: shorter IDs (use nanoid), non-standard ID formats.
---

# uuid

> v13.0.0 — RFC9562 UUIDs (formerly RFC4122)

## Installation
```bash
npm install uuid
```

## Core API

```ts
import { v4 as uuidv4, v7 as uuidv7, validate, version } from 'uuid';

// v4 — random UUID (most common)
uuidv4()  // 'b7e2c4a8-3f1d-4b2e-9a0c-5f8d7e6b1234'

// v7 — time-ordered UUID (better for DB indexes — NEW in uuid v9+)
uuidv7()  // '018f4c3e-7a2b-7000-8000-b7e2c4a83f1d'

// Validate
validate('b7e2c4a8-3f1d-4b2e-9a0c-5f8d7e6b1234')  // true
validate('not-a-uuid')  // false

// Get version
version('b7e2c4a8-3f1d-4b2e-9a0c-5f8d7e6b1234')  // 4
```

## UUID Versions

| Version | Description | Use Case |
|---------|-------------|----------|
| v4 | Random | General purpose, most common |
| v7 | Time-ordered random | Database primary keys (sortable) |
| v1 | Timestamp + MAC | When time ordering needed (legacy) |
| v5 | Namespace + SHA-1 | Deterministic IDs from input |
| v3 | Namespace + MD5 | Deterministic IDs (legacy) |

## Common Patterns

### Database primary keys
```ts
// v4 for general use
const user = { id: uuidv4(), name: 'Alice' };

// v7 for better index performance (time-sortable)
const event = { id: uuidv7(), type: 'click', timestamp: Date.now() };
```

### Deterministic IDs (v5)
```ts
import { v5 as uuidv5 } from 'uuid';

const MY_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const id = uuidv5('https://example.com/users/alice', MY_NAMESPACE);
// Same input always produces same UUID
```

### Compact format (no hyphens)
```ts
uuidv4().replace(/-/g, '')  // 32 hex chars
```

## Tips & Gotchas
- **Prefer v7 over v1** for new time-ordered UUIDs — v7 is the modern standard
- v4 UUIDs are NOT sequential — use v7 for database PKs to avoid index fragmentation
- In PostgreSQL, use `uuid` column type + `gen_random_uuid()` for native generation
- `validate()` checks format only, not whether the UUID was actually generated
- For very high throughput, `nanoid` is faster since it doesn't need UUID format
