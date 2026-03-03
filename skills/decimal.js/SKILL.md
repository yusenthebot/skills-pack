---
name: decimal.js
description: >
  Arbitrary-precision decimal arithmetic library for JavaScript. Use when: financial calculations, currency math, avoiding floating-point errors, precise division/rounding, comparisons requiring exact decimal values. NOT for: general math (use native JS), matrix/statistical operations (use mathjs), integer-only big numbers (use native BigInt).
---

# decimal.js

## Overview
decimal.js provides an arbitrary-precision Decimal type for JavaScript. It solves the classic floating-point problem (`0.1 + 0.2 !== 0.3`) by representing numbers as exact decimals. It is essential for financial calculations, pricing, tax computations, and any domain where rounding errors from IEEE 754 floating-point are unacceptable. The API supports all standard arithmetic operations plus rounding, comparison, and conversion methods.

## Installation
```bash
npm install decimal.js
# yarn
yarn add decimal.js
# pnpm
pnpm add decimal.js
```

## Core API / Commands

### Creating Decimals
```js
import Decimal from 'decimal.js';

new Decimal(0.1);          // '0.1' (exact)
new Decimal('0.1');        // '0.1' (from string)
new Decimal('123.456');    // '123.456'
new Decimal(1e20);         // '100000000000000000000'
new Decimal('Infinity');   // Infinity
```

### Arithmetic
```js
import Decimal from 'decimal.js';

const a = new Decimal('0.1');
const b = new Decimal('0.2');

a.plus(b).toString();          // '0.3' (exact!)
a.minus(b).toString();         // '-0.1'
a.times(b).toString();         // '0.02'
a.dividedBy(b).toString();     // '0.5'

// Chaining
new Decimal('100')
  .times('0.15')
  .plus('2.50')
  .toString();                 // '17.50'

// Static methods
Decimal.add('0.1', '0.2').toString();  // '0.3'
Decimal.mul('19.99', '100').toString(); // '1999'
```

### Rounding and formatting
```js
import Decimal from 'decimal.js';

const price = new Decimal('19.995');

price.toFixed(2);                           // '20.00' (rounds half up)
price.toDecimalPlaces(2).toString();        // '20.00'
price.toDecimalPlaces(2, Decimal.ROUND_DOWN).toString(); // '19.99'
price.toSignificantDigits(4).toString();    // '20.00'
price.toPrecision(6);                       // '19.9950'

// Rounding modes
new Decimal('2.5').toFixed(0);                             // '3' (ROUND_HALF_UP)
new Decimal('2.5').toDecimalPlaces(0, Decimal.ROUND_HALF_EVEN).toString(); // '2' (banker's rounding)
```

### Comparison
```js
import Decimal from 'decimal.js';

const a = new Decimal('10.5');
const b = new Decimal('10.50');

a.equals(b);              // true
a.greaterThan('9');        // true
a.lessThan('11');          // true
a.greaterThanOrEqualTo(b); // true
a.compareTo('10.5');       // 0 (equal)
a.compareTo('10.4');       // 1 (greater)
a.compareTo('10.6');       // -1 (less)
a.isZero();                // false
a.isPositive();            // true
a.isInteger();             // false
```

### Math operations
```js
import Decimal from 'decimal.js';

new Decimal('2').sqrt().toString();           // '1.4142135623730950488...'
new Decimal('100').ln().toString();           // '4.605170185988091...'
new Decimal('2').pow(10).toString();          // '1024'
Decimal.abs('-42').toString();                // '42'
Decimal.max('1', '5', '3').toString();        // '5'
Decimal.min('1', '5', '3').toString();        // '1'
```

## Common Patterns

### Currency calculations
```js
import Decimal from 'decimal.js';

function calculateTotal(items) {
  let total = new Decimal('0');
  for (const item of items) {
    const lineTotal = new Decimal(item.price).times(item.quantity);
    total = total.plus(lineTotal);
  }
  return total;
}

function applyTax(subtotal, taxRate) {
  const tax = new Decimal(subtotal).times(taxRate).toDecimalPlaces(2);
  const total = new Decimal(subtotal).plus(tax);
  return { subtotal, tax: tax.toString(), total: total.toString() };
}

const items = [
  { price: '19.99', quantity: 3 },
  { price: '5.49', quantity: 2 },
];
const subtotal = calculateTotal(items);  // 70.95
const result = applyTax(subtotal, '0.0825');
// { subtotal: '70.95', tax: '5.85', total: '76.80' }
```

### Percentage split without rounding loss
```js
import Decimal from 'decimal.js';

function splitAmount(total, parts) {
  const amount = new Decimal(total);
  const share = amount.dividedBy(parts).toDecimalPlaces(2, Decimal.ROUND_DOWN);
  const remainder = amount.minus(share.times(parts));
  // Give remainder to first person
  const shares = Array(parts).fill(share.toString());
  shares[0] = share.plus(remainder).toString();
  return shares;
}

splitAmount('100.00', 3);
// ['33.34', '33.33', '33.33'] — always sums to exactly 100.00
```

### Safe JSON serialization
```js
import Decimal from 'decimal.js';

const data = {
  price: new Decimal('29.99'),
  quantity: 5,
  total: new Decimal('149.95'),
};

// Serialize
const json = JSON.stringify(data, (key, value) => {
  if (value instanceof Decimal) return value.toString();
  return value;
});
// '{"price":"29.99","quantity":5,"total":"149.95"}'

// Deserialize
const parsed = JSON.parse(json);
const price = new Decimal(parsed.price);
```

## Configuration
```js
import Decimal from 'decimal.js';

// Global configuration
Decimal.set({
  precision: 20,                   // Significant digits (default: 20)
  rounding: Decimal.ROUND_HALF_UP, // Default rounding mode
  toExpNeg: -7,                    // Exponent threshold for toString
  toExpPos: 21,                    // Exponent threshold for toString
  minE: -9e15,                     // Minimum exponent
  maxE: 9e15,                      // Maximum exponent
});

// Rounding modes
Decimal.ROUND_UP;         // 0 - Round away from zero
Decimal.ROUND_DOWN;       // 1 - Round towards zero (truncate)
Decimal.ROUND_CEIL;       // 2 - Round towards +Infinity
Decimal.ROUND_FLOOR;      // 3 - Round towards -Infinity
Decimal.ROUND_HALF_UP;    // 4 - Round half away from zero (default)
Decimal.ROUND_HALF_DOWN;  // 5 - Round half towards zero
Decimal.ROUND_HALF_EVEN;  // 6 - Round half to even (banker's rounding)
Decimal.ROUND_HALF_CEIL;  // 7 - Round half towards +Infinity
Decimal.ROUND_HALF_FLOOR; // 8 - Round half towards -Infinity
```

## Tips & Gotchas
- **Always pass strings to the constructor**: `new Decimal('0.1')` is exact, but `new Decimal(0.1)` captures the floating-point imprecision of `0.1` in JavaScript (it is `0.1000000000000000055511151231257827021181583404541015625`).
- **Immutable**: All arithmetic methods return new Decimal instances. The original is never modified.
- **`toFixed` vs `toString`**: `toFixed(2)` returns a string with exactly 2 decimal places (e.g., `'10.00'`). `toString()` omits trailing zeros (e.g., `'10'`).
- **Use `compareTo` or comparison methods, not `===`**: Two Decimal instances are different objects. Use `.equals()` for equality checks.
- **Banker's rounding**: For financial applications, use `ROUND_HALF_EVEN` to minimize systematic bias: `new Decimal('2.5').toDecimalPlaces(0, Decimal.ROUND_HALF_EVEN)` gives `2`.
- **Performance**: Decimal operations are slower than native numbers. Use them where precision matters (money, tax), not for general-purpose math.
- **No NaN comparison**: `new Decimal(NaN).equals(NaN)` returns `false`, consistent with IEEE 754 behavior.
- **Decimal.js vs bignumber.js vs big.js**: All three are by the same author. decimal.js adds trigonometric and exponential functions. For pure financial math, big.js (smaller) may suffice.
