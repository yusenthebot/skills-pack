---
name: prettier
description: >
  Opinionated code formatter. Use when: consistent formatting across team, auto-format on save, eliminating style debates. NOT for: linting logic errors (use ESLint), custom formatting preferences beyond its options.
---

# prettier

## Installation
```bash
npm install -D prettier
echo {} > .prettierrc
```

## .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## package.json Scripts

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## .prettierignore

```
node_modules
dist
.next
coverage
*.min.js
```

## Common Patterns

### Format on save (VS Code)
```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }
}
```

### With Husky (format on commit)
```bash
npm install -D husky lint-staged
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,json,css,md}": ["prettier --write"]
  }
}
```

### With ESLint (disable conflicting rules)
```bash
npm install -D eslint-config-prettier
```
```js
// eslint.config.js
import prettier from 'eslint-config-prettier';
export default [...otherConfigs, prettier];
```

## Tips & Gotchas
- Prettier is intentionally opinionated — limited configuration by design
- `prettier --check` returns exit code 1 if any file needs formatting (use in CI)
- Use `// prettier-ignore` to skip a specific section
- Prettier handles: JS, TS, JSX, TSX, JSON, CSS, SCSS, HTML, Markdown, YAML
- Plugin for Tailwind CSS: `prettier-plugin-tailwindcss` auto-sorts class names
