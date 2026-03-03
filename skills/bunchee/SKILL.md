---
name: bunchee
description: >
  Zero-config package bundler that reads exports from package.json. Use when: publishing npm packages, generating ESM/CJS dual output, building TypeScript libraries with declarations, needing a simple drop-in bundler. NOT for: application bundling, monorepo orchestration, projects needing extensive plugin systems.
---

# bunchee

## Overview
bunchee is a zero-config bundler for npm packages that reads the `exports` field in your `package.json` to determine entry points, output formats, and file paths. It generates ESM and CJS bundles, TypeScript declarations, and handles bin entries automatically. Powered by Rollup and SWC under the hood, bunchee is designed to be the simplest possible way to build and publish a TypeScript npm package.

## Installation
```bash
npm install bunchee --save-dev
yarn add bunchee --dev
pnpm add bunchee -D
```

## Core API / Commands

### CLI Usage
```bash
# Build based on package.json exports
npx bunchee

# Watch mode for development
npx bunchee --watch

# Build with minification
npx bunchee --minify

# Build a specific entry
npx bunchee src/index.ts

# Clean output before building
npx bunchee --clean
```

### Package.json Setup
```json
{
  "name": "my-package",
  "version": "1.0.0",
  "type": "module",
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
    }
  },
  "scripts": {
    "build": "bunchee",
    "dev": "bunchee --watch"
  },
  "devDependencies": {
    "bunchee": "latest"
  }
}
```

## Common Patterns

### Multiple Exports
```json
{
  "name": "my-package",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    },
    "./components": {
      "import": "./dist/components.mjs",
      "require": "./dist/components.cjs"
    }
  },
  "typesVersions": {
    "*": {
      "utils": ["./dist/utils.d.mts"],
      "components": ["./dist/components.d.mts"]
    }
  }
}
```

bunchee automatically maps each export to its corresponding source file. For the `"./utils"` export, it looks for `src/utils.ts` (or `src/utils/index.ts`).

### CLI Binary Entry
```json
{
  "name": "my-cli-tool",
  "bin": {
    "my-cli": "./dist/cli.mjs"
  },
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

bunchee automatically bundles the bin entry from `src/cli.ts` and adds the `#!/usr/bin/env node` shebang to the output.

### React Server Components
```json
{
  "exports": {
    ".": {
      "react-server": "./dist/server.mjs",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

bunchee supports the `react-server` condition, generating separate bundles with `"use server"` or `"use client"` directives preserved.

## Configuration

### Source File Convention
```
src/
  index.ts        -> maps to exports["."]
  utils.ts        -> maps to exports["./utils"]
  cli.ts          -> maps to bin entry
  components/
    index.ts      -> maps to exports["./components"]
```

bunchee uses the export name to find the corresponding source file under `src/`. The `"."` export maps to `src/index.ts`.

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

bunchee reads your `tsconfig.json` for TypeScript settings and automatically generates declaration files based on the `types` fields in your exports.

### External Dependencies
```json
{
  "dependencies": {
    "lodash-es": "^4.17.21"
  },
  "peerDependencies": {
    "react": ">=18"
  },
  "devDependencies": {
    "bunchee": "latest",
    "typescript": "^5.0.0"
  }
}
```

bunchee automatically externalizes `dependencies` and `peerDependencies`, only bundling `devDependencies` that are imported.

## Tips & Gotchas
- bunchee reads the `exports` field in `package.json` as its primary configuration — if your exports are wrong, the build output will be wrong.
- Source files must follow a naming convention matching the export paths: `exports["./foo"]` expects `src/foo.ts` or `src/foo/index.ts`.
- TypeScript declarations (`.d.ts`, `.d.mts`, `.d.cts`) are generated automatically when `types` paths are specified in your exports.
- The `bin` field is handled automatically — bunchee adds the shebang line and bundles the CLI entry point separately.
- Use `--watch` for development; bunchee watches all source files referenced by your exports and rebuilds on change.
- bunchee externalizes everything in `dependencies` and `peerDependencies` by default; import only `devDependencies` to have them bundled inline.
- For monorepos, ensure each package has its own `package.json` with correct `exports` — bunchee operates on a single package at a time.
- The `"type": "module"` field in `package.json` affects output extensions: with it, ESM uses `.js` and CJS uses `.cjs`; without it, ESM uses `.mjs` and CJS uses `.js`.
- bunchee supports CSS imports and will extract them into separate `.css` files alongside your JavaScript output.
- Use `typesVersions` in `package.json` for TypeScript path mapping when you have multiple sub-path exports, ensuring IDE autocompletion works correctly.
