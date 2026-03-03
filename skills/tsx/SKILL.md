---
name: tsx
description: >
  Run TypeScript files directly with Node.js, powered by esbuild. Use when: executing TS scripts, running TS files in development, replacing ts-node for speed. NOT for: production builds (use tsc/esbuild/tsup), type checking (use tsc --noEmit).
---

# tsx

## Overview
tsx (TypeScript Execute) is a Node.js enhancement that allows running TypeScript files directly without a separate compilation step. It uses esbuild under the hood for near-instant transpilation and supports both ESM and CommonJS. tsx is a drop-in replacement for `ts-node` with significantly faster startup times and zero configuration.

## Installation
```bash
npm install -D tsx
yarn add -D tsx
pnpm add -D tsx

# Or install globally
npm install -g tsx
```

## Core API / Commands

### Running Scripts
```bash
# Run a TypeScript file
tsx src/index.ts

# Run with arguments
tsx src/cli.ts --verbose --output dist

# Run an ESM TypeScript file
tsx src/server.mts

# Run a CJS TypeScript file
tsx src/script.cts

# Equivalent to: node --import tsx src/index.ts (Node.js 20.6+)
node --import tsx src/index.ts
```

### Watch Mode
```bash
# Watch and re-run on changes
tsx watch src/server.ts

# Watch specific files/directories
tsx watch --clear-screen=false src/index.ts

# Ignore patterns during watch
tsx watch --ignore ./data src/index.ts
```

### REPL
```bash
# Start TypeScript REPL
tsx

# Evaluate inline TypeScript
tsx --eval "const x: number = 42; console.log(x)"
```

### As a Node.js Loader
```bash
# Node.js 20.6+ (recommended)
node --import tsx ./src/index.ts

# Node.js 18+ (legacy loader)
node --loader tsx ./src/index.ts

# Via NODE_OPTIONS
NODE_OPTIONS="--import tsx" node src/index.ts
```

## Common Patterns

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "tsx src/index.ts",
    "script": "tsx scripts/migrate.ts",
    "seed": "tsx src/db/seed.ts",
    "test": "tsx --test src/**/*.test.ts"
  }
}
```

### Running with Node.js Test Runner
```bash
# Use tsx with Node.js built-in test runner
tsx --test src/**/*.test.ts

# Or via node loader
node --import tsx --test src/**/*.test.ts
```

```ts
// src/math.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { add } from "./math.ts";

describe("add", () => {
  it("adds two numbers", () => {
    assert.equal(add(1, 2), 3);
  });
});
```

### Express/Fastify Development Server
```ts
// src/server.ts
import express from "express";

const app = express();
const port = process.env.PORT ?? 3000;

app.get("/", (_req, res) => {
  res.json({ message: "Hello from tsx!" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```
```bash
tsx watch src/server.ts
```

### As Shebang for CLI Scripts
```ts
#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
const data = readFileSync("data.json", "utf-8");
console.log(JSON.parse(data));
```

### Environment with dotenv
```bash
tsx --env-file=.env src/server.ts
```

## Configuration

tsx requires no configuration files. It reads `tsconfig.json` for path aliases and compiler options but does not require one to function.

### How tsx Works
1. Hooks into Node.js module resolution via `--import` or `--loader`
2. Intercepts `.ts`, `.tsx`, `.mts`, `.cts` file imports
3. Transpiles with esbuild (stripping types, no type checking)
4. Passes the resulting JavaScript to Node.js

### Supported File Extensions
| Extension | Module System |
|-----------|--------------|
| `.ts` | Auto-detected (based on `package.json` `type`) |
| `.tsx` | Auto-detected with JSX support |
| `.mts` | Always ESM |
| `.cts` | Always CommonJS |

### tsx vs ts-node
| Feature | tsx | ts-node |
|---------|-----|---------|
| Speed | Fast (esbuild) | Slow (tsc) |
| ESM support | Full | Partial |
| No tsconfig needed | Yes | No |
| Type checking | No (strips types) | Optional |
| Setup | Zero config | Complex |
| Decorators | Limited | Full support |

## Tips & Gotchas

- **tsx does NOT type-check**. It only strips types and transpiles. Always run `tsc --noEmit` separately (in CI or pre-commit) for type safety.
- **tsx is significantly faster than ts-node** because esbuild transpiles without type checking. Cold start is nearly instant.
- **Path aliases from `tsconfig.json` are resolved automatically**. You do not need `tsconfig-paths` when using tsx.
- **`tsx watch` restarts the entire process** on file changes (not hot module replacement). It is ideal for server development.
- **ESM and CJS interop works seamlessly**. tsx handles `require()` of `.ts` files and `import` of `.ts` files regardless of the project's module system.
- **For production, compile with `tsc` or a bundler** (esbuild, tsup, rollup). Do not use tsx in production; it adds startup overhead and lacks optimizations.
- **tsx works with Node.js built-in test runner** via `tsx --test` or `node --import tsx --test`, making it a lightweight test setup without Vitest or Jest.
- **Decorators and `emitDecoratorMetadata` are not fully supported** by esbuild. If you need these (e.g., NestJS, TypeORM), use ts-node with SWC instead.
- **Use `node --import tsx` for programmatic use** in Node.js 20.6+. The older `--loader` flag is deprecated and may emit warnings.
