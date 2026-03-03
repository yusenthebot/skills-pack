---
name: cli-table3
description: >
  Render Unicode tables in the terminal with borders, colors, and alignment. Use when: displaying tabular data in CLI output, formatting structured results, showing comparison data. NOT for: interactive tables (use blessed/ink), CSV export, web HTML tables.
---

# cli-table3

## Overview
cli-table3 renders formatted Unicode tables in the terminal with support for column widths, text alignment, colors (via chalk), cell spanning, word wrapping, and truncation. It is the actively maintained successor to cli-table and cli-table2, and is widely used in CLI tools for displaying structured data.

## Installation
```bash
npm install cli-table3
```

## Core API / Commands

```ts
import Table from 'cli-table3';

// Basic table with headers
const table = new Table({
  head: ['Name', 'Age', 'City'],
});

table.push(
  ['Alice', '30', 'New York'],
  ['Bob', '25', 'London'],
  ['Charlie', '35', 'Tokyo'],
);

console.log(table.toString());
// ┌─────────┬─────┬──────────┐
// │ Name    │ Age │ City     │
// ├─────────┼─────┼──────────┤
// │ Alice   │ 30  │ New York │
// │ Bob     │ 25  │ London   │
// │ Charlie │ 35  │ Tokyo    │
// └─────────┴─────┴──────────┘
```

### Horizontal table (key-value)
```ts
const table = new Table();

table.push(
  { 'Name': 'Alice' },
  { 'Email': 'alice@example.com' },
  { 'Role': 'Admin' },
);

console.log(table.toString());
```

### Cross table
```ts
const table = new Table({
  head: ['', 'Mon', 'Tue', 'Wed'],
});

table.push(
  { 'Alice': ['Yes', 'No', 'Yes'] },
  { 'Bob': ['No', 'Yes', 'Yes'] },
);

console.log(table.toString());
```

## Common Patterns

### Column widths and alignment
```ts
const table = new Table({
  head: ['ID', 'Name', 'Status'],
  colWidths: [8, 20, 12],
  colAligns: ['right', 'left', 'center'],
  style: {
    head: ['cyan'],
    border: ['gray'],
  },
});

table.push(
  ['1', 'Deploy Pipeline', 'running'],
  ['2', 'Test Suite', 'passed'],
  ['3', 'Lint Check', 'failed'],
);
console.log(table.toString());
```

### Cell spanning (colspan / rowspan)
```ts
const table = new Table();

table.push(
  [{ colSpan: 3, content: 'Monthly Report', hAlign: 'center' }],
  ['Category', 'Budget', 'Actual'],
  ['Marketing', '$5,000', '$4,800'],
  ['Engineering', '$12,000', '$11,500'],
  [{ colSpan: 2, content: 'Total', hAlign: 'right' }, '$16,300'],
);

console.log(table.toString());
```

### Colored content with chalk
```ts
import chalk from 'chalk';

const table = new Table({
  head: ['Task', 'Status'],
  style: { head: ['white'] },
});

table.push(
  ['Build', chalk.green('passed')],
  ['Test', chalk.green('passed')],
  ['Deploy', chalk.red('failed')],
  ['Lint', chalk.yellow('warnings')],
);

console.log(table.toString());
```

### Word wrapping
```ts
const table = new Table({
  colWidths: [15, 40],
  wordWrap: true,
});

table.push(
  ['Description', 'This is a very long description that will automatically wrap to fit within the specified column width.'],
);

console.log(table.toString());
```

## Configuration

```ts
new Table({
  // Column settings
  head: ['Col1', 'Col2'],        // header row
  colWidths: [20, 30],           // fixed widths per column
  colAligns: ['left', 'right'],  // left | center | right

  // Word wrap
  wordWrap: false,                // wrap long text to fit column width

  // Style
  style: {
    head: ['cyan'],               // chalk colors for header
    border: ['gray'],             // chalk colors for borders
    compact: false,               // remove empty lines between rows
    'padding-left': 1,            // left cell padding
    'padding-right': 1,           // right cell padding
  },

  // Border characters (override Unicode defaults)
  chars: {
    top: '-', 'top-mid': '+', 'top-left': '+', 'top-right': '+',
    bottom: '-', 'bottom-mid': '+', 'bottom-left': '+', 'bottom-right': '+',
    left: '|', 'left-mid': '+', mid: '-', 'mid-mid': '+',
    right: '|', 'right-mid': '+', middle: '|',
  },
});
```

### Per-cell options
```ts
{
  content: 'Cell text',
  colSpan: 2,          // span multiple columns
  rowSpan: 2,          // span multiple rows
  hAlign: 'center',    // horizontal alignment for this cell
  vAlign: 'center',    // vertical alignment for this cell
}
```

## Tips & Gotchas
- cli-table3 works with CommonJS (`require`) out of the box. No ESM-only issues.
- ANSI color codes (from chalk) are accounted for when calculating column widths. Colored text will not misalign columns.
- Use `colWidths` to prevent tables from overflowing the terminal. Without it, columns auto-size to content.
- `wordWrap: true` requires `colWidths` to be set. Without fixed widths, there is nothing to wrap against.
- `style.compact = true` removes blank lines between rows for denser output.
- Colspan and rowspan cells must use the object form: `{ content: 'text', colSpan: 2 }`.
- The `chars` option lets you replace Unicode box-drawing characters with ASCII for environments that do not support Unicode.
- For very wide tables, consider checking `process.stdout.columns` and adjusting `colWidths` dynamically.
- Empty cells should be passed as `''` (empty string), not `null` or `undefined`.
