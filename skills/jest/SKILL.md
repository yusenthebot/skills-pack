---
name: jest
description: >
  Full-featured JavaScript testing framework with built-in assertions, mocking, coverage, and snapshot testing. Use when: writing unit/integration tests for Node.js or React apps, needing zero-config test runner with rich ecosystem. NOT for: E2E browser testing (use Playwright/Cypress), Vite-based projects (use Vitest).
---

# jest

## Overview

Jest is a comprehensive testing framework developed by Meta that provides a complete solution for JavaScript testing. It includes a test runner, assertion library, mocking utilities, code coverage, and snapshot testing out of the box. Its watch mode, parallel execution, and intelligent test ordering make for a fast development workflow.

## Installation

```bash
npm install -D jest
# For TypeScript:
npm install -D jest ts-jest @types/jest
# For ESM/TypeScript with SWC (faster):
npm install -D jest @swc/jest
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Core API / Commands

### Basic test structure

```js
const { sum, multiply } = require('./math');

describe('math utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });

  it('multiplies two numbers', () => {
    expect(multiply(3, 4)).toBe(12);
  });

  it('handles edge cases', () => {
    expect(sum(0, 0)).toBe(0);
    expect(sum(-1, 1)).toBe(0);
  });
});
```

### Mocking

```js
// Mock a module
jest.mock('./database', () => ({
  query: jest.fn().mockResolvedValue([{ id: 1, name: 'Alice' }]),
}));

// Mock function
const callback = jest.fn((x) => x + 1);
callback(5);
expect(callback).toHaveBeenCalledWith(5);
expect(callback).toHaveReturnedWith(6);

// Spy on existing method
const spy = jest.spyOn(Math, 'random').mockReturnValue(0.42);
expect(Math.random()).toBe(0.42);
spy.mockRestore();
```

### Snapshot testing

```js
it('renders correctly', () => {
  const tree = renderer.create(<Button label="Click me" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('matches inline snapshot', () => {
  expect(getConfig()).toMatchInlineSnapshot(`
    {
      "debug": false,
      "port": 3000,
    }
  `);
});
```

## Common Patterns

### Async testing

```js
// async/await
it('fetches user data', async () => {
  const data = await fetchUser(1);
  expect(data.name).toBe('Alice');
});

// Promises
it('rejects on invalid input', () => {
  return expect(fetchUser(-1)).rejects.toThrow('Invalid ID');
});

// Callbacks (use done)
it('calls back with data', (done) => {
  readFile('config.json', (err, data) => {
    expect(err).toBeNull();
    expect(data).toBeDefined();
    done();
  });
});
```

### Custom matchers

```js
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },
});

it('picks a number in range', () => {
  expect(pickRandom(1, 10)).toBeWithinRange(1, 10);
});
```

### Testing timers

```js
jest.useFakeTimers();

it('calls callback after 1 second', () => {
  const cb = jest.fn();
  delayedCall(cb, 1000);

  expect(cb).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1000);
  expect(cb).toHaveBeenCalledTimes(1);
});

afterEach(() => {
  jest.useRealTimers();
});
```

## Configuration

`jest.config.js`:

```js
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',               // 'node' | 'jsdom'
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.{js,ts}'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',             // or '@swc/jest' for speed
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',       // path alias
    '\\.(css|less)$': 'identity-obj-proxy', // CSS modules
  },
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
  setupFilesAfterSetup: ['<rootDir>/tests/setup.js'],
  clearMocks: true,
};
```

## Tips & Gotchas

- **`jest.mock` is hoisted** — Jest automatically moves `jest.mock()` calls to the top of the file. Variables referenced inside the factory must be prefixed with `mock` (e.g., `mockFetch`) to be accessible.
- **Use `clearMocks: true` in config** — This automatically calls `jest.clearAllMocks()` between tests so mock call counts and return values don't leak.
- **`--watch` vs `--watchAll`** — `--watch` only re-runs tests related to changed files (needs Git), while `--watchAll` re-runs everything.
- **ESM support is experimental** — Jest's native ESM support requires `--experimental-vm-modules` flag. For most projects, use `ts-jest` or `@swc/jest` transforms instead.
- **`moduleNameMapper` order matters** — Mappers are applied in order; put more specific patterns first.
- **Use `jest.requireActual`** — When partially mocking a module: `jest.mock('./utils', () => ({ ...jest.requireActual('./utils'), fetchData: jest.fn() }))`.
- **`toEqual` vs `toBe`** — Use `toBe` for primitives and reference equality; use `toEqual` for deep equality on objects and arrays.
- **`expect.objectContaining`** — Match a subset of an object: `expect(result).toEqual(expect.objectContaining({ status: 'ok' }))`.
- **Run single test file** — `jest path/to/file.test.js` or press `p` in watch mode to filter by filename pattern.
- **Parallel by default** — Jest runs test files in parallel workers. Use `--runInBand` for serial execution when tests share resources.
