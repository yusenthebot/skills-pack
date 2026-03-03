---
name: tsconfig-paths
description: >
  Resolve TypeScript path aliases at runtime in Node.js. Use when: running TS/JS with path aliases (e.g., @/utils), using ts-node or compiled JS with tsconfig paths. NOT for: bundled apps (Vite/webpack resolve paths natively), tsx (handles paths already).
---

# tsconfig-paths

## Overview
tsconfig-paths enables Node.js to resolve modules using the `paths` and `baseUrl` defined in your `tsconfig.json`. TypeScript path aliases like `@/utils` only work at compile time; at runtime, Node.js does not understand them. This package bridges that gap by hooking into Node.js module resolution.

## Installation
```bash
npm install -D tsconfig-paths
yarn add -D tsconfig-paths
pnpm add -D tsconfig-paths
```

## Core API / Commands

### Register via CLI (most common)
```bash
# With ts-node
node -r tsconfig-paths/register -r ts-node/register src/index.ts

# With compiled JavaScript
node -r tsconfig-paths/register dist/index.js

# Using NODE_OPTIONS
NODE_OPTIONS="-r tsconfig-paths/register" node dist/index.js
```

### Programmatic Registration
```ts
import { register } from "tsconfig-paths";

// Register paths from tsconfig.json
const cleanup = register({
  baseUrl: ".",
  paths: {
    "@/*": ["./src/*"],
    "@utils/*": ["./src/utils/*"],
    "@config": ["./src/config/index"],
  },
});

// Later, clean up if needed
cleanup();
```

### matchPath (manual resolution)
```ts
import { createMatchPath, loadConfig } from "tsconfig-paths";

// Load tsconfig.json automatically
const config = loadConfig(".");

if (config.resultType === "success") {
  const matchPath = createMatchPath(
    config.absoluteBaseUrl,
    config.paths,
  );

  // Resolve a path alias to an absolute path
  const resolved = matchPath("@/utils/logger");
  console.log(resolved);
  // → /project/src/utils/logger
}
```

## Common Patterns

### tsconfig.json with Path Aliases
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@utils/*": ["./src/utils/*"],
      "@models/*": ["./src/models/*"],
      "@config": ["./src/config/index"]
    },
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

### ts-node Integration
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "ts-node": {
    "require": ["tsconfig-paths/register"]
  }
}
```
```bash
# Now ts-node automatically resolves path aliases
npx ts-node src/index.ts
```

### Jest Integration
```js
// jest.config.js
const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
};
```

Note: For Jest, `ts-jest` has built-in `pathsToModuleNameMapper`. You typically do not need `tsconfig-paths` directly in Jest.

### Vitest Integration
```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
});
```

Note: For Vitest, use `vite-tsconfig-paths` plugin (not `tsconfig-paths` directly).

### Running Compiled JS with Path Aliases
```json
// package.json
{
  "scripts": {
    "build": "tsc",
    "start": "node -r tsconfig-paths/register dist/index.js"
  }
}
```

## Configuration

### How Resolution Works
1. `tsconfig-paths` reads `baseUrl` and `paths` from `tsconfig.json`
2. When Node.js requires a module matching a `paths` pattern, tsconfig-paths intercepts
3. It maps the alias to the real file system path using `baseUrl` as the root
4. Node.js then loads the resolved file normally

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `TS_NODE_PROJECT` | Path to tsconfig.json (when using ts-node) |
| `TS_NODE_BASEURL` | Override baseUrl |

### loadConfig Options
```ts
import { loadConfig } from "tsconfig-paths";

// Auto-detect tsconfig.json location
const config = loadConfig(".");

// Specify explicit tsconfig path
const config = loadConfig("/path/to/project");
```

## Tips & Gotchas

- **Path aliases are a TypeScript-only feature**. They do not work at runtime without `tsconfig-paths` or a bundler. This is the number one confusion for TypeScript beginners.
- **`baseUrl` must be set** in `tsconfig.json` for `paths` to work. Without `baseUrl`, the `paths` field is ignored by both TypeScript and tsconfig-paths.
- **Order matters in `-r` flags**: `tsconfig-paths/register` must come before (or alongside) `ts-node/register` for paths to be resolved during transpilation.
- **Bundlers do not need tsconfig-paths**. Vite, webpack, and esbuild have their own alias resolution. Use `vite-tsconfig-paths` for Vite or `resolve.alias` for webpack.
- **tsx does not need tsconfig-paths**. The `tsx` runner handles path alias resolution internally via esbuild.
- **For production compiled code**, you still need `-r tsconfig-paths/register` when running the compiled `.js` output, because `tsc` does not rewrite import paths in the output.
- **`tsc-alias` is an alternative** that rewrites import paths in the compiled output, eliminating the need for runtime resolution. Consider it for production deployments.
- **Wildcard paths use `*` syntax**: `"@/*": ["./src/*"]` maps `@/foo/bar` to `./src/foo/bar`. The `*` captures the rest of the path.
