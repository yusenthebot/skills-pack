---
name: chalk
description: >
  Terminal string styling with chainable, composable API. Use when: coloring CLI output, highlighting errors/warnings/success messages, building formatted terminal UIs. NOT for: browser environments, stripping ANSI codes (use strip-ansi), HTML rendering.
---

# chalk

## Overview
Chalk is the most popular terminal string styling library for Node.js. It provides a clean, chainable API for adding colors, backgrounds, and text decorations to terminal output. It automatically detects color support and gracefully degrades in non-TTY environments like CI pipelines or piped output.

## Installation
```bash
npm install chalk
# or
yarn add chalk
# or
pnpm add chalk
```

> Chalk 5+ is ESM-only. For CommonJS projects, use `chalk@4`:
> ```bash
> npm install chalk@4
> ```

## Core API / Commands

```ts
import chalk from 'chalk';

// Basic colors
chalk.red('error message')
chalk.green('success')
chalk.blue('info')
chalk.yellow('warning')
chalk.cyan('note')
chalk.magenta('debug')
chalk.white('default')
chalk.gray('muted')

// Background colors
chalk.bgRed('critical')
chalk.bgGreen.black('passed')
chalk.bgYellow.black('caution')

// Modifiers
chalk.bold('strong')
chalk.dim('subtle')
chalk.italic('emphasis')
chalk.underline('link-like')
chalk.strikethrough('removed')
chalk.inverse('inverted')
chalk.hidden('hidden text')
```

## Common Patterns

### Chaining styles
```ts
console.log(chalk.bold.red('Error:'), chalk.white('File not found'));
console.log(chalk.bgBlue.white.bold(' INFO '), 'Server started on port 3000');
console.log(chalk.dim.italic('(optional: pass --verbose for details)'));
```

### Template literal syntax
```ts
const name = 'world';
console.log(chalk`{bold.green Success:} deployed {cyan ${name}} to production`);
console.log(chalk`{red.bold ERROR} {white ${err.message}}`);
```

### 256-color, RGB, and Hex
```ts
chalk.ansi256(93)('purple via 256-color')
chalk.rgb(255, 136, 0)('custom orange')
chalk.hex('#ff8800')('hex orange')
chalk.bgHex('#1a1a2e').white('dark background')
chalk.rgb(50, 205, 50)('lime green')
```

### Reusable styled functions
```ts
const error = chalk.bold.red;
const warning = chalk.hex('#FFA500');
const success = chalk.green;
const label = chalk.bgCyan.black.bold;

console.log(error('Build failed'));
console.log(warning('Deprecation notice'));
console.log(success('All tests passed'));
console.log(label(' DEPLOY '), 'Starting deployment...');
```

### Custom chalk instances with forced color level
```ts
import { Chalk } from 'chalk';

const chalk16 = new Chalk({ level: 1 });   // Basic 16 colors only
const chalkOff = new Chalk({ level: 0 });  // No colors at all
const chalkFull = new Chalk({ level: 3 }); // Full truecolor
```

## Configuration

| Level | Colors | Description |
|-------|--------|-------------|
| `0`   | None   | All colors disabled |
| `1`   | 16     | Basic ANSI colors |
| `2`   | 256    | 256-color ANSI |
| `3`   | 16M    | Truecolor (RGB/Hex) |

Color level is auto-detected from terminal capabilities and respects these environment variables:
- `NO_COLOR` -- disables all colors
- `FORCE_COLOR=0|1|2|3` -- forces a specific level
- `COLORTERM=truecolor` -- enables truecolor

## Tips & Gotchas
- Chalk 5+ is ESM-only (`import chalk from 'chalk'`). If your project uses `require()`, pin to `chalk@4`.
- `chalk.level` is `0` when stdout is not a TTY (e.g., piped to a file), so colors are automatically stripped.
- Nesting works naturally: `chalk.red('red ' + chalk.bold('bold red') + ' red again')`.
- Create reusable styled functions (`const err = chalk.bold.red`) instead of repeating chain calls everywhere.
- Use `chalk.visible()` to output text only when colors are enabled -- useful for decorative elements like borders.
- `chalk.supportsColor` is `false` when `NO_COLOR` env var is set. Always test your CLI with `NO_COLOR=1`.
- When combining with template literals, prefer the tagged template syntax for readability in complex strings.
- Do not call chalk in hot loops (thousands of iterations) -- pre-build the styled function and reuse it.
