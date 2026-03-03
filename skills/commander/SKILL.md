---
name: commander
description: >
  Node.js CLI framework. Use when: building CLI tools, parsing argv, defining subcommands with options/flags. NOT for: browser environments, argument parsing in scripts without a CLI interface.
---

# commander

## Overview
The complete solution for Node.js command-line programs. Handles argument parsing, option flags, subcommands, help text generation, and version management automatically.

## Installation
```bash
npm install commander
```

## Core API

```ts
import { Command } from 'commander';

const program = new Command();

program
  .name('mytool')
  .description('My CLI tool')
  .version('1.0.0');

// Options
program
  .option('-d, --debug', 'enable debug mode')
  .option('-p, --port <number>', 'port number', '3000')
  .option('-e, --env <env>', 'environment', 'development');

// Positional argument
program
  .argument('<input>', 'input file')
  .argument('[output]', 'output file (optional)');

program.parse(); // process.argv

const opts = program.opts();
console.log(opts.port); // '3000'
```

## Subcommands

```ts
program
  .command('serve')
  .description('Start the server')
  .option('-p, --port <port>', 'port', '3000')
  .action((opts) => {
    console.log(`Serving on port ${opts.port}`);
  });

program
  .command('build <target>')
  .description('Build the project')
  .option('--minify', 'minify output')
  .action((target, opts) => {
    console.log(`Building ${target}, minify: ${opts.minify}`);
  });

program.parse();
```

## Common Patterns

### Required options
```ts
program
  .requiredOption('-c, --config <path>', 'config file path');
```

### Variadic arguments
```ts
program
  .command('deploy <env> [services...]')
  .action((env, services) => {
    console.log(env, services); // 'prod', ['api', 'web']
  });
```

### Async actions
```ts
program
  .command('fetch <url>')
  .action(async (url) => {
    const res = await fetch(url);
    console.log(await res.text());
  });

program.parseAsync(); // use instead of parse() for async actions
```

### Custom option parsing
```ts
program.option('-n, --count <n>', 'count', parseInt);
// opts.count is now a number, not string
```

## Configuration

| Option | Description |
|--------|-------------|
| `.exitOverride()` | Throw instead of calling `process.exit` (useful in tests) |
| `.configureOutput()` | Customize error/help output |
| `.allowUnknownOption()` | Don't error on unknown flags |
| `.passThroughOptions()` | Pass unknown options to subcommand |

## Tips & Gotchas
- `program.parse()` defaults to `process.argv` — pass `process.argv` explicitly if running in tests
- Option values are always strings unless you provide a `parseArg` function
- `.action()` callback receives options as the **last** argument, not first
- Use `program.parseAsync()` when any action is `async`
- For ESM: `import { program } from 'commander'` works as a singleton
