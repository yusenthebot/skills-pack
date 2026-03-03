---
name: "prettier"
version: "3.8.1"
downloads: 305.4M/month
description: >
  Prettier is an opinionated code formatter. Use when: enforcing code style consistency; auto-fixing code format issues; CI/CD code quality checks. NOT for: runtime data validation; security scanning.
---

# prettier

## Overview
Prettier is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary.

## Installation
```bash
npm install prettier
```

## Core API / Usage
```js
foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());
```

```js
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  IShouldRefactorThis(),
  isThereSeriouslyAnotherOne(),
);
```

## Common Patterns
Refer to the [official documentation](https://github.com/prettier/prettier) for common patterns, recipes, and advanced usage examples.

```js
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  IShouldRefactorThis(),
  isThereSeriouslyAnotherOne(),
);
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/prettier) for configuration options and advanced settings.

## Tips & Gotchas
- Includes built-in TypeScript type definitions.
- Current version: 3.8.1. Check the changelog when upgrading across major versions.
