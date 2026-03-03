---
name: sinon
description: >
  Standalone test spies, stubs, mocks, and fake timers for JavaScript. Use when: creating test doubles in any test framework, faking timers/dates, replacing module dependencies in tests. NOT for: HTTP mocking (use MSW/nock), test running (use Jest/Vitest/Mocha).
---

# sinon

## Overview

Sinon.JS provides standalone test doubles — spies, stubs, mocks, fakes, and fake timers — that work with any test framework (Mocha, Jest, Vitest, AVA, etc.). It excels at verifying function call behavior, replacing dependencies with controlled implementations, and manipulating time in tests. Sinon does not include a test runner or assertion library, making it composable with your existing test stack.

## Installation

```bash
npm install -D sinon
# For TypeScript:
npm install -D sinon @types/sinon
```

## Core API / Commands

### Spies — observe function calls without changing behavior

```ts
import sinon from 'sinon';

const spy = sinon.spy();

spy('hello', 42);
spy('world');

console.log(spy.callCount);          // 2
console.log(spy.calledWith('hello')); // true
console.log(spy.firstCall.args);      // ['hello', 42]

// Spy on existing method (wraps original)
const consoleSpy = sinon.spy(console, 'log');
console.log('test');
console.log(consoleSpy.calledOnce);   // true
consoleSpy.restore();
```

### Stubs — replace function behavior

```ts
const stub = sinon.stub();

// Define return values
stub.returns(42);
stub.withArgs('a').returns(1);
stub.withArgs('b').returns(2);
stub.onFirstCall().returns('first');
stub.onSecondCall().returns('second');

// Stub a method on an object
const db = { query: async () => [] };
sinon.stub(db, 'query').resolves([{ id: 1, name: 'Alice' }]);

const result = await db.query('SELECT * FROM users');
// result = [{ id: 1, name: 'Alice' }]
```

### Mocks — stubs with built-in expectations

```ts
const api = { fetchUser: () => {} };
const mock = sinon.mock(api);

mock.expects('fetchUser')
  .once()
  .withArgs(1)
  .returns({ id: 1, name: 'Alice' });

// Use the mocked object
const user = api.fetchUser(1);

// Verify expectations
mock.verify(); // throws if expectations not met
mock.restore();
```

### Fakes — simpler alternative to stubs

```ts
const fake = sinon.fake.returns('hello');
fake();
console.log(fake.calledOnce); // true
console.log(fake.lastArg);   // undefined

// Fake that throws
const failingFake = sinon.fake.throws(new Error('boom'));

// Async fake
const asyncFake = sinon.fake.resolves({ data: 'ok' });
```

## Common Patterns

### Fake timers

```ts
let clock;

beforeEach(() => {
  clock = sinon.useFakeTimers({
    now: new Date('2025-01-15T10:00:00Z'),
    shouldAdvanceTime: false,
  });
});

afterEach(() => {
  clock.restore();
});

it('expires token after 1 hour', () => {
  const token = createToken();
  expect(token.isExpired()).toBe(false);

  clock.tick(60 * 60 * 1000); // advance 1 hour
  expect(token.isExpired()).toBe(true);
});

it('schedules callback with setTimeout', () => {
  const callback = sinon.spy();
  setTimeout(callback, 5000);

  clock.tick(4999);
  expect(callback.called).toBe(false);

  clock.tick(1);
  expect(callback.calledOnce).toBe(true);
});
```

### Sandbox for automatic cleanup

```ts
const sandbox = sinon.createSandbox();

afterEach(() => {
  sandbox.restore(); // restores ALL stubs/spies/mocks created via sandbox
});

it('uses sandbox stubs', () => {
  const stub = sandbox.stub(myModule, 'fetchData').resolves({ ok: true });
  // no need to manually restore — sandbox.restore() handles it
});
```

### Asserting call order and arguments

```ts
const save = sinon.stub();
const validate = sinon.stub().returns(true);

validate(inputData);
save(inputData);

// Verify call order
sinon.assert.callOrder(validate, save);

// Detailed argument matching
sinon.assert.calledWithMatch(save, {
  name: sinon.match.string,
  age: sinon.match(val => val > 0, 'positive number'),
});

// Exact match
sinon.assert.calledWithExactly(validate, inputData);
```

## Configuration

Sinon has no global configuration file. Behavior is controlled per instance:

```ts
// Custom sandbox configuration
const sandbox = sinon.createSandbox({
  useFakeTimers: true,
  useFakeServer: false,
});

// Sinon assertions can use a custom message
sinon.assert.pass = (message) => {
  // custom handling
};

// Configure fake timer behavior
const clock = sinon.useFakeTimers({
  now: Date.now(),
  toFake: ['setTimeout', 'setInterval', 'Date'], // which APIs to fake
  shouldAdvanceTime: false,
  shouldClearNativeTimers: true,
});
```

## Tips & Gotchas

- **Always restore stubs and spies** — Use `sandbox.restore()` in `afterEach` or call `.restore()` on individual stubs. Unreleased stubs persist and corrupt subsequent tests.
- **Use sandboxes over raw sinon** — `sinon.createSandbox()` groups all doubles for batch cleanup. This is the recommended approach over calling `sinon.stub()` directly.
- **`stub.callsFake()` for custom logic** — When you need a stub that runs real logic: `stub.callsFake((arg) => arg.toUpperCase())`.
- **`stub.resolves()` and `stub.rejects()`** — Use these for async stubs instead of `stub.returns(Promise.resolve(...))` for cleaner code.
- **`sinon.match` for flexible assertions** — Match partial objects, types, or custom predicates: `sinon.match({ name: sinon.match.string })`, `sinon.match.instanceOf(Error)`.
- **Spies wrap, stubs replace** — A spy calls the original function and records metadata. A stub replaces the function entirely. Choose based on whether you need the original behavior.
- **`calledOnce` vs `calledOnceWithExactly`** — `calledOnce` only checks call count. Use `calledOnceWithExactly(arg)` to verify both count and arguments in a single assertion.
- **Fake timers affect global Date** — `sinon.useFakeTimers()` replaces `Date`, `setTimeout`, `setInterval`, and `process.nextTick`. If a library caches a reference to `setTimeout` before your fake timer setup, it won't be intercepted.
- **Do not stub non-existent properties** — `sinon.stub(obj, 'nonExistent')` throws. The property must exist on the object. Use `sinon.stub(obj, 'method')` only when `obj.method` is defined.
- **Combine with Chai for expressive syntax** — Use `sinon-chai` plugin: `expect(spy).to.have.been.calledWith('arg')` instead of `sinon.assert.calledWith(spy, 'arg')`.
