---
name: publint
description: >
  Lint npm package publishing errors before release. Use when: publishing npm packages, checking exports/types/main fields, ensuring package works for CJS and ESM consumers. NOT for: app code, internal packages.
---

# publint

> v0.3.18 — Lint packaging errors before publishing to npm

## Installation
```bash
npm install -D publint
```

## Usage

```bash
npx publint              # check current package
npx publint ./my-lib     # check specific dir
npx publint --strict     # stricter checks
```

## What It Checks

- `exports` field correctness (subpath exports, conditions)
- `main`, `module`, `types` fields pointing to correct files
- File extensions matching format (`.cjs` for CJS, `.mjs` for ESM)
- Missing type declarations (`.d.ts` files)
- Incorrect `type: "module"` usage
- Files referenced in `exports` but not included in `files`

## Common Errors Fixed

### Missing type declarations
```json
// ❌ Before
{ "exports": { ".": "./dist/index.js" } }

// ✅ After
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### Wrong extension for CJS
```json
// ❌ commonjs format but .js extension
{ "main": "./dist/index.js" }  // with "type": "module"

// ✅ correct
{ "main": "./dist/index.cjs" }
```

## Integration

```json
// package.json
{
  "scripts": {
    "prepublishOnly": "publint",
    "check": "publint && tsc --noEmit"
  }
}
```

## Tips & Gotchas
- Run `publint` before every `npm publish` — catches mistakes that break consumers
- Strict mode (`--strict`) catches advisory issues, not just errors
- Pairs well with `tsup` — both ensure your package is correctly built and typed
- Common package.json mistakes that publint catches: missing `files` field, wrong `main` extension
