---
name: "sass"
version: "1.97.3"
downloads: 98.2M/month
description: >
  A pure JavaScript implementation of Sass.. Use when: Behavioral Differences from Ruby Sass; Only the `"expanded"` and `"compressed"` values of [`outputStyle`] are; Dart Sass doesn't support the [`precision`] option. Dart Sass defaults to a. NOT for: JavaScript module bundling; HTML template generation.
---

# sass

## Overview
A pure JavaScript implementation of Sass.. A pure JavaScript implementation of [Sass][sass].

## Installation
```bash
npm install sass
```

## Core API / Usage
```js
const sass = require('sass');

const result = sass.compile(scssFilename);

// OR

// Note that `compileAsync()` is substantially slower than `compile()`.
const result = await sass.compileAsync(scssFilename);
```

```js
// Note that `compileAsync()` is substantially slower than `compile()`.
const result = await sass.compileAsync(scssFilename);
```

## Common Patterns
### Key Features

- **Behavioral Differences from Ruby Sass**
- **Only the `"expanded"` and `"compressed"` values of [`outputStyle`] are**
- **Dart Sass doesn't support the [`precision`] option. Dart Sass defaults to a**
- **Dart Sass doesn't support the [`sourceComments`] option. Source maps are the**

### Example

```js
// Note that `compileAsync()` is substantially slower than `compile()`.
const result = await sass.compileAsync(scssFilename);
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/sass) for configuration options and advanced settings.

## Tips & Gotchas
- Works in both Node.js and browser environments.
- Current version: 1.97.3. Check the changelog when upgrading across major versions.
