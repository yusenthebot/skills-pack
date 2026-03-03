---
name: cross-env
description: >
  Set environment variables across platforms in npm scripts. Use when: setting NODE_ENV or other env vars in package.json scripts, cross-platform CLI commands. NOT for: loading .env files, runtime env management, complex env configuration.
---

# cross-env

## Overview
cross-env makes it possible to set environment variables in npm scripts in a way that works on Windows, macOS, and Linux. Without cross-env, `NODE_ENV=production node app.js` fails on Windows because it uses Unix-style variable assignment. cross-env normalizes the syntax across all platforms.

## Installation
```bash
npm install --save-dev cross-env
# or
yarn add --dev cross-env
# or
pnpm add -D cross-env
```

## Core API / Commands

### Basic usage in package.json scripts
```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack",
    "dev": "cross-env NODE_ENV=development node server.js",
    "test": "cross-env NODE_ENV=test jest"
  }
}
```

### Multiple environment variables
```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production API_URL=https://api.example.com webpack",
    "start": "cross-env PORT=4000 HOST=0.0.0.0 node server.js"
  }
}
```

### cross-env-shell (for commands needing shell features)
```json
{
  "scripts": {
    "greet": "cross-env-shell GREETING=hello \"echo $GREETING\"",
    "build": "cross-env-shell NODE_ENV=production \"echo Building for $NODE_ENV && webpack\""
  }
}
```
Use `cross-env-shell` when the command itself needs to reference the environment variable using shell syntax (`$VAR` or `%VAR%`).

## Common Patterns

### Build pipeline with environment flags
```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack --mode production",
    "build:staging": "cross-env NODE_ENV=staging API_URL=https://staging.api.com webpack",
    "build:analyze": "cross-env NODE_ENV=production ANALYZE=true webpack",
    "start:prod": "cross-env NODE_ENV=production node dist/server.js"
  }
}
```

### Testing with debug flags
```json
{
  "scripts": {
    "test": "cross-env NODE_ENV=test jest",
    "test:debug": "cross-env NODE_ENV=test DEBUG=true jest --verbose",
    "test:ci": "cross-env CI=true NODE_ENV=test jest --coverage --watchAll=false"
  }
}
```

### Setting Node.js options
```json
{
  "scripts": {
    "start": "cross-env NODE_OPTIONS='--max-old-space-size=4096' node server.js",
    "debug": "cross-env NODE_OPTIONS='--inspect' node server.js",
    "dev": "cross-env DEBUG=app:* node server.js"
  }
}
```

## Configuration

cross-env requires no configuration files. It is used exclusively as a command-line prefix in npm scripts. The syntax is:

```
cross-env VAR1=value1 VAR2=value2 <command>
```

The environment variables are only set for the duration of the command -- they do not persist after the command completes.

## Tips & Gotchas
- cross-env is a devDependency -- it is only needed at build/dev time, never in production runtime.
- Do NOT wrap values with quotes in cross-env: use `cross-env NODE_ENV=production`, not `cross-env NODE_ENV="production"`.
- Use `cross-env-shell` instead of `cross-env` when the spawned command itself needs to interpolate environment variables using shell syntax like `$VAR`.
- cross-env sets variables only for the spawned child process, not the current shell session.
- Values with spaces require quoting the entire command in `cross-env-shell`: `cross-env-shell MESSAGE="hello world" "echo $MESSAGE"`.
- The package is considered "finished" by its maintainer -- it works and no new features are planned. It is stable and safe to use.
- For complex environment setups, consider combining cross-env with dotenv rather than listing many variables inline.
- cross-env works with any command runner, not just npm -- it works with yarn, pnpm, and direct CLI usage.
- If you only target Unix-like systems (macOS/Linux), you do not need cross-env -- native `VAR=value command` syntax works fine.
- Avoid setting secrets in package.json scripts via cross-env since package.json is committed to source control.
