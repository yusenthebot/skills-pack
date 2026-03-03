---
name: ora
description: >
  Elegant terminal spinners for async CLI operations. Use when: showing progress for long-running tasks, file processing, network requests with unknown duration. NOT for: progress bars with known percentage (use cli-progress), non-interactive logging, browser environments.
---

# ora

## Overview
Ora provides elegant, animated terminal spinners for Node.js CLI applications. It shows a spinning indicator during async operations and resolves to a final success, failure, warning, or info state. Ora automatically handles non-TTY environments by disabling animation, making it safe for CI pipelines.

## Installation
```bash
npm install ora
# or
yarn add ora
# or
pnpm add ora
```

> Ora v6+ is ESM-only. For CommonJS, use `ora@5`:
> ```bash
> npm install ora@5
> ```

## Core API / Commands

```ts
import ora from 'ora';

// Basic usage
const spinner = ora('Loading...').start();

// Terminal states
spinner.succeed('Completed successfully');
spinner.fail('Something went wrong');
spinner.warn('Proceed with caution');
spinner.info('FYI: cache was cleared');
spinner.stop();  // stop without any symbol

// Update text while spinning
spinner.text = 'Still working...';
spinner.color = 'yellow';
spinner.prefixText = '[step 2]';
```

## Common Patterns

### Async operation with error handling
```ts
import ora from 'ora';

const spinner = ora('Fetching user data').start();
try {
  const users = await fetchUsers();
  spinner.succeed(`Fetched ${users.length} users`);
} catch (err) {
  spinner.fail(`Failed to fetch users: ${err.message}`);
  process.exit(1);
}
```

### Multi-step progress updates
```ts
const spinner = ora('Connecting to database...').start();
await connectDB();

spinner.text = 'Running migrations...';
await runMigrations();

spinner.text = 'Seeding data...';
await seedData();

spinner.succeed('Database ready');
```

### Promise shorthand
```ts
import ora from 'ora';

// Automatically succeed/fail based on promise resolution
await ora.promise(downloadFile(url), {
  text: 'Downloading package...',
  successText: 'Download complete',
  failText: 'Download failed',
});
```

### Custom spinner and appearance
```ts
const spinner = ora({
  text: 'Compiling...',
  spinner: 'dots2',
  color: 'magenta',
  prefixText: '[build]',
  indent: 2,
});
spinner.start();
```

### Custom final state with stopAndPersist
```ts
spinner.stopAndPersist({
  symbol: '-->',
  text: 'Skipped (already up to date)',
});
```

### Non-TTY safe pattern
```ts
const spinner = ora({
  text: 'Processing...',
  isSilent: !process.stdout.isTTY,
});
```

## Configuration

```ts
ora({
  text: 'Loading',           // displayed text
  spinner: 'dots',           // animation name (see cli-spinners)
  color: 'cyan',             // spinner color (chalk color name)
  prefixText: '',            // text before the spinner
  suffixText: '',            // text after the main text
  indent: 0,                 // left indentation
  interval: 80,              // ms between animation frames
  isEnabled: true,           // force enable/disable spinner
  isSilent: false,           // suppress all output
  hideCursor: true,          // hide terminal cursor while spinning
  discardStdin: true,        // discard stdin during spin
  stream: process.stderr,    // output stream
})
```

Available spinner names: `dots`, `dots2`, `dots3`, `line`, `arc`, `bouncingBar`, `clock`, `earth`, `moon`, `runner`, and many more from the `cli-spinners` package.

## Tips & Gotchas
- Ora v6+ is ESM-only. Use `ora@5` if you need `require()`.
- Calling `console.log()` while a spinner is active corrupts the terminal output. Stop the spinner first, log, then restart it. Or use `spinner.clear()` before logging.
- In CI (non-TTY), the spinner is automatically disabled. `ora.promise()` handles this gracefully by just printing the text.
- Use `spinner.stopAndPersist({ symbol, text })` for custom final states beyond succeed/fail/warn/info.
- Only one spinner can be active at a time on the same stream. For multiple concurrent tasks, use `listr2` instead.
- The `prefixText` option is useful for labeling steps: `[1/5]`, `[build]`, etc.
- Setting `spinner.color` mid-spin works and can indicate state changes (e.g., green for fast, yellow for slow).
