---
name: inquirer
description: >
  Interactive CLI prompts for user input. Use when: building interactive CLIs, gathering user configuration, creating setup wizards, confirm/select/input flows. NOT for: non-interactive scripts, CI environments without TTY, simple argument parsing (use yargs).
---

# inquirer

## Overview
Inquirer.js is the most widely used interactive CLI prompt library for Node.js. It supports a variety of prompt types including text input, confirmations, lists, checkboxes, and password fields. Version 9+ was rewritten as modular ESM-only packages with a cleaner API. Each prompt type is a separate import.

## Installation
```bash
# v9+ (ESM-only, modular)
npm install @inquirer/prompts

# Legacy v8 (CommonJS compatible, monolithic)
npm install inquirer@8
```

## Core API / Commands

### Modern API (v9+ / @inquirer/prompts)
```ts
import { input, confirm, select, checkbox, password, editor } from '@inquirer/prompts';

// Text input
const name = await input({ message: 'What is your name?' });

// Confirmation
const proceed = await confirm({ message: 'Continue?' });

// Single selection (replaces "list")
const color = await select({
  message: 'Pick a color',
  choices: [
    { name: 'Red', value: 'red' },
    { name: 'Blue', value: 'blue' },
    { name: 'Green', value: 'green', description: 'The color of grass' },
  ],
});

// Multi-select
const features = await checkbox({
  message: 'Select features',
  choices: [
    { name: 'TypeScript', value: 'ts', checked: true },
    { name: 'ESLint', value: 'eslint' },
    { name: 'Prettier', value: 'prettier' },
  ],
});

// Password (masked input)
const secret = await password({ message: 'Enter API key:', mask: '*' });

// Multi-line editor (opens $EDITOR)
const bio = await editor({ message: 'Enter your bio:' });
```

### Legacy API (v8)
```ts
import inquirer from 'inquirer';

const answers = await inquirer.prompt([
  { type: 'input', name: 'username', message: 'Username:' },
  { type: 'password', name: 'password', message: 'Password:', mask: '*' },
  { type: 'confirm', name: 'remember', message: 'Remember me?', default: true },
  { type: 'list', name: 'role', message: 'Role:', choices: ['admin', 'user', 'guest'] },
]);
console.log(answers); // { username, password, remember, role }
```

## Common Patterns

### Validation and defaults
```ts
const port = await input({
  message: 'Port number:',
  default: '3000',
  validate: (value) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num > 65535) return 'Enter a valid port (1-65535)';
    return true;
  },
  transformer: (value) => `http://localhost:${value}`,
});
```

### Conditional prompts (wizard flow)
```ts
const useDB = await confirm({ message: 'Use a database?' });

if (useDB) {
  const dbType = await select({
    message: 'Which database?',
    choices: [
      { name: 'PostgreSQL', value: 'pg' },
      { name: 'MySQL', value: 'mysql' },
      { name: 'SQLite', value: 'sqlite' },
    ],
  });
  const dbUrl = await input({ message: 'Connection string:', default: `${dbType}://localhost/mydb` });
}
```

### Separator in choices
```ts
import { select, Separator } from '@inquirer/prompts';

const action = await select({
  message: 'What do you want to do?',
  choices: [
    { name: 'Create', value: 'create' },
    { name: 'Update', value: 'update' },
    new Separator('--- Danger zone ---'),
    { name: 'Delete', value: 'delete' },
  ],
});
```

## Configuration

### Theming (v9+)
```ts
const answer = await input({
  message: 'Name:',
  theme: {
    prefix: '-->',
    style: {
      answer: (text) => `\x1b[36m${text}\x1b[0m`, // cyan answers
    },
  },
});
```

## Tips & Gotchas
- v9+ (`@inquirer/prompts`) is ESM-only and modular. Each prompt is a standalone function, not part of a chained `.prompt()` array. Use `inquirer@8` for CommonJS.
- In v9+, `list` is renamed to `select` and `rawlist` is renamed to `select` with `loop: false`.
- Prompts throw if stdin is not a TTY. Guard with `if (!process.stdin.isTTY)` for CI-safe CLIs.
- Use `validate` returning `true` for pass or a string error message for failure.
- `transformer` changes the displayed value but not the returned value -- useful for previewing formatted output.
- The v9+ API does not batch prompts into a single call; use sequential `await` calls and build your answers object manually.
- You can abort a prompt with Ctrl+C -- it throws an `ExitPromptError` that you should catch to clean up gracefully.
- For large choice lists (50+ items), consider `@inquirer/search` for fuzzy-searchable selection.
