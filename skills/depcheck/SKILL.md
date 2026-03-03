---
name: depcheck
description: >
  Detect unused/missing npm dependencies. Use when: cleaning up package.json, finding missing peer deps, auditing dependencies. NOT for: unused code/exports (use knip), security audits (use npm audit).
---

# depcheck

> v1.4.7 — Check dependencies in your Node module

## Installation
```bash
npm install -D depcheck
# or use without install:
npx depcheck
```

## Basic Usage

```bash
npx depcheck                   # check current directory
npx depcheck ./my-project      # check specific directory
npx depcheck --json            # JSON output
```

## Output

```
Unused dependencies
* lodash
* moment

Unused devDependencies
* @types/express

Missing dependencies
* chalk
* ora

Invalid files
* /src/utils.ts
```

## Configuration (.depcheckrc or package.json)

```json
// .depcheckrc
{
  "ignores": ["@types/*", "eslint-*"],
  "ignorePatterns": ["dist", "build"],
  "parsers": {
    "**/*.ts": "typescript"
  },
  "detectors": ["importDeclaration", "requireCallExpression"],
  "specials": ["bin", "eslint", "jest", "vite"]
}
```

## Common Patterns

### In package.json
```json
{
  "depcheck": {
    "ignores": ["husky", "lint-staged"],
    "ignorePatterns": [".next", "dist"]
  }
}
```

### CI check
```bash
npx depcheck --json | jq '.dependencies | length'
# fail if there are unused deps
npx depcheck && echo "All deps used" || echo "Unused deps found"
```

### Ignore false positives
```json
{
  "ignores": [
    "typescript",      // used by tsc but not imported
    "@types/*",        // type-only packages
    "eslint-*",        // eslint plugins referenced in config
    "babel-*"          // babel presets referenced in config
  ]
}
```

## Tips & Gotchas
- Many false positives for tool packages (ESLint plugins, Babel presets, PostCSS plugins) — add to `ignores`
- Dynamic `require()` and string-based plugin references aren't always detected
- For TypeScript projects, ensure `"parsers": { "**/*.ts": "typescript" }` is set
- Use `knip` for a more comprehensive analysis — finds unused exports too
- `--json` output is useful for scripting: `npx depcheck --json | jq '.dependencies'`
