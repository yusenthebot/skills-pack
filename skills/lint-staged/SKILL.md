---
name: lint-staged
description: >
  Run linters and formatters on Git staged files only. Use when: linting/formatting only changed files in pre-commit hooks, speeding up pre-commit checks. NOT for: full project linting, CI checks on all files.
---

# lint-staged

## Overview
lint-staged runs configured commands against files that are staged in Git (`git add`). This dramatically speeds up pre-commit hooks by only processing changed files instead of the entire codebase. It is typically used together with husky to run ESLint, Prettier, and other tools before each commit.

## Installation
```bash
npm install -D lint-staged
yarn add -D lint-staged
pnpm add -D lint-staged
```

## Core API / Commands

### CLI Usage
```bash
# Run lint-staged (usually called from a husky hook)
npx lint-staged

# Verbose output for debugging
npx lint-staged --verbose

# Dry run (show what would be executed)
npx lint-staged --debug

# Run with specific config file
npx lint-staged --config path/to/.lintstagedrc.js

# Allow empty commits (when all staged changes are auto-fixed away)
npx lint-staged --allow-empty

# Quiet mode (suppress output)
npx lint-staged --quiet
```

## Common Patterns

### Basic Setup with Husky
```bash
# Install and configure
npm install -D husky lint-staged
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

### package.json Configuration
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml,css}": "prettier --write",
    "*.py": "black"
  }
}
```

### Standalone Config File (`.lintstagedrc.js`)
```js
// .lintstagedrc.js (ESM)
export default {
  "*.{ts,tsx}": (filenames) => [
    `eslint --fix ${filenames.join(" ")}`,
    `prettier --write ${filenames.join(" ")}`,
  ],
  "*.css": "prettier --write",
  "*.md": "prettier --write",
};
```

### Function-Based Config (Advanced)
```js
// lint-staged.config.js
export default {
  // Run tsc on the whole project when any TS file changes
  // (tsc doesn't accept file arguments)
  "*.ts": () => "tsc --noEmit",

  // ESLint only on changed files
  "*.{ts,tsx}": (filenames) =>
    `eslint --fix ${filenames.map((f) => `"${f}"`).join(" ")}`,

  // Run tests related to changed files
  "*.{ts,tsx}": (filenames) =>
    `vitest related --run ${filenames.join(" ")}`,
};
```

### Monorepo Configuration
```json
{
  "lint-staged": {
    "packages/*/src/**/*.ts": [
      "eslint --fix",
      "prettier --write"
    ],
    "apps/*/src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Configuration

### Config File Formats
- `"lint-staged"` key in `package.json`
- `.lintstagedrc` (JSON or YAML)
- `.lintstagedrc.json`
- `.lintstagedrc.yaml` / `.lintstagedrc.yml`
- `.lintstagedrc.js` / `lint-staged.config.js` (ESM or CJS)
- `.lintstagedrc.mjs` / `lint-staged.config.mjs`

### Glob Pattern Matching
| Pattern | Matches |
|---------|---------|
| `*.ts` | TS files in any directory |
| `src/**/*.ts` | TS files under `src/` recursively |
| `*.{ts,tsx}` | Both `.ts` and `.tsx` files |
| `!*.generated.ts` | Exclude generated files |
| `packages/*/src/**/*.ts` | TS files in any package's `src/` |

### Command Behavior
- **String command**: lint-staged appends matched file paths as arguments.
- **Array of commands**: commands run sequentially; if one fails, the rest are skipped.
- **Function**: receives the array of matched filenames; must return a command string or array.

## Tips & Gotchas

- **Commands receive file paths as arguments automatically** unless you use a function config. `"eslint --fix"` becomes `eslint --fix file1.ts file2.ts`.
- **Use a function when the tool does not accept file arguments**. For example, `tsc --noEmit` checks the whole project: `"*.ts": () => "tsc --noEmit"`.
- **Multiple commands in an array run sequentially**. If ESLint fails, Prettier will not run. Put the stricter check first.
- **lint-staged auto-stages fixed files back to the index**. After `eslint --fix` or `prettier --write` modifies a file, the changes are automatically re-staged.
- **Partially staged files are handled correctly**. lint-staged stashes unstaged changes, runs commands on staged content, then restores stashed changes.
- **Use `--allow-empty` if auto-fixes might remove all changes**. Without it, Git will refuse to create an empty commit after all staged files are fixed.
- **Glob patterns match against the repo root**, not the current directory. Use `src/**/*.ts` to match files in the `src` directory.
- **Avoid running `prettier --check` in lint-staged** — use `prettier --write` instead so it auto-fixes. The check variant will just fail without fixing.
- **For large repos, lint-staged is much faster than linting everything**. Running ESLint on 5 changed files vs 500 project files makes a significant difference.
- **`--concurrent` flag (default true)** runs tasks for different glob patterns in parallel. Set `--no-concurrent` if tasks conflict with each other.
