---
name: unbuild
description: >
  Unified JavaScript build system combining Rollup and mkdist with auto-inferred config. Use when: building JS/TS libraries for npm, needing ESM/CJS dual output, wanting passive/stub mode for development, using the unjs ecosystem. NOT for: frontend app builds, projects needing dev server or HMR.
---

# unbuild

## Overview
unbuild is a unified JavaScript build system from the unjs ecosystem. It combines Rollup for bundling and mkdist for file-to-file transpilation, with an auto-inferred configuration based on your `package.json` exports. Its standout feature is "stub" mode, which uses `jiti` to create a passthrough that loads source files directly during development — eliminating the need to rebuild after every change.

## Installation
```bash
npm install unbuild --save-dev
yarn add unbuild --dev
pnpm add unbuild -D
```

## Core API / Commands

### CLI Usage
```bash
# Build the project
npx unbuild

# Stub mode for development (creates passthrough to src)
npx unbuild --stub

# Build with minification
npx unbuild --minify
```

### build.config.ts
```ts
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
  },
});
```

## Common Patterns

### Package.json-Driven Configuration
```json
{
  "name": "my-lib",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  },
  "scripts": {
    "build": "unbuild",
    "dev": "unbuild --stub"
  }
}
```

unbuild reads `main`, `module`, and `exports` from `package.json` to automatically infer entry points and output formats.

### Multiple Entries with Mixed Strategies
```ts
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    // Rollup bundling (default)
    { input: 'src/index', name: 'index' },
    // mkdist file-to-file transpilation (preserves directory structure)
    { input: 'src/runtime/', outDir: 'dist/runtime', builder: 'mkdist' },
    // Copy with pattern matching
    { input: 'src/templates/', outDir: 'dist/templates', builder: 'copy' },
  ],
  declaration: true,
  clean: true,
});
```

### Stub Mode for Development
```bash
# In your library package
npx unbuild --stub
```

Stub mode creates lightweight files in `dist/` that import directly from your source using `jiti`. This means:
- No need to rebuild after every change
- Consumers in the monorepo immediately see updates
- Ideal for monorepo development workflows

```js
// Generated dist/index.mjs (stub)
import jiti from "jiti";
export default jiti(null, { interopDefault: true })("/path/to/src/index.ts");
```

## Configuration

### Rollup Options
```ts
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      target: 'node18',
      minify: false,
    },
    resolve: {
      preferBuiltins: true,
    },
    output: {
      sourcemap: true,
    },
  },
  externals: ['node:fs', 'node:path', 'defu'],
});
```

### Hooks
```ts
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  hooks: {
    'build:before': (ctx) => {
      console.log('Starting build for entries:', ctx.options.entries);
    },
    'build:done': (ctx) => {
      console.log('Build complete!');
    },
    'rollup:options': (_ctx, options) => {
      // Modify Rollup options before build
    },
  },
});
```

### Multiple Build Configurations
```ts
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig([
  {
    name: 'main',
    entries: ['src/index'],
    declaration: true,
    rollup: { emitCJS: true },
  },
  {
    name: 'cli',
    entries: ['src/cli'],
    rollup: { emitCJS: false },
  },
]);
```

## Tips & Gotchas
- unbuild auto-infers entry points from `package.json` `exports`, `main`, and `module` fields — you often need zero configuration.
- Use `builder: 'mkdist'` for entries that should be transpiled file-by-file (preserving directory structure) rather than bundled into a single output.
- Stub mode (`--stub`) is the killer feature for monorepo DX — run it once and source changes are reflected immediately without rebuilding.
- The `declaration` option generates TypeScript `.d.ts`, `.d.mts`, and `.d.cts` files automatically.
- Dependencies listed in `dependencies` and `peerDependencies` are automatically externalized; `devDependencies` are bundled unless listed in `externals`.
- unbuild outputs `.mjs` for ESM and `.cjs` for CJS by default, which works regardless of the `type` field in package.json.
- Use `rollup.emitCJS: true` to generate CommonJS output alongside ESM; without it, only ESM is produced by default.
- The `clean` option removes the output directory before building; enable it to avoid stale artifacts.
- For the unjs ecosystem (nitro, nuxt, h3), unbuild is the standard build tool and integrates seamlessly with their conventions.
