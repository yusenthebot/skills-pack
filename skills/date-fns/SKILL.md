---
name: date-fns
description: >
  Modern, tree-shakable date utility library with comprehensive functions for parsing, formatting, and manipulating dates. Use when: formatting dates, calculating date differences, adding/subtracting time, parsing date strings, comparing dates. NOT for: timezone-heavy apps without date-fns-tz (use dayjs/timezone or luxon), recurring calendar events (use rrule).
---

# date-fns

## Overview
date-fns provides a comprehensive, consistent toolkit for manipulating JavaScript dates. It follows a functional programming approach with pure functions that take and return `Date` objects. Each function is available as a separate module, making it fully tree-shakable — you only bundle what you use. It covers formatting, parsing, comparison, intervals, time zones (via `date-fns-tz`), and locales.

## Installation
```bash
npm install date-fns
# yarn
yarn add date-fns
# pnpm
pnpm add date-fns

# For timezone support:
npm install date-fns-tz
```

## Core API / Commands

### Formatting
```js
import { format, formatDistance, formatRelative } from 'date-fns';

format(new Date(2025, 2, 15), 'yyyy-MM-dd');       // '2025-03-15'
format(new Date(2025, 2, 15), 'MMMM do, yyyy');    // 'March 15th, 2025'
format(new Date(2025, 2, 15, 14, 30), 'h:mm a');   // '2:30 PM'

// Relative time
formatDistance(new Date(2025, 2, 1), new Date(2025, 2, 15));
// '14 days'

formatDistance(new Date(2025, 2, 1), new Date(2025, 2, 15), { addSuffix: true });
// '14 days ago'

formatRelative(new Date(2025, 2, 14), new Date(2025, 2, 15));
// 'yesterday at 12:00 AM'
```

### Parsing
```js
import { parse, parseISO, isValid } from 'date-fns';

// Parse ISO string
const date = parseISO('2025-03-15T14:30:00Z');

// Parse custom format
const parsed = parse('15/03/2025', 'dd/MM/yyyy', new Date());

// Validate parsed result
isValid(parsed); // true
isValid(parse('invalid', 'dd/MM/yyyy', new Date())); // false
```

### Adding and subtracting
```js
import { addDays, addMonths, addHours, subWeeks, subYears } from 'date-fns';

const now = new Date(2025, 2, 15);

addDays(now, 7);      // March 22, 2025
addMonths(now, 3);    // June 15, 2025
addHours(now, 48);    // March 17, 2025
subWeeks(now, 2);     // March 1, 2025
subYears(now, 1);     // March 15, 2024
```

### Comparisons and differences
```js
import { isAfter, isBefore, isEqual, differenceInDays, differenceInHours } from 'date-fns';

const date1 = new Date(2025, 2, 15);
const date2 = new Date(2025, 5, 20);

isAfter(date2, date1);              // true
isBefore(date1, date2);             // true
differenceInDays(date2, date1);     // 97
differenceInHours(date2, date1);    // 2328
```

### Start/end of periods
```js
import { startOfWeek, endOfMonth, startOfDay, endOfYear } from 'date-fns';

const date = new Date(2025, 2, 15);

startOfWeek(date);                              // Sun Mar 9
startOfWeek(date, { weekStartsOn: 1 });         // Mon Mar 10
endOfMonth(date);                               // Mon Mar 31 23:59:59.999
startOfDay(date);                               // Sat Mar 15 00:00:00
endOfYear(date);                                // Wed Dec 31 23:59:59.999
```

## Common Patterns

### Date range iteration
```js
import { eachDayOfInterval, format } from 'date-fns';

const days = eachDayOfInterval({
  start: new Date(2025, 2, 10),
  end: new Date(2025, 2, 16),
});

days.map((d) => format(d, 'EEE, MMM d'));
// ['Mon, Mar 10', 'Tue, Mar 11', ..., 'Sun, Mar 16']
```

### Check if date falls within a range
```js
import { isWithinInterval } from 'date-fns';

const event = new Date(2025, 2, 15);
const result = isWithinInterval(event, {
  start: new Date(2025, 2, 1),
  end: new Date(2025, 2, 31),
});
// true
```

### Locale support
```js
import { format, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

format(new Date(2025, 2, 15), 'EEEE d MMMM yyyy', { locale: fr });
// 'samedi 15 mars 2025'

formatDistance(new Date(2025, 0, 1), new Date(2025, 2, 15), {
  locale: fr,
  addSuffix: true,
});
// 'il y a environ 2 mois'
```

## Configuration
date-fns is configuration-free by design. Behavior is controlled per-call via options:

| Option | Used by | Description |
|--------|---------|-------------|
| `locale` | `format`, `formatDistance`, `parse` | Locale object for i18n |
| `weekStartsOn` | `startOfWeek`, `endOfWeek` | 0=Sunday, 1=Monday, etc. |
| `addSuffix` | `formatDistance` | Add "ago" / "in" prefix/suffix |
| `roundingMethod` | `differenceIn*` | 'floor', 'ceil', 'round', 'trunc' |
| `useAdditionalWeekYearTokens` | `format` | Allow `YY` and `YYYY` tokens |

## Tips & Gotchas
- **Tree-shakable**: Import individual functions (`import { addDays } from 'date-fns'`) to keep bundle size small. Each function is a separate module.
- **Immutable**: All functions return new `Date` objects. The original date is never mutated.
- **Month is 0-indexed in `new Date()`**: `new Date(2025, 2, 15)` is March 15, not February 15. date-fns doesn't change this behavior.
- **`format` tokens are case-sensitive**: `yyyy` = full year, `MM` = month, `dd` = day, `HH` = 24-hour, `hh` = 12-hour, `mm` = minutes. `YYYY` is ISO week year (different from calendar year in edge cases).
- **`parseISO` for ISO strings**: Use `parseISO()` to parse ISO 8601 strings, not `parse()`. The `parse()` function is for custom format patterns.
- **`isValid` catches bad dates**: Always validate parsed dates with `isValid()` before using them.
- **No timezone support in core**: For timezone handling, install `date-fns-tz` and use `zonedTimeToUtc` / `utcToZonedTime`.
- **Locale must be imported explicitly**: Locales are not bundled by default. Import them from `date-fns/locale` to keep bundle size minimal.
