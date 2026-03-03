---
name: archiver
description: >
  Streaming archive generation library supporting zip and tar formats. Use when: creating zip/tar archives programmatically, bundling files for download, backup scripts, packaging build artifacts. NOT for: extracting archives (use decompress or tar), working with single files (just use fs).
---

# archiver

## Overview
archiver is a streaming interface for generating archive files in Node.js. It supports zip, tar, tar.gz, and other formats. It works with Node.js streams, so you can pipe archives directly to HTTP responses, file write streams, or other destinations without buffering the entire archive in memory. It is the go-to library for programmatic archive creation in Node.js.

## Installation
```bash
npm install archiver
# yarn
yarn add archiver
# pnpm
pnpm add archiver
```

TypeScript types:
```bash
npm install -D @types/archiver
```

## Core API / Commands

### Create and pipe a zip archive
```js
import archiver from 'archiver';
import fs from 'fs';

const output = fs.createWriteStream('./archive.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Archive created: ${archive.pointer()} total bytes`);
});

archive.on('error', (err) => { throw err; });
archive.on('warning', (err) => {
  if (err.code !== 'ENOENT') throw err;
});

archive.pipe(output);
```

### Append files
```js
// Single file with custom name in archive
archive.file('src/index.ts', { name: 'index.ts' });

// File with directory prefix
archive.file('README.md', { name: 'docs/README.md' });

// Append from buffer
archive.append(Buffer.from('hello world'), { name: 'hello.txt' });

// Append from string
archive.append('string content', { name: 'notes.txt' });

// Append from stream
archive.append(fs.createReadStream('large-file.bin'), { name: 'data.bin' });
```

### Append directories
```js
// Entire directory as-is
archive.directory('src/', 'source');

// Directory with a different name in the archive
archive.directory('dist/', 'release/v1.0');

// Directory root (no prefix)
archive.directory('public/', false);
```

### Glob patterns
```js
archive.glob('**/*.js', {
  cwd: 'src',
  ignore: ['**/*.test.js'],
});
```

### Finalize
Always call `finalize()` when done adding files.
```js
await archive.finalize();
```

## Common Patterns

### Create a zip from a build directory
```js
import archiver from 'archiver';
import fs from 'fs';

async function createBuildZip(buildDir, outputPath) {
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const done = new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
  });

  archive.pipe(output);
  archive.directory(buildDir, false);
  await archive.finalize();
  await done;

  console.log(`Created ${outputPath} (${archive.pointer()} bytes)`);
}

await createBuildZip('./dist', './release.zip');
```

### Stream zip to HTTP response (Express)
```js
import archiver from 'archiver';
import express from 'express';

const app = express();

app.get('/download', (req, res) => {
  res.attachment('files.zip');
  const archive = archiver('zip');
  archive.pipe(res);

  archive.file('reports/q1.pdf', { name: 'Q1-Report.pdf' });
  archive.file('reports/q2.pdf', { name: 'Q2-Report.pdf' });
  archive.finalize();
});
```

### Create a tar.gz archive
```js
import archiver from 'archiver';
import fs from 'fs';

const output = fs.createWriteStream('backup.tar.gz');
const archive = archiver('tar', { gzip: true, gzipOptions: { level: 9 } });

archive.pipe(output);
archive.directory('/var/data/myapp', 'backup');
archive.glob('*.sql', { cwd: '/var/backups/db' });
await archive.finalize();
```

## Configuration

### Archive format options
| Format | Option | Description |
|--------|--------|-------------|
| `zip` | `zlib.level` | Compression level 0-9 (0=none, 9=best) |
| `zip` | `forceLocalTime` | Use local time for file timestamps |
| `zip` | `store` | Store without compression (boolean) |
| `tar` | `gzip` | Enable gzip compression (boolean) |
| `tar` | `gzipOptions.level` | Gzip compression level 0-9 |

### Entry options (per-file)
| Option | Type | Description |
|--------|------|-------------|
| `name` | string | File name/path inside the archive |
| `date` | Date | Custom modification date |
| `mode` | number | File permissions (e.g., `0o755`) |
| `prefix` | string | Path prefix inside archive |

## Tips & Gotchas
- **Always call `finalize()`**: Forgetting to call `archive.finalize()` means the archive will never complete and streams will hang indefinitely.
- **Always handle `error` and `warning` events**: Unhandled archive errors crash the process. The `warning` event fires for non-fatal issues like missing files (ENOENT).
- **`archive.pointer()` returns total bytes**: Call this after `close` to get the final archive size.
- **`directory(path, false)` puts files at root**: Passing `false` as the second argument avoids wrapping files in a subdirectory inside the archive.
- **Streaming means low memory**: Archives are streamed, so even large archives use minimal memory. Do not buffer the entire archive.
- **glob patterns use `cwd`**: When using `archive.glob()`, set `cwd` to the base directory — matched files are added relative to that directory.
- **finalize returns a Promise**: In modern usage, `await archive.finalize()` ensures all data is flushed before continuing.
- **zip is the default**: If you just need a zip, `archiver('zip')` with default options is usually sufficient.
