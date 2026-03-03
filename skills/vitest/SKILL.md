---
name: vitest
description: >
  Vite-native unit testing framework with ESM-first design, instant HMR-like watch mode, and out-of-box TypeScript support. Use when: writing unit/integration tests for Vite projects, testing TypeScript/ESM code without config, running tests concurrently for speed. NOT for: E2E browser testing (use Playwright), testing non-JS environments.
---

# vitest

## Overview

Vitest is a blazing-fast unit testing framework powered by Vite. It reuses Vite's transform pipeline so your tests run with the same config as your app — no duplicate setup for JSX, TypeScript, or path aliases. Its watch mode re-runs only affected tests using Vite's module graph, making the feedback loop nearly instant.

## Installation

```bash
npm install -D vitest
yarn add -D vitest
pnpm add -D vitest
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Core API / Commands

### Basic test structure

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Calculator', () => {
  let calc: Calculator;

  beforeEach(() => {
    calc = new Calculator();
  });

  it('adds two numbers', () => {
    expect(calc.add(2, 3)).toBe(5);
  });

  it('throws on division by zero', () => {
    expect(() => calc.divide(1, 0)).toThrow('Cannot divide by zero');
  });
});
```

### Mocking with vi

```ts
import { vi, describe, it, expect } from 'vitest';
import { sendEmail } from './email';

// Mock an entire module
vi.mock('./email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ sent: true }),
}));

// Spy on a method
const spy = vi.spyOn(console, 'log');
console.log('hello');
expect(spy).toHaveBeenCalledWith('hello');

// Mock function
const fn = vi.fn((x: number) => x * 2);
fn(3);
expect(fn).toHaveReturnedWith(6);
```

### Snapshot testing

```ts
it('renders user card', () => {
  const html = renderUserCard({ name: 'Alice', role: 'admin' });
  expect(html).toMatchSnapshot();
});

it('serializes config', () => {
  expect(getConfig()).toMatchInlineSnapshot(`
    {
      "port": 3000,
      "host": "localhost",
    }
  `);
});
```

## Common Patterns

### Async testing

```ts
it('fetches users from API', async () => {
  const users = await fetchUsers();
  expect(users).toHaveLength(3);
  expect(users[0]).toMatchObject({ name: 'Alice' });
});

it('rejects with an error on 404', async () => {
  await expect(fetchUser(999)).rejects.toThrow('Not found');
});
```

### Concurrent tests

```ts
describe.concurrent('database queries', () => {
  it('fetches user by id', async ({ expect }) => {
    const user = await db.getUser(1);
    expect(user.name).toBe('Alice');
  });

  it('fetches user by email', async ({ expect }) => {
    const user = await db.getUserByEmail('alice@example.com');
    expect(user.id).toBe(1);
  });
});
```

### In-source testing

```ts
// src/utils.ts
export function sum(a: number, b: number) {
  return a + b;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('sum', () => {
    expect(sum(1, 2)).toBe(3);
  });
}
```

Enable in `vite.config.ts`:

```ts
export default defineConfig({
  define: {
    'import.meta.vitest': 'undefined', // tree-shaken in prod
  },
  test: {
    includeSource: ['src/**/*.ts'],
  },
});
```

## Configuration

`vitest.config.ts` (or inside `vite.config.ts` under `test`):

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,                    // use describe/it without imports
    environment: 'jsdom',             // 'node' | 'jsdom' | 'happy-dom'
    include: ['src/**/*.{test,spec}.{ts,js}'],
    coverage: {
      provider: 'v8',                // 'v8' | 'istanbul'
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules', 'tests/fixtures'],
    },
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    pool: 'threads',                  // 'threads' | 'forks' | 'vmThreads'
    workspace: './vitest.workspace.ts', // monorepo workspace
  },
});
```

### Workspace configuration (monorepo)

```ts
// vitest.workspace.ts
export default [
  'packages/*/vitest.config.ts',
  {
    test: {
      name: 'unit',
      include: ['src/**/*.test.ts'],
      environment: 'node',
    },
  },
];
```

## Tips & Gotchas

- **Use `vi.mock` at the top level** — Vitest hoists `vi.mock` calls to the top of the file automatically, but the factory function cannot reference variables from the outer scope unless you use `vi.hoisted()`.
- **`vi.hoisted` for shared mock variables** — Use `const { mockFn } = vi.hoisted(() => ({ mockFn: vi.fn() }))` to define mocks that are available inside `vi.mock` factories.
- **Reset mocks between tests** — Call `vi.restoreAllMocks()` in `afterEach` or set `mockReset: true` in config to prevent mock state leaking between tests.
- **Fake timers** — Use `vi.useFakeTimers()` and `vi.advanceTimersByTime(ms)` for setTimeout/setInterval testing. Call `vi.useRealTimers()` in cleanup.
- **Type testing** — Use `expectTypeOf(fn).toBeFunction()` and `assertType<string>(value)` with `typecheck: { enabled: true }` to validate TypeScript types at test time.
- **Environment per file** — Add `// @vitest-environment jsdom` at the top of a file to override the default environment for that file only.
- **Filtering tests** — Run `vitest -t "pattern"` to run only tests matching the name, or use `.only` and `.skip` modifiers on `describe`/`it`.
- **Coverage thresholds** — Set `coverage.thresholds: { lines: 80, branches: 80 }` to fail CI when coverage drops below a target.
- **Avoid importing from `vitest` when `globals: true`** — With globals enabled, `describe`, `it`, `expect` are available without imports, but `vi` must still be imported.
