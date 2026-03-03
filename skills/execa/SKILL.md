---
name: execa
description: >
  Process execution for Node.js with better defaults than child_process. Use when: running shell commands, spawning subprocesses, piping between processes, streaming stdout/stderr. NOT for: in-browser execution, simple file I/O (use fs), HTTP requests.
---

# execa

## Overview
Execa is a modern process execution library that improves on Node's built-in `child_process` with better defaults, promise-based API, enhanced error handling, and cross-platform support. It handles escaping, piping, streaming, and subprocess management with a clean, intuitive interface. Version 8+ is ESM-only with a redesigned API.

## Installation
```bash
npm install execa
# or
yarn add execa
# or
pnpm add execa
```

> Execa v8+ is ESM-only. For CommonJS, use `execa@7`.

## Core API / Commands

### Basic execution
```ts
import { execa, execaCommand } from 'execa';

// Array form (recommended -- auto-escapes arguments)
const { stdout } = await execa('git', ['status', '--short']);
console.log(stdout);

// String command form (parses command string)
const { stdout: out } = await execaCommand('git status --short');

// Access full result
const result = await execa('node', ['--version']);
console.log(result.stdout);      // 'v20.10.0'
console.log(result.exitCode);    // 0
console.log(result.escapedCommand); // 'node --version'
```

### Shell mode
```ts
// Run through system shell (enables pipes, globbing, etc.)
const { stdout } = await execa('echo $HOME && ls *.ts | head -5', { shell: true });
```

### Synchronous execution
```ts
import { execaSync } from 'execa';

const { stdout } = execaSync('git', ['rev-parse', 'HEAD']);
```

### Template literal syntax ($)
```ts
import { $ } from 'execa';

// Template literal syntax
const branch = await $`git branch --show-current`;
const files = await $`find . -name ${'*.ts'} -not -path ${'*/node_modules/*'}`;

// Pipe with template literals
const count = await $`ls`.pipe`wc -l`;

// Variables are auto-escaped (safe from injection)
const dir = 'my dir with spaces';
await $`mkdir ${dir}`;
```

## Common Patterns

### Error handling
```ts
import { execa, ExecaError } from 'execa';

try {
  await execa('git', ['push', 'origin', 'main']);
} catch (error) {
  // ExecaError has rich metadata
  console.error('Command failed:', error.command);
  console.error('Exit code:', error.exitCode);
  console.error('stderr:', error.stderr);
  console.error('Signal:', error.signal); // e.g., 'SIGTERM'
}
```

### Piping between processes
```ts
// Pipe stdout of one process to stdin of another
const { stdout } = await execa('cat', ['data.json']).pipeStdout(execa('jq', ['.name']));

// v8+ pipe syntax
const { stdout: result } = await execa('git', ['log', '--oneline'])
  .pipe('grep', ['fix']);
```

### Streaming output in real-time
```ts
const subprocess = execa('npm', ['install']);
subprocess.stdout.pipe(process.stdout);
subprocess.stderr.pipe(process.stderr);
await subprocess;
```

### Input via stdin
```ts
const { stdout } = await execa('grep', ['hello'], {
  input: 'hello world\nfoo bar\nhello again',
});
// stdout: 'hello world\nhello again'
```

### Environment variables and CWD
```ts
await execa('deploy.sh', {
  cwd: '/path/to/project',
  env: {
    NODE_ENV: 'production',
    API_KEY: process.env.API_KEY,
  },
  timeout: 60000,  // kill after 60s
});
```

### Abort with signal
```ts
const controller = new AbortController();

setTimeout(() => controller.abort(), 5000);

try {
  await execa('long-running-task', { signal: controller.signal });
} catch (error) {
  if (error.isCanceled) console.log('Process was aborted');
}
```

## Configuration

```ts
execa('cmd', ['args'], {
  cwd: '/working/dir',       // working directory
  env: { KEY: 'val' },       // environment variables
  shell: false,               // run through system shell
  timeout: 0,                 // ms before SIGTERM (0 = none)
  input: 'stdin data',        // write to subprocess stdin
  stdin: 'pipe',              // stdin config
  stdout: 'pipe',             // stdout config ('pipe' | 'inherit' | 'ignore')
  stderr: 'pipe',             // stderr config
  reject: true,               // reject promise on non-zero exit
  stripFinalNewline: true,    // strip trailing newline from output
  signal: abortController.signal, // AbortSignal for cancellation
  uid: 1000,                  // user identity
  gid: 1000,                  // group identity
  windowsHide: true,          // hide subprocess window on Windows
});
```

## Tips & Gotchas
- Always prefer array form `execa('cmd', ['arg1', 'arg2'])` over string form. Array form auto-escapes arguments and avoids shell injection.
- Execa v8+ is ESM-only. Use `execa@7` for CommonJS / `require()`.
- By default, `reject: true` means non-zero exit codes throw. Set `reject: false` if you want to handle non-zero exits manually.
- `stdout` and `stderr` are strings by default. For large output, use streaming (`subprocess.stdout.pipe(...)`) to avoid memory issues.
- Use `timeout` to prevent hung processes. The subprocess receives `SIGTERM` first, then `SIGKILL` after a grace period.
- The `shell: true` option enables shell features like `|`, `&&`, `>`, but is less secure. Avoid with user-provided input.
- `execaCommand('git status')` splits the string by spaces. For args with spaces, use the array form instead.
- The `$` template tag auto-escapes interpolated values to prevent shell injection attacks.
- On Windows, `.bat`/`.cmd` files require `shell: true` to execute properly.
