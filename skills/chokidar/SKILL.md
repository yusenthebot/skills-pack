---
name: chokidar
description: >
  Efficient cross-platform file watching library built on Node.js fs.watch with improved reliability. Use when: watching files for changes, building dev servers, hot-reloading, triggering builds on file save. NOT for: one-time file listing (use glob), file manipulation (use fs-extra).
---

# chokidar

## Overview
chokidar is a fast, reliable file watcher that wraps Node.js `fs.watch` / `fs.watchFile` with a normalized, cross-platform API. It eliminates common issues with native file watching such as duplicate events, missing events on macOS, and lack of recursive watching on Linux. It is the watcher behind tools like Vite, webpack-dev-server, and nodemon.

## Installation
```bash
npm install chokidar
# yarn
yarn add chokidar
# pnpm
pnpm add chokidar
```

## Core API / Commands

### watch(paths, [options])
Creates a watcher instance.
```js
import chokidar from 'chokidar';

// Watch a single file
const watcher = chokidar.watch('./config.json');

// Watch multiple paths
const watcher = chokidar.watch(['src/**/*.ts', 'public/**/*']);

// Watch with options
const watcher = chokidar.watch('.', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true,
});
```

### Event listeners
```js
watcher
  .on('add', (path) => console.log(`File added: ${path}`))
  .on('change', (path) => console.log(`File changed: ${path}`))
  .on('unlink', (path) => console.log(`File removed: ${path}`))
  .on('addDir', (path) => console.log(`Directory added: ${path}`))
  .on('unlinkDir', (path) => console.log(`Directory removed: ${path}`))
  .on('error', (error) => console.error(`Watcher error: ${error}`))
  .on('ready', () => console.log('Initial scan complete. Ready for changes.'));
```

### all event
Catches all events with a single handler.
```js
watcher.on('all', (event, path) => {
  console.log(event, path);
  // event is one of: 'add', 'addDir', 'change', 'unlink', 'unlinkDir'
});
```

### Closing the watcher
```js
await watcher.close();
```

### Adding and removing watched paths
```js
watcher.add('new-dir/**/*.js');
watcher.add(['file1.txt', 'file2.txt']);

await watcher.unwatch('old-dir');
```

## Common Patterns

### Dev server with auto-rebuild
```js
import chokidar from 'chokidar';
import { exec } from 'child_process';

const watcher = chokidar.watch('src/**/*.ts', {
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100,
  },
});

let building = false;

watcher.on('change', async (filePath) => {
  if (building) return;
  building = true;
  console.log(`Changed: ${filePath}, rebuilding...`);
  exec('npm run build', (err, stdout, stderr) => {
    if (err) console.error(stderr);
    else console.log('Build complete');
    building = false;
  });
});
```

### Watch config and restart service
```js
import chokidar from 'chokidar';
import fs from 'fs/promises';

async function watchConfig(configPath, onReload) {
  let config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
  onReload(config);

  chokidar.watch(configPath, { ignoreInitial: true }).on('change', async () => {
    try {
      config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      console.log('Config reloaded');
      onReload(config);
    } catch (err) {
      console.error('Invalid config, keeping previous version');
    }
  });
}
```

### Batch changes with debounce
```js
import chokidar from 'chokidar';

let timeout;
const changedFiles = new Set();

chokidar.watch('src/**/*', { ignoreInitial: true }).on('all', (event, path) => {
  changedFiles.add(path);
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log('Changed files:', [...changedFiles]);
    processChangedFiles([...changedFiles]);
    changedFiles.clear();
  }, 200);
});
```

## Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `persistent` | boolean | `true` | Keep process running while watching |
| `ignored` | string/RegExp/function | - | Paths to ignore |
| `ignoreInitial` | boolean | `false` | Skip `add` events during initial scan |
| `followSymlinks` | boolean | `true` | Follow symlinked directories |
| `cwd` | string | - | Base directory for relative paths |
| `depth` | number | `undefined` | Max subdirectory depth to traverse |
| `usePolling` | boolean | `false` | Use `fs.watchFile` instead of `fs.watch` |
| `interval` | number | `100` | Polling interval in ms (if `usePolling`) |
| `awaitWriteFinish` | boolean/object | `false` | Wait for file writes to complete |
| `atomic` | boolean/number | `true` | Handle atomic writes (rename-based saves) |

## Tips & Gotchas
- **Always set `ignoreInitial: true`** if you only care about changes after startup. Otherwise, `add` fires for every existing file during the initial scan.
- **`awaitWriteFinish` prevents partial reads**: When editors save via temp files or partial writes, enable this to wait until file size stabilizes before firing the event.
- **Use `usePolling` on network filesystems**: Native watchers don't work reliably on NFS, Docker volumes, or VirtualBox shared folders. Polling is slower but reliable.
- **`ignored` accepts multiple formats**: A string glob (`'**/node_modules/**'`), a RegExp (`/\.git/`), or a function (`(path) => path.includes('node_modules')`).
- **Always handle the `error` event**: Without an error handler, watcher errors will crash your process.
- **Closing is async**: `watcher.close()` returns a Promise. Await it in cleanup/shutdown code.
- **macOS and `fsevents`**: On macOS, chokidar uses the native `fsevents` API for better performance. It is installed automatically as an optional dependency.
- **`ready` event**: Fires after the initial scan is complete. Useful for knowing when the watcher is fully set up.
