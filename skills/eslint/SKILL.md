---
name: eslint
description: >
  JavaScript/TypeScript linter. Use when: enforcing code style, catching bugs statically, consistent team code. NOT for: formatting (use Prettier), runtime errors.
---

# eslint

## Installation
```bash
npm install -D eslint
npx eslint --init  # interactive setup
# or flat config:
npm install -D eslint @eslint/js typescript-eslint
```

## eslint.config.js (Flat Config — ESLint 9+)

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },
  { ignores: ['dist/**', 'node_modules/**'] }
);
```

## .eslintrc.json (Legacy Config)

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error"
  },
  "ignorePatterns": ["dist/", "*.js"]
}
```

## package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint src",
    "lint:fix": "eslint src --fix"
  }
}
```

## Common Rules

```js
// Code quality
'no-unused-vars': 'error'
'no-undef': 'error'
'no-console': 'warn'
'prefer-const': 'error'
'eqeqeq': ['error', 'always']

// TypeScript
'@typescript-eslint/no-explicit-any': 'warn'
'@typescript-eslint/no-non-null-assertion': 'warn'
'@typescript-eslint/consistent-type-imports': 'error'

// Disable rules
'no-shadow': 'off'  // use @typescript-eslint/no-shadow instead
```

## Tips & Gotchas
- ESLint 9 uses flat config (`eslint.config.js`) — legacy `.eslintrc` still works but deprecated
- Never use `// eslint-disable-next-line` extensively — fix the code instead
- `typescript-eslint` v6+ requires `parserOptions.projectService: true` for type-aware rules
- Use `eslint-config-prettier` to disable ESLint rules that conflict with Prettier
- Run with `--cache` flag in CI to speed up: `eslint src --cache`
