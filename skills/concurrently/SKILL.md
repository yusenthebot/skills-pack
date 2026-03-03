---
name: concurrently
description: >
  Run multiple commands concurrently with prefixed, color-coded output. Use when: running dev server and watcher together, parallel build steps, multiple services locally. NOT for: sequential pipelines, production process management, CI/CD orchestration.
---

# concurrently

## Overview
Concurrently lets you run multiple commands in parallel from a single terminal, with each command's output color-coded and prefixed for easy identification. It is commonly used during development to run a frontend dev server alongside a backend API, or to run build watchers and test runners simultaneously. It works cross-platform on Windows, macOS, and Linux.

## Installation
```bash
npm install --save-dev concurrently
# or globally
npm install -g concurrently
```

## Core API / Commands

### Basic usage
```bash
# Run two commands in parallel
concurrently "npm run server" "npm run client"

# With npx
npx concurrently "tsc --watch" "node dist/server.js"
```

### Naming and colors
```bash
# Named output prefixes
concurrently --names "API,WEB" "npm run api" "npm run web"

# Custom colors
concurrently --names "API,WEB" -c "bgBlue.bold,bgGreen.bold" \
  "npm run api" "npm run web"

# Prefix with command index, pid, time, or name
concurrently --prefix "[{name}]" --names "api,web" \
  "npm run api" "npm run web"
```

### Kill and success conditions
```bash
# Kill all processes when one exits
concurrently --kill-others "npm run server" "npm run test"

# Kill all when one fails
concurrently --kill-others-on-fail "npm run build" "npm run lint"

# Define which command determines overall exit code
concurrently --success first "npm start" "npm test"
concurrently --success "command-1" "npm run api" "npm run test"
```

## Common Patterns

### Development setup in package.json
```json
{
  "scripts": {
    "dev": "concurrently --names 'api,web,css' -c 'blue,green,magenta' \"npm run dev:api\" \"npm run dev:web\" \"npm run dev:css\"",
    "dev:api": "nodemon src/server.ts",
    "dev:web": "vite",
    "dev:css": "tailwindcss --watch -i src/input.css -o dist/output.css"
  }
}
```

### Full-stack development
```json
{
  "scripts": {
    "dev": "concurrently --kill-others-on-fail -n 'server,client,db' -c 'yellow,cyan,red' \"npm run dev --prefix server\" \"npm run dev --prefix client\" \"docker compose up postgres redis\""
  }
}
```

### Build pipeline with type checking
```json
{
  "scripts": {
    "build": "concurrently --kill-others-on-fail \"tsc --noEmit\" \"eslint src/\" \"vitest run\"",
    "watch": "concurrently -n 'tsc,test' \"tsc --watch --preserveWatchOutput\" \"vitest --watch\""
  }
}
```

### Programmatic usage
```js
const concurrently = require('concurrently');

const { result } = concurrently([
  { command: 'npm:watch-*', name: 'watcher' },
  { command: 'node server.js', name: 'server', env: { PORT: '3000' } },
], {
  prefix: 'name',
  killOthers: ['failure'],
  restartTries: 3,
});

result.then(
  () => console.log('All commands completed successfully'),
  (err) => console.error('One or more commands failed', err)
);
```

## Configuration

### CLI Options
| Option | Description |
|--------|-------------|
| `--names` / `-n` | Comma-separated names for each command |
| `--prefix` / `-p` | Prefix type: `index`, `pid`, `time`, `name`, `command`, `none`, or template |
| `-c` / `--prefix-colors` | Comma-separated chalk colors for each prefix |
| `--kill-others` / `-k` | Kill other processes when one exits |
| `--kill-others-on-fail` | Kill others only if one exits with non-zero |
| `--success` | Which command(s) determine exit code: `first`, `last`, `all`, `command-{index}` |
| `--restart-tries` | Number of times to restart a command on failure |
| `--restart-after` | Delay in ms before restarting |
| `--raw` / `-r` | Output raw, unformatted command output |
| `--max-processes` / `-m` | Maximum number of commands to run at once |
| `--timestamp-format` | Format for `{time}` prefix (moment.js format) |

### npm script wildcard
```json
{
  "scripts": {
    "watch:ts": "tsc --watch",
    "watch:css": "postcss --watch",
    "watch:test": "vitest --watch",
    "dev": "concurrently \"npm:watch:*\""
  }
}
```

## Tips & Gotchas
- Use `npm:script-name` shorthand to reference npm scripts directly: `concurrently "npm:dev" "npm:test"`.
- The `npm:watch-*` wildcard pattern matches all npm scripts starting with `watch-` -- very convenient for parallel watchers.
- Escape quotes carefully in package.json scripts: use backslash-escaped double quotes inside the outer double quotes.
- `--kill-others` kills ALL sibling processes when ANY one exits (even successfully). Use `--kill-others-on-fail` if you only want to kill on failure.
- The `--raw` flag disables prefixes and colors, passing through unmodified output -- useful when command output contains its own formatting.
- `--max-processes` limits parallelism, which is useful on resource-constrained CI environments.
- Each command runs in its own child process with its own environment -- they cannot share state directly.
- On Windows, shell-specific commands may need `cross-env` or `cmd /c` wrapping to work correctly.
- The `--success` option defaults to `all`, meaning concurrently exits with 0 only if all commands exit with 0.
- Use `--prefix-colors auto` to let concurrently automatically assign distinct colors to each command.
