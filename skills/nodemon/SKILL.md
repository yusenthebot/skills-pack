---
name: nodemon
description: >
  Automatically restarts Node.js applications when file changes are detected. Use when: local development, watching for code changes, running dev servers. NOT for: production deployment, build pipelines, testing.
---

# nodemon

## Overview
Nodemon monitors your source files and automatically restarts your Node.js application whenever a change is detected. It is a drop-in replacement for `node` during development, requiring zero code changes. Nodemon watches for file extensions like `.js`, `.mjs`, `.json`, `.ts` by default and supports extensive configuration for watch paths, ignore patterns, and custom execution commands.

## Installation
```bash
npm install --save-dev nodemon
# or globally
npm install -g nodemon
```

## Core API / Commands

### Basic usage
```bash
# Replace 'node' with 'nodemon'
nodemon app.js
nodemon src/server.ts

# With arguments passed to your app
nodemon app.js -- --port 3000

# Execute non-node scripts
nodemon --exec "python" script.py
nodemon --exec "ts-node" src/index.ts
```

### Watching and ignoring
```bash
# Watch specific directories
nodemon --watch src --watch config app.js

# Watch specific extensions
nodemon --ext js,ts,json,graphql app.js

# Ignore files/directories
nodemon --ignore tests/ --ignore node_modules/ app.js
nodemon --ignore '*.test.js' app.js
```

### Delay and execution
```bash
# Delay restart (debounce, in milliseconds)
nodemon --delay 2000 app.js
nodemon --delay 500ms app.js

# Execute with a different runtime
nodemon --exec "deno run --allow-net" server.ts
nodemon --exec "npx tsx" src/index.ts
```

## Common Patterns

### package.json scripts
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "dev:ts": "nodemon --exec 'npx tsx' src/server.ts",
    "dev:debug": "nodemon --inspect src/server.js",
    "dev:legacy": "nodemon --exec 'node --experimental-modules' app.mjs"
  }
}
```

### nodemon.json configuration file
```json
{
  "watch": ["src", "config"],
  "ext": "js,ts,json",
  "ignore": [
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "dist",
    "node_modules"
  ],
  "exec": "npx tsx src/server.ts",
  "delay": 1000,
  "verbose": true,
  "env": {
    "NODE_ENV": "development",
    "DEBUG": "app:*"
  },
  "signal": "SIGTERM",
  "events": {
    "restart": "echo '--- Restarting ---'",
    "start": "echo '--- Starting ---'"
  }
}
```

### Configuration in package.json
```json
{
  "nodemonConfig": {
    "watch": ["src"],
    "ext": "ts,js",
    "exec": "ts-node src/index.ts",
    "ignore": ["dist", "**/*.test.ts"]
  }
}
```

### Programmatic usage
```js
const nodemon = require('nodemon');

nodemon({
  script: 'app.js',
  ext: 'js json',
  watch: ['src/'],
});

nodemon
  .on('start', () => console.log('App started'))
  .on('quit', () => {
    console.log('App has quit');
    process.exit();
  })
  .on('restart', (files) => {
    console.log('Restarted due to:', files);
  });
```

## Configuration

### Configuration file resolution order
1. `nodemon.json` in the current working directory
2. `nodemonConfig` key in `package.json`
3. `$HOME/nodemon.json` (global defaults)
4. Command-line arguments (highest priority)

### Key options
| Option | CLI Flag | Description |
|--------|----------|-------------|
| `watch` | `--watch` | Paths to watch (default: cwd) |
| `ext` | `--ext` | File extensions to monitor |
| `ignore` | `--ignore` | Patterns to ignore |
| `delay` | `--delay` | Restart delay in ms |
| `exec` | `--exec` | Execution command |
| `signal` | `--signal` | Kill signal (SIGUSR2, SIGTERM) |
| `verbose` | `--verbose` | Show detail on what is causing restarts |
| `legacyWatch` | `--legacy-watch` | Use polling (for network drives) |

## Tips & Gotchas
- Nodemon watches the current directory by default. Always use `--watch src` to limit to your source directory and avoid unnecessary restarts from generated files.
- The `--` separator is required to pass arguments to your script: `nodemon app.js -- --port 3000`.
- For TypeScript, use `nodemon --exec 'npx tsx'` or `nodemon --exec ts-node` rather than watching `.ts` files and compiling separately.
- Nodemon sends `SIGUSR2` by default to restart gracefully. Use the `signal` config to change to `SIGTERM` or `SIGINT` if your app handles those.
- Use `--legacy-watch` (polling) when working on networked file systems (Docker volumes, NFS, WSL2) where native file watching does not work reliably.
- The `delay` option is useful to debounce rapid file changes, such as when a build tool writes multiple files at once.
- Nodemon automatically ignores `.git`, `node_modules`, `bower_components`, and `.nyc_output` directories.
- The `events` config lets you run commands on lifecycle events like `restart`, `crash`, `start`, and `exit`.
- You can trigger a manual restart by typing `rs` and pressing Enter in the nodemon terminal.
- Nodemon respects `.nodemonignore` files if present, similar to `.gitignore` syntax.
