---
name: shelljs
description: >
  Portable Unix shell commands implemented in pure JavaScript for Node.js. Use when: executing shell commands cross-platform, scripting file operations, build scripts, CLI tools. NOT for: high-performance I/O, streaming large files, async-heavy workloads.
---

# shelljs

## Overview
ShellJS provides portable Unix shell commands (like `cp`, `rm`, `mkdir`, `grep`, `sed`) implemented in JavaScript. It works on Windows, macOS, and Linux without requiring a Unix shell. Commands run synchronously by default, making scripts straightforward to write and reason about.

## Installation
```bash
npm install shelljs
# or
yarn add shelljs
# or
pnpm add shelljs
```

## Core API / Commands

### Executing shell commands
```js
const shell = require('shelljs');

// Run any command
const result = shell.exec('git log --oneline -5');
console.log(result.stdout);
console.log(result.stderr);
console.log(result.code); // exit code

// Silent mode (suppress stdout)
shell.exec('npm install', { silent: true });

// Async exec
shell.exec('long-running-command', { async: true }, (code, stdout, stderr) => {
  console.log('Exit code:', code);
});
```

### File and directory operations
```js
// Create directories (with -p for parents)
shell.mkdir('-p', 'dist/assets/images');

// Copy files
shell.cp('src/config.json', 'dist/');
shell.cp('-r', 'src/templates/*', 'dist/templates/');

// Move/rename
shell.mv('old-name.js', 'new-name.js');

// Remove files and directories
shell.rm('-rf', 'dist');

// Change directory
shell.cd('src');
shell.cd('..');

// List files
const files = shell.ls('src/*.js');
shell.ls('-la', '/tmp');

// Read file contents
const content = shell.cat('package.json');

// Write to file (using ShellString)
shell.ShellString('Hello\n').to('output.txt');
shell.ShellString('Appended\n').toEnd('output.txt');
```

### Search and transform
```js
// Grep
const matches = shell.grep('TODO', 'src/*.js');
shell.grep('-l', 'console.log', 'src/**/*.ts'); // list files only

// Sed (in-place replacement)
shell.sed('-i', /v1\.0/g, 'v2.0', 'package.json');

// Find files
const jsFiles = shell.find('src').filter(f => f.match(/\.js$/));

// Which (find command in PATH)
const nodePath = shell.which('node');
if (!nodePath) {
  shell.echo('Node not found');
  shell.exit(1);
}
```

## Common Patterns

### Build script
```js
#!/usr/bin/env node
const shell = require('shelljs');

shell.set('-e'); // Exit on error

// Clean
shell.rm('-rf', 'dist');
shell.mkdir('-p', 'dist');

// Compile
if (shell.exec('tsc').code !== 0) {
  shell.echo('TypeScript compilation failed');
  shell.exit(1);
}

// Copy assets
shell.cp('-r', 'src/assets/*', 'dist/assets/');
shell.cp('package.json', 'dist/');

shell.echo('Build complete!');
```

### Cross-platform deploy script
```js
const shell = require('shelljs');

// Check prerequisites
['git', 'node', 'npm'].forEach(cmd => {
  if (!shell.which(cmd)) {
    shell.echo(`Error: ${cmd} is required`);
    shell.exit(1);
  }
});

// Get current branch
const branch = shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).stdout.trim();

// Tag and push
const version = JSON.parse(shell.cat('package.json')).version;
shell.exec(`git tag -a v${version} -m "Release ${version}"`);
shell.exec('git push --tags');
```

### Batch file processing
```js
const shell = require('shelljs');

shell.ls('images/*.png').forEach(file => {
  const name = file.replace(/\.png$/, '.webp');
  shell.exec(`cwebp ${file} -o ${name}`, { silent: true });
});

// Replace across multiple files
shell.ls('src/**/*.js').forEach(file => {
  shell.sed('-i', 'require\\(', 'import(', file);
});
```

## Configuration

```js
// Global settings
shell.config.silent = true;     // Suppress command output
shell.config.fatal = true;      // Throw on error (like set -e)
shell.config.verbose = true;    // Print each command before running
shell.config.globOptions = { dot: true }; // Include dotfiles in globs

// Per-command: use set()
shell.set('-e'); // Exit on error
shell.set('+e'); // Disable exit on error
```

## Tips & Gotchas
- All commands return a `ShellString` object with `.code`, `.stdout`, `.stderr` properties -- always check `.code` for error handling.
- Use `shell.set('-e')` or `shell.config.fatal = true` to make scripts exit on first error, similar to `set -e` in bash.
- `shell.cd()` changes the process working directory globally -- it affects all subsequent commands.
- Glob patterns (like `*.js`) are expanded by ShellJS, not the shell, so they work identically on Windows and Unix.
- `shell.exec()` is synchronous by default; pass `{ async: true }` with a callback for non-blocking execution.
- `shell.rm('-rf', ...)` does not prompt for confirmation -- double-check paths before using.
- Pipe commands using the `.to()` and `.toEnd()` methods on ShellString, e.g., `shell.cat('a.txt').to('b.txt')`.
- For TypeScript, install `@types/shelljs` for type definitions.
- ShellJS commands do not support shell-specific syntax like `&&`, `||`, or pipes (`|`) -- use JavaScript control flow instead.
- The `shell.tempdir()` function returns the OS temp directory path cross-platform.
