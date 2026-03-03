---
name: rollup
description: >
  ES module bundler for JavaScript libraries and applications. Use when: building JS libraries, needing tree shaking, outputting ESM/CJS/UMD/IIFE, using Rollup plugins. NOT for: full-featured app bundling with HMR (use Vite), projects needing loaders for CSS/images (use Webpack).
---

# rollup

## Overview
Rollup is a module bundler for JavaScript that compiles small pieces of code into larger, more complex bundles. It uses the ES module format natively, enabling superior tree shaking and dead code elimination. Rollup is the standard choice for building JavaScript libraries and is the production bundler behind Vite.

## Installation
```bash
npm install rollup --save-dev
yarn add rollup --dev
pnpm add rollup -D

# Common plugins
npm install @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-typescript @rollup/plugin-terser --save-dev
```

## Core API / Commands

### CLI Usage
```bash
# Basic bundle
npx rollup src/index.js --file dist/bundle.js --format esm

# With config file
npx rollup --config rollup.config.mjs

# Watch mode
npx rollup --config --watch
```

### Basic Configuration
```js
// rollup.config.mjs
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [resolve(), commonjs(), terser()],
};
```

## Common Patterns

### Multiple Output Formats
```js
// rollup.config.mjs
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'MyLib',
      globals: { react: 'React' },
    },
  ],
  external: ['react', 'react-dom'],
  plugins: [resolve(), commonjs(), typescript()],
};
```

### Code Splitting
```js
// rollup.config.mjs
export default {
  input: {
    index: 'src/index.js',
    utils: 'src/utils.js',
    helpers: 'src/helpers.js',
  },
  output: {
    dir: 'dist',
    format: 'esm',
    chunkFileNames: 'chunks/[name]-[hash].js',
    manualChunks: {
      vendor: ['lodash-es', 'date-fns'],
    },
  },
};
```

### Programmatic API
```js
import { rollup, watch } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';

async function build() {
  const bundle = await rollup({
    input: 'src/index.js',
    plugins: [resolve()],
  });

  // Generate output
  const { output } = await bundle.generate({
    format: 'esm',
    sourcemap: true,
  });

  // Write to disk
  await bundle.write({
    file: 'dist/bundle.js',
    format: 'esm',
    sourcemap: true,
  });

  await bundle.close();
}

build();
```

## Configuration

### Watch Mode Options
```js
export default {
  input: 'src/index.js',
  output: { file: 'dist/bundle.js', format: 'esm' },
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**',
    clearScreen: false,
  },
};
```

### Preserving Modules (No Bundling)
```js
export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src',
  },
  external: (id) => !id.startsWith('.') && !id.startsWith('/'),
};
```

### Replace and Define
```js
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/index.js',
  output: { file: 'dist/bundle.js', format: 'esm' },
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
      __VERSION__: JSON.stringify('1.0.0'),
    }),
  ],
};
```

## Tips & Gotchas
- Always use `@rollup/plugin-node-resolve` to resolve bare module specifiers from `node_modules`; Rollup does not do this by default.
- Use `@rollup/plugin-commonjs` to convert CommonJS modules (most npm packages) to ES modules so Rollup can process them.
- Mark dependencies as `external` for library builds to avoid bundling them into your output; consumers will install them separately.
- The `preserveModules` option outputs each source file as a separate chunk, preserving the directory structure — useful for component libraries.
- Use `output.globals` when building UMD format to map external dependencies to their global variable names (e.g., `react` to `React`).
- For TypeScript, `@rollup/plugin-typescript` handles transpilation but does NOT emit declaration files by default — set `declaration: true` in your `tsconfig.json`.
- Watch mode (`--watch`) re-bundles on file change but does not provide a dev server; pair with a tool like `sirv` or `live-server` for that.
- The `treeshake` option is enabled by default; you can fine-tune it with `treeshake.moduleSideEffects` if a module's side effects are incorrectly removed.
- Use `output.banner` and `output.footer` to inject shebang lines (`#!/usr/bin/env node`) or license headers into output files.
