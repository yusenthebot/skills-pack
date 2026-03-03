---
name: dayjs
description: >
  Lightweight (2KB) date library with a Moment.js-compatible API and plugin architecture. Use when: formatting/parsing dates, relative time display, timezone conversion, lightweight date manipulation. NOT for: heavy date arithmetic with tree-shaking needs (use date-fns), calendar recurrence rules (use rrule).
---

# dayjs

## Overview
Day.js is a minimalist date library (2KB gzipped) that provides a Moment.js-compatible API for parsing, validating, manipulating, and formatting dates. It uses an immutable, chainable API and extends functionality through a plugin system. It supports locales for internationalization and has plugins for UTC, timezone, relative time, and custom parsing.

## Installation
```bash
npm install dayjs
# yarn
yarn add dayjs
# pnpm
pnpm add dayjs
```

## Core API / Commands

### Basic usage
```js
import dayjs from 'dayjs';

dayjs();                            // current date/time
dayjs('2025-03-15');                // parse ISO string
dayjs('2025-03-15T14:30:00Z');     // parse ISO with time
dayjs(new Date(2025, 2, 15));      // from Date object
dayjs(1710504000000);              // from Unix timestamp (ms)
```

### Formatting
```js
dayjs('2025-03-15').format('YYYY-MM-DD');          // '2025-03-15'
dayjs('2025-03-15').format('MMMM D, YYYY');        // 'March 15, 2025'
dayjs('2025-03-15T14:30:00').format('h:mm A');     // '2:30 PM'
dayjs('2025-03-15').format('dddd');                 // 'Saturday'

// ISO 8601
dayjs().toISOString();   // '2025-03-15T00:00:00.000Z'
dayjs().toJSON();        // same as toISOString
```

### Manipulation (immutable)
```js
dayjs('2025-03-15').add(7, 'day');          // March 22
dayjs('2025-03-15').subtract(1, 'month');   // February 15
dayjs('2025-03-15').add(2, 'year');         // March 15, 2027

dayjs('2025-03-15').startOf('month');       // March 1
dayjs('2025-03-15').endOf('month');         // March 31 23:59:59.999
dayjs('2025-03-15').startOf('week');        // Sunday of that week
```

### Comparison
```js
dayjs('2025-03-15').isBefore('2025-04-01');  // true
dayjs('2025-03-15').isAfter('2025-02-01');   // true
dayjs('2025-03-15').isSame('2025-03-15');    // true
dayjs('2025-03-15').isSame('2025-03', 'month'); // true (granularity)
```

### Difference
```js
const d1 = dayjs('2025-01-01');
const d2 = dayjs('2025-03-15');

d2.diff(d1, 'day');     // 73
d2.diff(d1, 'month');   // 2
d2.diff(d1, 'week');    // 10
d2.diff(d1, 'day', true); // 73 (with decimal precision when true)
```

### Getters and setters
```js
const d = dayjs('2025-03-15');
d.year();    // 2025
d.month();   // 2 (0-indexed)
d.date();    // 15
d.day();     // 6 (Saturday, 0=Sunday)
d.hour();    // 0
d.minute();  // 0
d.unix();    // Unix timestamp in seconds
d.valueOf(); // Unix timestamp in milliseconds
```

## Common Patterns

### Relative time with plugin
```js
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(relativeTime);

dayjs('2025-03-10').from(dayjs('2025-03-15'));     // '5 days ago'
dayjs('2025-03-20').from(dayjs('2025-03-15'));     // 'in 5 days'
dayjs('2025-03-15').fromNow();                      // 'X ago' or 'in X'
dayjs('2025-03-15').toNow();                        // relative to now
```

### Timezone handling
```js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz('2025-03-15 14:00', 'America/New_York');
// Creates a date at 2pm ET

dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm');
// Current time in Tokyo

dayjs.tz.setDefault('America/Los_Angeles');
```

### Custom parse format
```js
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

dayjs('15-03-2025', 'DD-MM-YYYY');
dayjs('March 15, 2025 2:30 PM', 'MMMM D, YYYY h:mm A');
dayjs('15/03/2025', 'DD/MM/YYYY', true); // strict mode
```

## Configuration

### Locale
```js
import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';
import 'dayjs/locale/ja.js';

dayjs.locale('fr');                // Set globally
dayjs().locale('ja').format('dddd'); // Per-instance
```

### Key plugins
| Plugin | Import | Purpose |
|--------|--------|---------|
| `relativeTime` | `dayjs/plugin/relativeTime` | `fromNow()`, `toNow()`, `from()`, `to()` |
| `utc` | `dayjs/plugin/utc` | UTC mode: `dayjs.utc()`, `.utc()`, `.local()` |
| `timezone` | `dayjs/plugin/timezone` | `dayjs.tz()`, `.tz()` |
| `customParseFormat` | `dayjs/plugin/customParseFormat` | Parse with custom format strings |
| `isBetween` | `dayjs/plugin/isBetween` | `dayjs().isBetween(start, end)` |
| `isSameOrBefore` | `dayjs/plugin/isSameOrBefore` | `.isSameOrBefore()` |
| `weekOfYear` | `dayjs/plugin/weekOfYear` | `.week()` getter |
| `duration` | `dayjs/plugin/duration` | `dayjs.duration(1, 'hour')` |
| `advancedFormat` | `dayjs/plugin/advancedFormat` | Extra tokens: `Q`, `Do`, `X`, `x` |

## Tips & Gotchas
- **Immutable by default**: Every manipulation returns a new dayjs instance. The original is never changed.
- **Plugins must be extended before use**: Call `dayjs.extend(plugin)` at the top of your app before using plugin features.
- **Month is 0-indexed**: `.month()` returns 0 for January, consistent with native `Date`. Use `.format('M')` for 1-indexed.
- **Locale is global**: `dayjs.locale('fr')` affects all subsequent dayjs instances. Use `.locale('fr')` on individual instances to avoid side effects.
- **`isValid()` checks if the date is real**: `dayjs('not-a-date').isValid()` returns `false`.
- **Parsing ambiguity**: `dayjs('03-15-2025')` may parse incorrectly without `customParseFormat`. Always use ISO 8601 or the custom parse plugin with an explicit format.
- **Plugin order matters for timezone**: Extend `utc` before `timezone` -- the timezone plugin depends on utc.
- **2KB core**: The core library is tiny, but each plugin adds size. Only import plugins you actually use.
- **Moment.js migration**: Most Moment.js code works with dayjs after changing `moment()` to `dayjs()` and adding necessary plugins.
