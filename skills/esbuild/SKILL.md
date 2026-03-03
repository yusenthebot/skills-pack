---
name: esbuild
description: >
  Extremely fast JS/TS bundler. Use when: bundling Node.js apps, fast build pipelines, transpiling TypeScript, library bundling. NOT for: complex code-splitting (use Vite/Rollup), React HMR dev server.
---

# esbuild

## Installation
```bash
npm install -D esbuild
```

## CLI

```bash
# Bundle entry point
esbuild src/index.ts --bundle --outfile=dist/index.js

# Node.js app
esbuild src/server.ts --bundle --platform=node --target=node20 --outfile=dist/server.js

# Minified production build
esbuild src/index.ts --bundle --minify --sourcemap --outfile=dist/index.min.js

# Watch mode
esbuild src/index.ts --bundle --watch --outfile=dist/index.js
```

## JavaScript API

```ts
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outdir: 'dist',
  platform: 'node',       // 'browser' | 'node' | 'neutral'
  target: 'node20',
  format: 'esm',          // 'iife' | 'cjs' | 'esm'
  sourcemap: true,
  minify: true,
  external: ['react'],    // don't bundle this
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
```

## Common Patterns

### Multiple entry points
```ts
await esbuild.build({
  entryPoints: {
    main: 'src/index.ts',
    worker: 'src/worker.ts',
  },
  outdir: 'dist',
  bundle: true,
});
```

### Watch with rebuild
```ts
const ctx = await esbuild.context({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
});

await ctx.watch();
console.log('Watching...');
// ctx.dispose() to stop
```

### Transform only (no bundling)
```ts
const result = await esbuild.transform(tsCode, {
  loader: 'ts',
  target: 'es2020',
});
console.log(result.code);
```

### Plugin
```ts
const myPlugin: esbuild.Plugin = {
  name: 'my-plugin',
  setup(build) {
    build.onLoad({ filter: /\.txt$/ }, async (args) => {
      const text = await fs.readFile(args.path, 'utf8');
      return { contents: JSON.stringify(text), loader: 'json' };
    });
  },
};
```

## Tips & Gotchas
- esbuild is ~10-100x faster than webpack/rollup for most tasks
- TypeScript: esbuild strips types but does NOT type-check — run `tsc --noEmit` separately
- No tree-shaking across dynamic imports — use static imports for optimal bundles
- `external: ['node:*']` to exclude all Node built-ins from bundle
- For library dual CJS+ESM output, run two builds with different `format` options
