---
name: knip
description: >
  Find unused dependencies, exports, and files. Use when: codebase cleanup, removing dead code, auditing what can be deleted. NOT for: runtime checks, security audits.
---

# knip

> v5.85.0 — Find and fix unused dependencies, exports and files

## Installation
```bash
npm install -D knip
```

## Basic Usage

```bash
npx knip                    # find all unused things
npx knip --fix              # auto-remove unused exports (careful!)
npx knip --reporter compact # condensed output
```

## What It Finds

- **Unused files** — TypeScript/JS files not imported anywhere
- **Unused dependencies** — packages in `package.json` never imported
- **Unused devDependencies** — dev packages not referenced in config/scripts
- **Unused exports** — exported values never used outside the file
- **Unused types** — exported types never referenced

## knip.json Configuration

```json
{
  "entry": ["src/index.ts", "src/cli.ts"],
  "project": ["src/**/*.ts"],
  "ignore": ["src/generated/**"],
  "ignoreDependencies": ["@types/node"],
  "ignoreExportsUsedInFile": true
}
```

## Common Patterns

### Check before releasing
```json
// package.json
{
  "scripts": {
    "knip": "knip",
    "prerelease": "knip"
  }
}
```

### In CI
```bash
npx knip --reporter json > knip-report.json
npx knip --no-exit-code  # don't fail CI, just report
```

### Monorepo
```json
{
  "workspaces": {
    "packages/*": {}
  }
}
```

### Ignore specific exports
```ts
// Mark as used externally — knip respects JSDoc
/** @public */
export function myExport() {}
```

## Output Example

```
Unused files (2)
  src/old-feature.ts
  src/unused-helper.ts

Unused dependencies (1)
  lodash

Unused exports (3)
  src/utils.ts: formatDate, parseDate
  src/api.ts: legacyEndpoint
```

## Tips & Gotchas
- Run `knip` before major cleanups — often finds 20-30% dead code
- Some false positives with dynamic imports and plugin systems — use `ignore` config
- `--fix` only removes export keywords, not entire files — manual deletion still needed
- Knip understands 50+ frameworks/tools out of the box (Next.js, Vite, Jest, etc.)
- For monorepos, cross-package exports are correctly tracked
