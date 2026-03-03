---
name: "@faker-js/faker"
description: >
  Comprehensive fake data generator for testing, development, and seeding databases with realistic dummy data. Use when: generating test fixtures, seeding databases, building prototypes with realistic data, creating factory functions for tests. NOT for: production data, cryptographically secure values, real PII generation.
---

# @faker-js/faker

## Overview

Faker is a library that generates realistic fake data for over 60 categories including people, addresses, finance, internet, dates, and more. It supports 60+ locales for generating culturally appropriate data and provides seeding for reproducible output. The `@faker-js/faker` package is the actively maintained community fork.

## Installation

```bash
npm install -D @faker-js/faker
# Or as a runtime dependency for seeding scripts:
npm install @faker-js/faker
```

## Core API / Commands

### Basic data generation

```ts
import { faker } from '@faker-js/faker';

// Person
const firstName = faker.person.firstName();        // 'Alice'
const lastName = faker.person.lastName();           // 'Johnson'
const fullName = faker.person.fullName();           // 'Alice Johnson'
const jobTitle = faker.person.jobTitle();           // 'Senior Software Engineer'

// Internet
const email = faker.internet.email();               // 'alice.johnson42@gmail.com'
const username = faker.internet.username();         // 'alice_johnson42'
const password = faker.internet.password({ length: 16 }); // 'xK9#mPq2vL8wN5rT'
const url = faker.internet.url();                   // 'https://loopy-blanket.info'
const ip = faker.internet.ip();                     // '192.168.45.12'

// Date
const past = faker.date.past();                     // Date object in the past year
const future = faker.date.future({ years: 2 });     // Date up to 2 years in future
const between = faker.date.between({
  from: '2024-01-01',
  to: '2025-12-31',
});

// Commerce / Finance
const price = faker.commerce.price({ min: 10, max: 500 }); // '249.99'
const product = faker.commerce.productName();       // 'Sleek Granite Chair'
const cc = faker.finance.creditCardNumber();         // '4532-1234-5678-9012'
```

### Seed for reproducibility

```ts
faker.seed(42);
const name1 = faker.person.fullName(); // always the same with seed 42

faker.seed(42);
const name2 = faker.person.fullName();
console.log(name1 === name2); // true
```

### Locale support

```ts
import { faker } from '@faker-js/faker/locale/de'; // German

faker.person.fullName();     // 'Hans Müller'
faker.location.city();       // 'München'
faker.location.country();    // 'Deutschland'
```

## Common Patterns

### Factory function for test fixtures

```ts
import { faker } from '@faker-js/faker';

function createUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    createdAt: faker.date.past(),
    role: faker.helpers.arrayElement(['admin', 'user', 'editor']),
    ...overrides,
  };
}

// Generate a list of users
const users = faker.helpers.multiple(createUser, { count: 10 });

// With specific override
const admin = createUser({ role: 'admin', name: 'Test Admin' });
```

### Database seeding script

```ts
import { faker } from '@faker-js/faker';
import { db } from './database';

async function seed() {
  faker.seed(123); // reproducible seed data

  const users = Array.from({ length: 50 }, () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    bio: faker.lorem.paragraph(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
    },
  }));

  await db.users.insertMany(users);
  console.log(`Seeded ${users.length} users`);
}
```

### Helpers for complex data

```ts
// Pick from array
const status = faker.helpers.arrayElement(['active', 'inactive', 'pending']);

// Pick multiple unique items
const tags = faker.helpers.arrayElements(
  ['js', 'ts', 'react', 'node', 'python'],
  { min: 1, max: 3 }
);

// Weighted selection
const plan = faker.helpers.weightedArrayElement([
  { value: 'free', weight: 5 },
  { value: 'pro', weight: 3 },
  { value: 'enterprise', weight: 1 },
]);

// Fake from pattern
const phone = faker.helpers.fromRegExp(/\+1-[0-9]{3}-[0-9]{3}-[0-9]{4}/);

// Maybe (50% chance of undefined)
const nickname = faker.helpers.maybe(() => faker.internet.username());
```

## Configuration

```ts
import { Faker, en, de, fr } from '@faker-js/faker';

// Custom faker with multiple locales (fallback chain)
const customFaker = new Faker({
  locale: [de, en], // try German first, fall back to English
});

// Set seed globally
faker.seed(42);

// Set seed per-instance
customFaker.seed(99);
```

## Tips & Gotchas

- **Use `faker.seed()` in tests** — Always seed faker in test setup for deterministic, reproducible test data. Without a seed, every test run generates different data, making failures hard to reproduce.
- **Import locale-specific faker for smaller bundles** — `import { faker } from '@faker-js/faker/locale/en'` is significantly smaller than the default import which includes all locales.
- **`faker.helpers.multiple()` for bulk generation** — Prefer `faker.helpers.multiple(factory, { count: 10 })` over manual loops for cleaner code.
- **Unique values are NOT guaranteed** — `faker.internet.email()` can produce duplicates. If you need uniqueness, combine with a Set or counter: `faker.internet.email({ firstName: `user${i}` })`.
- **Date objects, not strings** — `faker.date.past()` returns a JavaScript `Date` object, not a string. Use `.toISOString()` if you need ISO format.
- **Overrides in factories** — Always accept an overrides parameter in factory functions and spread it last (`{ ...generated, ...overrides }`) so tests can pin specific values.
- **`faker.helpers.fake()` for templates** — Build formatted strings: `faker.helpers.fake('{{person.firstName}} <{{internet.email}}>')` produces `'Alice <alice@example.com>'`.
- **Tree-shakeable** — The library is fully tree-shakeable when using named imports from specific locale paths.
