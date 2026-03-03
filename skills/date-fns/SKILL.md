---
name: "date-fns"
version: "4.1.0"
downloads: 196.2M/month
description: >
  Modern JavaScript date utility library. Use when: It has 200+ functions for all occasions; Modular: Pick what you need. Works with webpack, Browserify, or Rollup and also supports tree-shaking; Native dates: Uses existing native type. It doesn't extend core objects for safety's sake. NOT for: timezone database hosting; building calendar UIs.
---

# date-fns

## Overview
Modern JavaScript date utility library. 🔥️ NEW: date-fns v4.0 with first-class time zone support is out.

## Installation
```bash
npm install date-fns
```

## Core API / Usage
```js
import { compareAsc, format } from "date-fns";

format(new Date(2014, 1, 11), "yyyy-MM-dd");
//=> '2014-02-11'

const dates = [
  new Date(1995, 6, 2),
  new Date(1987, 1, 11),
  new Date(1989, 6, 10),
];
dates.sort(compareAsc);
//=> [
//   Wed Feb 11 1987 00:00:00,
//   Mon Jul 10 1989 00:00:00,
//   Sun Jul 02 1995 00:00:00
// ]
```

```bash
npm install date-fns --save
```

## Common Patterns
### Key Features

- **It has 200+ functions for all occasions.**
- **Modular: Pick what you need. Works with webpack, Browserify, or Rollup and also supports tree-shaking.**
- **Native dates: Uses existing native type. It doesn't extend core objects for safety's sake.**
- **Immutable & Pure: Built using pure functions and always returns a new date instance.**

### Example

```bash
npm install date-fns --save
```

## Configuration
```js
import { compareAsc, format } from "date-fns";

format(new Date(2014, 1, 11), "yyyy-MM-dd");
//=> '2014-02-11'

const dates = [
  new Date(1995, 6, 2),
  new Date(1987, 1, 11),
  new Date(1989, 6, 10),
];
dates.sort(compareAsc);
//=> [
//   Wed Feb 11 1987 00:00:00,
//   Mon Jul 10 1989 00:00:00,
//   Sun Jul 02 1995 00:00:00
// ]
```

## Tips & Gotchas
- Includes built-in TypeScript type definitions.
- Works in both Node.js and browser environments.
