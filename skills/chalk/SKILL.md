---
name: "chalk"
version: "5.6.2"
downloads: 1.7B/month
description: >
  Terminal string styling done right. Use when: Highly performant; Ability to nest styles; 256/Truecolor color support. NOT for: web browser UI rendering; server-side HTML generation.
---

# chalk

## Overview
Terminal string styling done right. A popular CLI package for Node.js with 1.7B monthly downloads.

## Installation
```bash
npm install chalk
```

## Core API / Usage
```js
// Combine styled and normal strings
log(chalk.blue('Hello') + ' World' + chalk.red('!'));
```

```js
// Compose multiple styles using the chainable API
log(chalk.blue.bgRed.bold('Hello world!'));
```

## Common Patterns
### Pattern 1

```js
// Pass in multiple arguments
log(chalk.blue('Hello', 'World!', 'Foo', 'bar', 'biz', 'baz'));
```

### Pattern 2

```js
// Nest styles
log(chalk.red('Hello', chalk.underline.bgBlue('world') + '!'));
```

### Pattern 3

```js
// Nest styles of the same type even (color, underline, background)
log(chalk.green(
	'I am a green line ' +
	chalk.blue.underline.bold('with a blue substring') +
	' that becomes green again!'
));
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/chalk) for configuration options and advanced settings.

## Tips & Gotchas
- Includes built-in TypeScript type definitions.
- Current version: 5.6.2. Check the changelog when upgrading across major versions.
