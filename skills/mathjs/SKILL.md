---
name: mathjs
description: >
  Extensive math library for JavaScript with expression parsing, matrices, units, BigNumber, complex numbers, and statistics. Use when: evaluating math expressions from strings, matrix operations, unit conversions, symbolic math, statistical calculations. NOT for: simple arithmetic (use native JS), financial precision (use decimal.js), ML/tensor operations (use tensorflow.js).
---

# mathjs

## Overview
mathjs is a comprehensive math library for JavaScript and Node.js. It provides a flexible expression parser, supports matrices, complex numbers, units, fractions, BigNumbers, and more. It can be used as a command-line calculator, as a library in scripts, or embedded in applications that need to evaluate user-supplied mathematical expressions safely.

## Installation
```bash
npm install mathjs
# yarn
yarn add mathjs
# pnpm
pnpm add mathjs
```

## Core API / Commands

### Expression evaluation
```js
import { evaluate } from 'mathjs';

evaluate('2 + 3 * 4');           // 14
evaluate('sqrt(16)');             // 4
evaluate('sin(pi / 2)');          // 1
evaluate('12.7 cm to inch');      // 5 inch (unit conversion)
evaluate('2 ^ 10');               // 1024
evaluate('log(1000, 10)');        // 3

// Multiple expressions
evaluate(['a = 3', 'b = 4', 'sqrt(a^2 + b^2)']);
// [3, 4, 5]
```

### Direct function calls
```js
import { add, multiply, sqrt, pow, factorial, round } from 'mathjs';

add(2, 3);             // 5
multiply(3, 4);         // 12
sqrt(144);              // 12
pow(2, 10);             // 1024
factorial(6);           // 720
round(3.14159, 2);      // 3.14
```

### Matrices
```js
import { matrix, multiply, det, inv, transpose, zeros, ones } from 'mathjs';

const A = matrix([[1, 2], [3, 4]]);
const B = matrix([[5, 6], [7, 8]]);

const product = multiply(A, B);
// [[19, 22], [43, 50]]

det(A);          // -2
inv(A);          // [[-2, 1], [1.5, -0.5]]
transpose(A);    // [[1, 3], [2, 4]]
zeros(3, 3);     // 3x3 zero matrix
ones(2, 4);      // 2x4 matrix of ones
```

### Units
```js
import { unit, evaluate } from 'mathjs';

const length = unit(5, 'km');
length.to('mile');              // ~3.107 mile
length.to('m');                 // 5000 m

evaluate('5 kg + 3000 g');      // 8 kg
evaluate('100 km/h to m/s');    // ~27.778 m/s
evaluate('70 degF to degC');    // ~21.11 degC
```

### BigNumber for precision
```js
import { create, all } from 'mathjs';

const math = create(all, {
  number: 'BigNumber',
  precision: 64,
});

math.evaluate('0.1 + 0.2');           // BigNumber 0.3 (exact!)
math.evaluate('1 / 3');               // BigNumber 0.333...33 (64 digits)
math.evaluate('2 ^ 128');             // Exact large integer
```

### Complex numbers
```js
import { complex, add, multiply, abs, arg } from 'mathjs';

const a = complex(3, 4);       // 3 + 4i
const b = complex('2 + 3i');   // 2 + 3i

add(a, b);         // 5 + 7i
multiply(a, b);    // -6 + 17i
abs(a);            // 5 (magnitude)
arg(a);            // 0.9273 (angle in radians)
```

### Statistics
```js
import { mean, median, std, variance, min, max, sum, quantileSeq } from 'mathjs';

const data = [4, 8, 15, 16, 23, 42];

mean(data);           // 18
median(data);         // 15.5
std(data);            // ~12.74
variance(data);       // ~162.27
min(data);            // 4
max(data);            // 42
sum(data);            // 108
quantileSeq(data, 0.75); // 75th percentile
```

## Common Patterns

### Safe expression evaluator (calculator app)
```js
import { evaluate, parse } from 'mathjs';

function safeEvaluate(expression) {
  try {
    const result = evaluate(expression);
    return { success: true, result: result.toString() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

safeEvaluate('2 + 3 * (4 - 1)');   // { success: true, result: '11' }
safeEvaluate('sqrt(-1)');           // { success: true, result: 'i' }
safeEvaluate('invalid %%');         // { success: false, error: '...' }
```

### Custom function scope
```js
import { create, all } from 'mathjs';

const math = create(all);

// Register custom functions
math.import({
  double: (x) => x * 2,
  clamp: (val, min, max) => Math.min(Math.max(val, min), max),
});

math.evaluate('double(21)');         // 42
math.evaluate('clamp(150, 0, 100)'); // 100
```

### Matrix operations for linear algebra
```js
import { matrix, multiply, add, inv, det, lusolve } from 'mathjs';

// Solve system of linear equations: Ax = b
// 2x + y = 5
// x + 3y = 10
const A = matrix([[2, 1], [1, 3]]);
const b = matrix([[5], [10]]);

const solution = lusolve(A, b);
// [[1], [3]] meaning x=1, y=3
```

## Configuration
```js
import { create, all } from 'mathjs';

const math = create(all, {
  number: 'number',       // 'number', 'BigNumber', or 'Fraction'
  precision: 64,           // Decimal places for BigNumber
  epsilon: 1e-12,          // Tolerance for comparisons
  matrix: 'Matrix',        // 'Matrix' or 'Array'
  predictable: false,      // Ensure consistent output types
});
```

## Tips & Gotchas
- **`evaluate` handles user input safely**: Unlike `eval()`, mathjs's `evaluate` only processes mathematical expressions and cannot execute arbitrary JavaScript.
- **Import subsets for smaller bundles**: Use `import { create, addDependencies, ... }` to import only the functions you need instead of `all`.
- **Units are first-class**: You can do arithmetic with units and they auto-convert: `evaluate('5 inch + 3 cm')` works correctly.
- **BigNumber avoids floating-point issues**: Set `number: 'BigNumber'` in config to avoid `0.1 + 0.2 !== 0.3` problems.
- **Matrices vs arrays**: By default, `multiply(matrix, matrix)` returns a Matrix object. Use `.toArray()` to convert back, or set `matrix: 'Array'` in config.
- **Scope for variables**: Pass a scope object as the second argument to `evaluate` for variable bindings: `evaluate('x + y', { x: 3, y: 4 })`.
- **Expression parsing is powerful**: Use `parse()` to get an expression tree for analysis, transformation, or compilation before evaluation.
- **Chained operations**: Use `math.chain(3).add(4).multiply(2).done()` for fluent-style chaining.
