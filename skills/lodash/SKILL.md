---
name: "lodash"
version: "4.17.23"
downloads: 459.2M/month
description: >
  Lodash modular utilities.. Use when: common data transformations; reducing boilerplate code; functional programming helpers. NOT for: complex domain-specific business logic; replacing well-supported native APIs.
---

# lodash

## Overview
Lodash modular utilities.. # lodash v4.17.23 The Lodash library exported as Node.js modules.

## Installation
```bash
npm install lodash
```

## Core API / Usage
```js
$ npm i -g npm
$ npm i --save lodash
```

```js
// Load the full build.
var _ = require('lodash');
// Load the core build.
var _ = require('lodash/core');
// Load the FP build for immutable auto-curried iteratee-first data-last methods.
var fp = require('lodash/fp');

// Load method categories.
var array = require('lodash/array');
var object = require('lodash/fp/object');

// Cherry-pick methods for smaller browserify/rollup/webpack bundles.
var at = require('lodash/at');
var curryN = require('lodash/fp/curryN');
```

## Common Patterns
Refer to the [official documentation](https://github.com/lodash/lodash) for common patterns, recipes, and advanced usage examples.

```js
// Load the full build.
var _ = require('lodash');
// Load the core build.
var _ = require('lodash/core');
// Load the FP build for immutable auto-curried iteratee-first data-last methods.
var fp = require('lodash/fp');

// Load method categories.
var array = require('lodash/array');
var object = require('lodash/fp/object');

// Cherry-pick methods for smaller browserify/rollup/webpack bundles.
var at = require('lodash/at');
var curryN = require('lodash/fp/curryN');
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/lodash) for configuration options and advanced settings.

## Tips & Gotchas
- Works in both Node.js and browser environments.
- Current version: 4.17.23. Check the changelog when upgrading across major versions.
