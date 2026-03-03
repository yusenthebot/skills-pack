---
name: ramda
description: >
  Functional programming utility library with auto-curried, data-last functions. Use when: composing data transformations, point-free style programming, immutable data manipulation with lenses, building reusable function pipelines. NOT for: simple one-off operations (use native JS), imperative code (use lodash), performance-critical hot paths.
---

# ramda

## Overview
Ramda is a functional programming library for JavaScript that emphasizes immutability, pure functions, and composability. All functions are automatically curried and follow a data-last argument order, making them ideal for function composition with `pipe` and `compose`. Unlike lodash, Ramda is designed specifically for the functional programming style, encouraging point-free code and reusable function pipelines.

## Installation
```bash
npm install ramda
# yarn
yarn add ramda
# pnpm
pnpm add ramda

# TypeScript types
npm install -D @types/ramda
```

## Core API / Commands

### pipe and compose
```js
import * as R from 'ramda';

// pipe: left to right
const processName = R.pipe(
  R.trim,
  R.toLower,
  R.replace(/\s+/g, '-'),
);
processName('  Hello World  ');  // 'hello-world'

// compose: right to left
const getInitials = R.compose(
  R.join('.'),
  R.map(R.head),
  R.split(' '),
);
getInitials('John Doe');  // 'J.D'
```

### Auto-currying
```js
import * as R from 'ramda';

// All Ramda functions are auto-curried
const add10 = R.add(10);
add10(5);  // 15

const getAge = R.prop('age');
getAge({ name: 'Alice', age: 30 });  // 30

const adults = R.filter(R.propSatisfies(R.gte(R.__, 18), 'age'));
adults([{ age: 15 }, { age: 22 }, { age: 17 }, { age: 30 }]);
// [{ age: 22 }, { age: 30 }]
```

### Data manipulation
```js
import * as R from 'ramda';

// Object operations
R.assoc('name', 'Bob', { name: 'Alice', age: 30 });
// { name: 'Bob', age: 30 }

R.dissoc('password', { name: 'Alice', password: 'secret' });
// { name: 'Alice' }

R.pick(['name', 'email'], { name: 'Alice', email: 'a@b.com', age: 30 });
// { name: 'Alice', email: 'a@b.com' }

R.mergeDeepRight(
  { db: { host: 'localhost', port: 5432 } },
  { db: { port: 3306 } },
);
// { db: { host: 'localhost', port: 3306 } }
```

### path and pathOr
```js
import * as R from 'ramda';

const data = { user: { address: { city: 'NYC' } } };

R.path(['user', 'address', 'city'], data);       // 'NYC'
R.path(['user', 'phone'], data);                  // undefined
R.pathOr('N/A', ['user', 'phone'], data);         // 'N/A'
```

### Lenses
```js
import * as R from 'ramda';

const nameLens = R.lensProp('name');
const addressCityLens = R.lensPath(['address', 'city']);

const person = { name: 'Alice', address: { city: 'NYC' } };

R.view(nameLens, person);                    // 'Alice'
R.set(nameLens, 'Bob', person);              // { name: 'Bob', address: { city: 'NYC' } }
R.over(nameLens, R.toUpper, person);         // { name: 'ALICE', address: { city: 'NYC' } }
R.set(addressCityLens, 'LA', person);        // { name: 'Alice', address: { city: 'LA' } }
```

### evolve
```js
import * as R from 'ramda';

const transformations = {
  name: R.toUpper,
  age: R.inc,
  scores: R.map(R.multiply(10)),
};

R.evolve(transformations, { name: 'alice', age: 29, scores: [8, 9, 7] });
// { name: 'ALICE', age: 30, scores: [80, 90, 70] }
```

## Common Patterns

### Data transformation pipeline
```js
import * as R from 'ramda';

const users = [
  { name: 'Alice', dept: 'Engineering', salary: 120000 },
  { name: 'Bob', dept: 'Engineering', salary: 110000 },
  { name: 'Carol', dept: 'Marketing', salary: 95000 },
  { name: 'Dave', dept: 'Engineering', salary: 130000 },
];

const avgEngineeringSalary = R.pipe(
  R.filter(R.propEq('Engineering', 'dept')),
  R.map(R.prop('salary')),
  R.mean,
);

avgEngineeringSalary(users);  // 120000
```

### Immutable nested updates
```js
import * as R from 'ramda';

const state = {
  users: {
    u1: { name: 'Alice', settings: { theme: 'dark', lang: 'en' } },
    u2: { name: 'Bob', settings: { theme: 'light', lang: 'fr' } },
  },
};

// Update deeply nested value immutably
const updateTheme = R.assocPath(['users', 'u1', 'settings', 'theme'], 'light');
const newState = updateTheme(state);
// state.users.u1.settings.theme is still 'dark'
// newState.users.u1.settings.theme is 'light'
```

### Reusable validators
```js
import * as R from 'ramda';

const isNonEmptyString = R.allPass([R.is(String), R.complement(R.isEmpty)]);
const isPositive = R.both(R.is(Number), R.gt(R.__, 0));
const hasRequiredFields = R.allPass([
  R.propSatisfies(isNonEmptyString, 'name'),
  R.propSatisfies(isNonEmptyString, 'email'),
  R.propSatisfies(isPositive, 'age'),
]);

hasRequiredFields({ name: 'Alice', email: 'a@b.com', age: 30 }); // true
hasRequiredFields({ name: '', email: 'a@b.com', age: 30 });       // false
```

## Configuration
Ramda is configuration-free. Import the whole library or individual functions:

```js
// Full import
import * as R from 'ramda';

// Individual imports (tree-shakable)
import pipe from 'ramda/es/pipe.js';
import map from 'ramda/es/map.js';
```

## Tips & Gotchas
- **Data-last argument order**: Unlike lodash, the data argument comes last. `R.map(fn, list)` not `R.map(list, fn)`. This enables partial application and point-free style.
- **Everything is auto-curried**: `R.add(1, 2)` and `R.add(1)(2)` both return `3`. This applies to all Ramda functions.
- **`R.__` is the placeholder**: Use it to partially apply arguments at any position: `R.subtract(R.__, 10)(15)` gives `5`.
- **Immutable**: Ramda never mutates input data. Operations like `assoc`, `dissoc`, `evolve` all return new objects.
- **`pipe` vs `compose`**: `pipe` reads left-to-right (more natural for most people). `compose` reads right-to-left (mathematical convention). They are equivalent.
- **`path` uses arrays, not dot strings**: Use `R.path(['a', 'b', 'c'])` not `R.path('a.b.c')`.
- **Performance trade-off**: Ramda prioritizes composability over raw speed. For hot loops processing millions of items, native methods may be faster.
- **Pair with TypeScript carefully**: Ramda's heavy use of currying and composition can challenge TypeScript's type inference. Consider `ts-toolbelt` for better Ramda typings.
- **`R.equals` for deep equality**: `R.equals({a: 1}, {a: 1})` returns `true`, performing structural comparison.
