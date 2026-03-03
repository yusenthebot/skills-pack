---
name: glob
description: >
  File pattern matching using glob patterns to find files and directories. Use when: finding files matching patterns, listing directory contents with wildcards, building file lists for processing. NOT for: file watching (use chokidar), regex-based content search (use grep/ripgrep).
---

# glob

## Overview
glob matches files using the patterns that shells use, like stars and stuff. It provides both async and sync APIs for finding files matching glob patterns such as `**/*.js`. As of v10+, the API is modernized with a class-based interface, iterable results, and better performance through built-in file walking.

## Installation
```bash
npm install glob
# yarn
yarn add glob
# pnpm
pnpm add glob
```

## Core API / Commands

### glob(pattern, [options])
Returns a promise that resolves to an array of matching file paths.
```js
import { glob } from 'glob';

// Find all JavaScript files recursively
const jsFiles = await glob('**/*.js');

// Find files in specific directory
const configs = await glob('config/*.{json,yaml,yml}');

// Multiple patterns
const sources = await glob(['src/**/*.ts', 'lib/**/*.ts']);
```

### globSync(pattern, [options])
Synchronous version that returns an array directly.
```js
import { globSync } from 'glob';

const files = globSync('**/*.test.ts');
```

### globStream(pattern, [options])
Returns a readable stream of matching paths.
```js
import { globStream } from 'glob';

const stream = globStream('**/*.log');
stream.on('data', (filePath) => {
  console.log('Found:', filePath);
});
stream.on('end', () => console.log('Done'));
```

### Glob class
Lower-level class for more control.
```js
import { Glob } from 'glob';

const g = new Glob('**/*.md', { cwd: './docs' });

// Async iteration
for await (const file of g) {
  console.log(file);
}

// Or walk manually
const results = await g.walk();
```

## Common Patterns

### Find and process files
```js
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';

async function findAndProcess() {
  const files = await glob('src/**/*.ts', {
    ignore: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
  });

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    console.log(`${file}: ${content.length} chars`);
  }
}
```

### Build tool: collect assets with filtering
```js
import { glob } from 'glob';

async function collectAssets(srcDir, outDir) {
  const images = await glob('**/*.{png,jpg,svg,webp}', {
    cwd: srcDir,
    dot: false,
    absolute: true,
  });

  const styles = await glob('**/*.css', {
    cwd: srcDir,
    absolute: true,
  });

  return { images, styles };
}
```

### Using cwd and returning absolute paths
```js
import { glob } from 'glob';

// Search relative to a specific directory
const files = await glob('*.json', {
  cwd: '/etc/myapp',
  absolute: true,   // Return absolute paths
});
// => ['/etc/myapp/config.json', '/etc/myapp/secrets.json']
```

## Configuration
Key options for glob v10+:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cwd` | string | `process.cwd()` | Directory to search from |
| `absolute` | boolean | `false` | Return absolute paths |
| `dot` | boolean | `false` | Include dotfiles (e.g. `.gitignore`) |
| `ignore` | string/string[] | `[]` | Patterns to exclude |
| `nodir` | boolean | `false` | Exclude directories from results |
| `follow` | boolean | `false` | Follow symlinks |
| `maxDepth` | number | `Infinity` | Maximum directory depth |
| `withFileTypes` | boolean | `false` | Return `Path` objects instead of strings |
| `signal` | AbortSignal | - | Abort signal for cancellation |
| `stat` | boolean | `false` | Perform stat on entries |

## Tips & Gotchas
- **v10 breaking changes**: The default export changed. Use `import { glob } from 'glob'` (named import) instead of `import glob from 'glob'`.
- **Double-star `**` matches zero or more directories**: `src/**/*.ts` matches `src/index.ts` as well as `src/utils/helpers.ts`.
- **Brace expansion**: `{a,b}` expands to match either — `*.{ts,js}` matches both TypeScript and JavaScript files.
- **Dotfiles excluded by default**: Files starting with `.` are not matched unless you set `dot: true` or use a pattern that starts with `.`.
- **Ignore patterns use the same glob syntax**: `ignore: ['**/node_modules/**', '**/.git/**']` is a common setup.
- **Use `nodir: true` for file-only results**: Without it, directories matching the pattern are included in results.
- **Performance**: For large codebases, use `maxDepth` and specific `cwd` to limit the search scope.
- **AbortSignal support**: Pass `signal` from an `AbortController` to cancel long-running glob operations.
- **Trailing slashes match directories only**: `src/*/` will only match directories inside `src/`.
