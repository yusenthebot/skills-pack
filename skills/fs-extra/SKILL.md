---
name: fs-extra
description: >
  Extended Node.js fs module with promise support and extra methods like copy, move, ensureDir, and JSON file helpers. Use when: copying/moving files, creating nested directories, reading/writing JSON, checking path existence. NOT for: streaming large files (use fs.createReadStream), file watching (use chokidar).
---

# fs-extra

## Overview
fs-extra adds methods to the native Node.js `fs` module that aren't included, such as `copy`, `move`, `ensureDir`, `readJson`, and `writeJson`. It also provides promise-based versions of all native `fs` methods. It is a drop-in replacement for `fs` — you can import it in place of `fs` and get all native methods plus the extras.

## Installation
```bash
npm install fs-extra
# yarn
yarn add fs-extra
# pnpm
pnpm add fs-extra
```

TypeScript types:
```bash
npm install -D @types/fs-extra
```

## Core API / Commands

### copy(src, dest, [options])
Copies a file or directory. Directories are copied recursively.
```js
import fs from 'fs-extra';

await fs.copy('/tmp/source', '/tmp/destination');

// With overwrite control
await fs.copy('/tmp/source', '/tmp/destination', { overwrite: false, errorOnExist: true });

// Filter: only copy .js files
await fs.copy('/tmp/source', '/tmp/destination', {
  filter: (src, dest) => {
    return src.endsWith('.js') || fs.statSync(src).isDirectory();
  },
});
```

### move(src, dest, [options])
Moves a file or directory. Works across devices.
```js
await fs.move('/tmp/old-location/file.txt', '/tmp/new-location/file.txt');

// Overwrite if destination exists
await fs.move('/tmp/old', '/tmp/new', { overwrite: true });
```

### ensureDir / ensureFile
Creates directory or file if it doesn't exist. Parent directories are created as needed.
```js
await fs.ensureDir('/tmp/my/nested/directory');
// Directory now exists, including all parents

await fs.ensureFile('/tmp/my/nested/file.txt');
// File and all parent directories now exist
```

### readJson / writeJson
```js
const config = await fs.readJson('./config.json');
console.log(config.version);

await fs.writeJson('./output.json', { name: 'app', version: '1.0.0' }, { spaces: 2 });
```

### outputFile / outputJson
Like `writeFile` and `writeJson`, but creates parent directories if they don't exist.
```js
await fs.outputFile('/tmp/deep/nested/file.txt', 'hello world');
await fs.outputJson('/tmp/deep/nested/data.json', { key: 'value' }, { spaces: 2 });
```

### remove
Removes a file or directory. Directories are removed recursively. Does not throw if the path doesn't exist.
```js
await fs.remove('/tmp/my-directory');
await fs.remove('/tmp/my-file.txt');
```

### pathExists
Tests whether the given path exists.
```js
const exists = await fs.pathExists('/tmp/my-file.txt');
if (exists) {
  console.log('File found');
}
```

## Common Patterns

### Safe config file management
```js
import fs from 'fs-extra';
import path from 'path';

const CONFIG_PATH = path.join(process.env.HOME, '.myapp', 'config.json');

async function loadConfig(defaults = {}) {
  const exists = await fs.pathExists(CONFIG_PATH);
  if (!exists) {
    await fs.outputJson(CONFIG_PATH, defaults, { spaces: 2 });
    return defaults;
  }
  return fs.readJson(CONFIG_PATH);
}

async function saveConfig(config) {
  await fs.outputJson(CONFIG_PATH, config, { spaces: 2 });
}
```

### Build script: clean and copy assets
```js
import fs from 'fs-extra';

async function build() {
  // Clean output
  await fs.remove('./dist');
  await fs.ensureDir('./dist');

  // Copy static assets
  await fs.copy('./src/assets', './dist/assets');
  await fs.copy('./public', './dist/public', {
    filter: (src) => !src.endsWith('.map'),
  });
}
```

### Atomic write with temp file
```js
import fs from 'fs-extra';
import path from 'path';

async function atomicWriteJson(filePath, data) {
  const tmpPath = filePath + '.tmp';
  await fs.writeJson(tmpPath, data, { spaces: 2 });
  await fs.move(tmpPath, filePath, { overwrite: true });
}
```

## Configuration
Most methods accept an options object. Key options:

| Method | Option | Description |
|--------|--------|-------------|
| `copy` | `overwrite` | Overwrite existing (default: `true`) |
| `copy` | `errorOnExist` | Throw if dest exists and overwrite is false |
| `copy` | `filter` | `(src, dest) => boolean` filter function |
| `copy` | `dereference` | Follow symlinks (default: `false`) |
| `move` | `overwrite` | Overwrite existing (default: `false`) |
| `writeJson` | `spaces` | JSON indentation spaces |
| `writeJson` | `replacer` | JSON.stringify replacer |
| `readJson` | `throws` | Throw on invalid JSON (default: `true`) |

## Tips & Gotchas
- **Drop-in replacement**: `import fs from 'fs-extra'` replaces `import fs from 'fs'` — all native methods are re-exported.
- **Sync variants available**: Every async method has a sync counterpart, e.g. `fs.copySync()`, `fs.moveSync()`, `fs.ensureDirSync()`.
- **copy filter is called for directories too**: When using `filter` with `copy`, the function receives directory paths as well. Return `true` for directories you want to recurse into.
- **remove does not throw on ENOENT**: Calling `fs.remove()` on a non-existent path silently succeeds, similar to `rm -rf`.
- **move across devices**: Unlike `fs.rename`, `fs.move` works across different filesystems/partitions by copying then deleting.
- **writeJson uses UTF-8 by default**: No need to specify encoding when writing JSON files.
- **readJson throws on parse errors by default**: Set `{ throws: false }` to return `null` instead of throwing on invalid JSON.
- **ensureDir is idempotent**: Safe to call multiple times; it won't error if the directory already exists.
