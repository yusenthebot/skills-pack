---
name: boxen
description: >
  Create styled boxes in the terminal with customizable borders, padding, and alignment. Use when: displaying important notices, version update banners, CLI welcome messages, highlighting key output. NOT for: complex layouts or tables (use cli-table3), interactive UIs.
---

# boxen

## Overview
Boxen creates boxes around text in the terminal with configurable borders, padding, margins, colors, and alignment. It is commonly used for update notifications, welcome banners, error messages, and any output that needs visual emphasis. ESM-only from v7+.

## Installation
```bash
npm install boxen
# or
yarn add boxen
# or
pnpm add boxen
```

> Boxen v7+ is ESM-only. For CommonJS, use `boxen@6`.

## Core API / Commands

```ts
import boxen from 'boxen';

// Basic box
console.log(boxen('Hello World', { padding: 1 }));
// ┌─────────────────┐
// │                 │
// │   Hello World   │
// │                 │
// └─────────────────┘

// With title
console.log(boxen('Content here', {
  title: 'My Box',
  titleAlignment: 'center',
  padding: 1,
}));

// Colored border
console.log(boxen('Warning message', {
  borderColor: 'yellow',
  borderStyle: 'round',
  padding: 1,
}));
```

## Common Patterns

### Update notification banner
```ts
import boxen from 'boxen';
import chalk from 'chalk';

const message = `Update available ${chalk.dim('1.0.0')} ${chalk.reset('→')} ${chalk.green('2.0.0')}
Run ${chalk.cyan('npm i -g mypackage')} to update`;

console.log(boxen(message, {
  padding: 1,
  margin: 1,
  borderColor: 'yellow',
  borderStyle: 'round',
  title: 'Update',
  titleAlignment: 'center',
}));
```

### Welcome banner
```ts
const banner = boxen(
  'My CLI Tool v1.2.3\nType --help for usage info',
  {
    padding: { top: 1, bottom: 1, left: 3, right: 3 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderStyle: 'double',
    borderColor: 'cyan',
    textAlignment: 'center',
    title: 'Welcome',
    titleAlignment: 'center',
  },
);
console.log(banner);
```

### Error display
```ts
const errorBox = boxen(
  `${chalk.red.bold('ERROR')}\n\nFailed to connect to database.\nCheck your DATABASE_URL environment variable.`,
  {
    padding: 1,
    borderColor: 'red',
    borderStyle: 'bold',
    textAlignment: 'center',
    dimBorder: false,
  },
);
console.log(errorBox);
```

## Configuration

```ts
boxen(text, {
  // Border
  borderColor: 'green',          // chalk color name or hex
  borderStyle: 'single',         // single | double | round | bold | singleDouble | doubleSingle | classic | arrow | none
  dimBorder: false,               // dim the border color

  // Spacing
  padding: 1,                    // number or { top, right, bottom, left }
  margin: 0,                     // number or { top, right, bottom, left }

  // Alignment
  textAlignment: 'left',         // left | center | right
  titleAlignment: 'left',        // left | center | right

  // Title
  title: 'Title',                // title text displayed on top border
  titleAlignment: 'left',        // where to place the title

  // Size
  width: 40,                     // fixed width (overrides auto-sizing)
  height: 10,                    // fixed height
  fullscreen: false,             // expand to terminal width/height
  // fullscreen can also be a function: (width, height) => [width, height - 2]

  // Colors
  backgroundColor: '#1a1a2e',    // background color (hex or chalk name)
});
```

### Border styles
| Style | Appearance |
|-------|-----------|
| `single` | `+-+` thin lines |
| `double` | double lines |
| `round` | rounded corners |
| `bold` | thick lines |
| `singleDouble` | single top/bottom, double sides |
| `doubleSingle` | double top/bottom, single sides |
| `classic` | `+`, `-`, `\|` characters |
| `arrow` | arrow characters |
| `none` | no visible border |

## Tips & Gotchas
- Boxen v7+ is ESM-only. Use `boxen@6` if you need `require()`.
- Use `padding: 1` at minimum for readability. Text flush against the border looks cramped.
- Multi-line strings work naturally with `\n`. Each line is padded and aligned independently.
- Combine with `chalk` for colored text inside the box. Boxen handles ANSI escape codes correctly.
- `width` overrides automatic sizing. Without it, the box auto-sizes to fit the content plus padding.
- `fullscreen: true` makes the box fill the entire terminal. Useful for welcome screens.
- `dimBorder: true` makes the border less prominent, putting focus on the content.
- The `textAlignment` option aligns text within the box. Works best with a fixed `width` or multi-line content of varying lengths.
- Custom border styles can be passed as an object with `topLeft`, `top`, `topRight`, `left`, `right`, `bottomLeft`, `bottom`, `bottomRight` properties.
