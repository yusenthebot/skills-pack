---
name: "yargs"
version: "18.0.0"
downloads: 647.1M/month
description: >
  yargs the modern, pirate-themed, successor to optimist.. Use when: commands and (grouped) options (`my-program.js serve --port=5000`); a dynamically generated help menu based on your arguments:; generate completion scripts for Bash and Zsh for your command. NOT for: web browser UI rendering; server-side HTML generation.
---

# yargs

## Overview
yargs the modern, pirate-themed, successor to optimist.. It gives you: commands and (grouped) options (`my-program.js serve --port=5000`).

## Installation
```bash
npm install yargs
```

## Core API / Usage
```js
mocha [spec..]

Run tests with Mocha

Commands
  mocha inspect [spec..]  Run tests with Mocha                         [default]
  mocha init <path>       create a client-side Mocha setup at <path>

Rules & Behavior
  --allow-uncaught           Allow uncaught errors to propagate        [boolean]
  --async-only, -A           Require all tests to use a callback (async) or
                             return a Promise                          [boolean]
```

```bash
npm i yargs@next
```

## Common Patterns
### Pattern 1

```js
#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const argv = yargs(hideBin(process.argv)).parse()

if (argv.ships > 3 && argv.distance < 53.5) {
  console.log('Plunder more riffiwobbles!')
} else {
  console.log('Retreat from the xupptumblers!')
}
```

### Pattern 2

```js
$ ./plunder.js --ships=4 --distance=22
Plunder more riffiwobbles!

$ ./plunder.js --ships 12 --distance 98.7
Retreat from the xupptumblers!
```

### Pattern 3

```js
#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .command('serve [port]', 'start the server', (yargs) => {
    return yargs
      .positional('port', {
        describe: 'port to bind on',
        default: 5000
      })
  }, (argv) => {
    if (argv.verbose) console.info(`start server on :${argv.port}`)
    serve(argv.port)
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .parse()
```

## Configuration
```js
#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .command('serve [port]', 'start the server', (yargs) => {
    return yargs
      .positional('port', {
        describe: 'port to bind on',
        default: 5000
      })
  }, (argv) => {
    if (argv.verbose) console.info(`start server on :${argv.port}`)
    serve(argv.port)
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .parse()
```

## Tips & Gotchas
- Install TypeScript types separately: `npm i -D @types/yargs`.
- Works in both Node.js and browser environments.
- : `hideBin` is a shorthand for `process.argv.slice(2)`. It has the benefit that it takes into account variations in some environments, e.g., Electron.
- : If you use version tags in url then you also have to add `-deno` flag on the end, like `@17.7.2-deno`
