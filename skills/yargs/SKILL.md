---
name: yargs
description: >
  CLI argument parsing with commands, options, validation, and auto-generated help. Use when: building multi-command CLIs, parsing complex flags and positional args, needing auto-generated --help. NOT for: interactive prompts (use inquirer), simple single-flag scripts (use process.argv or minimist).
---

# yargs

## Overview
Yargs is a powerful CLI argument parsing library that handles commands, options, positional arguments, validation, middleware, shell completion, and auto-generated help text. It supports both fluent API chaining and object-based configuration, and works with both CommonJS and ESM.

## Installation
```bash
npm install yargs
# TypeScript types
npm install --save-dev @types/yargs
```

## Core API / Commands

### Basic option parsing
```ts
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .option('name', {
    alias: 'n',
    type: 'string',
    description: 'Your name',
    demandOption: true,
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    default: false,
  })
  .parse();

console.log(`Hello, ${argv.name}!`);
```

### Command-based CLI
```ts
yargs(hideBin(process.argv))
  .command(
    'create <name>',
    'Create a new project',
    (yargs) => {
      return yargs.positional('name', {
        describe: 'Project name',
        type: 'string',
      }).option('template', {
        alias: 't',
        choices: ['react', 'vue', 'svelte'] as const,
        default: 'react',
      });
    },
    (argv) => {
      console.log(`Creating ${argv.name} with ${argv.template}`);
    },
  )
  .command(
    'serve [port]',
    'Start dev server',
    (yargs) => {
      return yargs.positional('port', {
        default: 3000,
        type: 'number',
      });
    },
    (argv) => {
      console.log(`Serving on port ${argv.port}`);
    },
  )
  .demandCommand(1, 'You must specify a command')
  .strict()
  .help()
  .parse();
```

## Common Patterns

### Grouped options with examples
```ts
yargs(hideBin(process.argv))
  .usage('Usage: $0 <cmd> [options]')
  .option('host', { group: 'Server:', type: 'string', default: 'localhost' })
  .option('port', { group: 'Server:', type: 'number', default: 3000 })
  .option('debug', { group: 'Debug:', type: 'boolean', default: false })
  .option('log-level', { group: 'Debug:', choices: ['error', 'warn', 'info', 'debug'] })
  .example('$0 --host 0.0.0.0 --port 8080', 'Start on custom host/port')
  .example('$0 --debug --log-level debug', 'Enable debug mode')
  .epilogue('For more info, visit https://example.com')
  .parse();
```

### Middleware
```ts
yargs(hideBin(process.argv))
  .middleware((argv) => {
    argv.startTime = Date.now();
    if (argv.verbose) console.log('Verbose mode enabled');
  })
  .command('deploy', 'Deploy app', {}, (argv) => {
    console.log(`Deploy started at ${argv.startTime}`);
  })
  .parse();
```

### Config file support
```ts
yargs(hideBin(process.argv))
  .config('config', 'Path to JSON config file')
  .option('name', { type: 'string' })
  .option('port', { type: 'number' })
  .parse();
// CLI: mycli --config ./myconfig.json
```

### Coerce / transform values
```ts
yargs(hideBin(process.argv))
  .option('date', {
    type: 'string',
    coerce: (val) => new Date(val),
  })
  .option('tags', {
    type: 'string',
    coerce: (val) => val.split(','),
  })
  .parse();
```

## Configuration

| Method | Description |
|--------|-------------|
| `.strict()` | Fail on unknown options |
| `.demandOption('key')` | Require an option |
| `.demandCommand(min)` | Require at least N commands |
| `.conflicts('a', 'b')` | a and b are mutually exclusive |
| `.implies('a', 'b')` | if a is set, b must also be set |
| `.check(fn)` | Custom validation function |
| `.completion()` | Generate shell completion script |
| `.wrap(width)` | Set help text width |
| `.locale('en')` | Set locale for help text |

## Tips & Gotchas
- Always use `hideBin(process.argv)` to strip the first two args (node path and script path).
- Use `.strict()` to reject unknown flags -- prevents typos from being silently ignored.
- `.demandCommand(1)` ensures users see help text if they run the CLI without a subcommand.
- Positional args use angle brackets for required (`<name>`) and square brackets for optional (`[port]`).
- `.parse()` vs `.argv`: prefer `.parse()` as it returns the parsed result directly. `.argv` is a getter that triggers parsing as a side effect.
- For async command handlers, make the handler `async` and yargs will await it automatically.
- Shell completion is built in: `.completion()` then run `mycli completion >> ~/.bashrc`.
- Use `.config()` to support JSON/YAML config files that merge with CLI flags.
- `.check()` receives all parsed args and must return `true` or throw/return a string error.
