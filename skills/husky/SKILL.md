---
name: husky
description: >
  Git hooks made easy. Use when: running lint/tests before commits, enforcing commit message format, pre-push checks. NOT for: CI/CD (use GitHub Actions), non-git projects.
---

# husky

## Installation
```bash
npm install -D husky
npx husky init  # creates .husky/ and sets up package.json prepare script
```

## Setup

```bash
# After npx husky init:
# .husky/pre-commit is created automatically
# package.json gets: "prepare": "husky"

# Install hooks
npm install  # runs prepare → husky
```

## Common Hooks

### pre-commit (lint + format)
```bash
# .husky/pre-commit
npm run lint
npm run format:check
```

### pre-commit with lint-staged (only changed files)
```bash
# .husky/pre-commit
npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### commit-msg (enforce conventional commits)
```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

### pre-push (run tests)
```bash
# .husky/pre-push
npm test
```

## Skip Hooks

```bash
git commit --no-verify -m "emergency fix"
git push --no-verify

# Or set env var
HUSKY=0 git commit -m "skip hooks"
```

## Tips & Gotchas
- Husky v9 requires `"prepare": "husky"` in package.json — `npx husky init` adds this automatically
- Hooks must be executable: `chmod +x .husky/pre-commit`
- In CI, `HUSKY=0` to skip hooks (or set `CI=true` which husky respects)
- Always use `lint-staged` with `pre-commit` — running lint on all files is slow
- Hooks are stored in `.husky/` directory and should be committed to git
