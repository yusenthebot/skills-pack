---
name: lodash
description: >
  Utility library for arrays, objects, strings. Use when: complex data manipulation, deep cloning, throttle/debounce. NOT for: simple operations native JS can handle, new projects (consider native alternatives first).
---

# lodash

## Installation
```bash
npm install lodash
npm install -D @types/lodash
```

## Most Used Functions

```ts
import _ from 'lodash';
// or cherry-pick (better tree-shaking):
import groupBy from 'lodash/groupBy';
import debounce from 'lodash/debounce';
```

## Arrays

```ts
_.chunk([1,2,3,4,5], 2)            // [[1,2],[3,4],[5]]
_.flatten([[1,2],[3,4]])            // [1,2,3,4]
_.flatMap([1,2], n => [n, n*2])    // [1,2,2,4]
_.uniq([1,2,2,3])                  // [1,2,3]
_.uniqBy(users, 'email')           // dedupe by field
_.difference([1,2,3], [2,3])       // [1]
_.intersection([1,2,3], [2,3,4])   // [2,3]
_.sortBy(users, ['name', 'age'])   // multi-field sort
_.orderBy(users, ['age'], ['desc'])
_.groupBy(users, 'role')           // { admin: [...], user: [...] }
_.partition(users, 'active')       // [[active], [inactive]]
_.take([1,2,3,4], 2)              // [1,2]
_.drop([1,2,3,4], 2)              // [3,4]
_.sample([1,2,3,4,5])             // random element
_.shuffle([1,2,3,4,5])
```

## Objects

```ts
_.get(obj, 'a.b.c', 'default')    // safe deep access
_.set(obj, 'a.b.c', value)        // deep set (mutates)
_.pick(obj, ['a', 'b'])           // { a, b }
_.omit(obj, ['password'])         // obj without 'password'
_.merge({a: 1}, {b: 2})          // deep merge
_.mergeWith(a, b, customizer)
_.cloneDeep(obj)                  // deep clone
_.isEqual(a, b)                   // deep equality
_.mapValues(obj, v => v * 2)      // transform values
_.keyBy(users, 'id')             // { '1': user1, '2': user2 }
```

## Functions

```ts
// Debounce — delays execution until after N ms of inactivity
const debouncedSearch = _.debounce(search, 300);

// Throttle — max once per N ms
const throttledScroll = _.throttle(onScroll, 100);

// Memoize — cache results
const expensiveFn = _.memoize(compute);

// Once — execute only once
const initOnce = _.once(init);

// Partial — partial application
const add = (a: number, b: number) => a + b;
const add5 = _.partial(add, 5);
add5(3) // 8
```

## Tips & Gotchas
- Import individual functions for better tree-shaking: `import groupBy from 'lodash/groupBy'`
- Or use `lodash-es` for ESM tree-shaking with bundlers
- `_.cloneDeep` handles circular references; `structuredClone` (native) is often faster
- `_.merge` mutates the first argument — use `_.merge({}, obj1, obj2)` to avoid mutation
- Many lodash functions are now native: `Array.prototype.flat()`, `Object.entries()`, optional chaining
