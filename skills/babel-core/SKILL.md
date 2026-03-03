---
name: "babel-core"
version: "6.26.3"
downloads: 29.2M/month
description: >
  Babel compiler core.. Use when: bundling and transpiling source code; development server with HMR; production builds. NOT for: runtime application logic; package management (use npm/yarn).
---

# babel-core

## Overview
Babel compiler core.. # babel-core > Babel compiler core. A popular build tool package for Node.js with 29.2M monthly downloads.

## Installation
```bash
npm install babel-core
```

## Core API / Usage
```js
var babel = require("babel-core");
import { transform } from 'babel-core';
import * as babel from 'babel-core';
```

```js
babel.transform(code, options) // => { code, map, ast }
```

## Common Patterns
### Pattern 1

```js
var result = babel.transform("code();", options);
result.code;
result.map;
result.ast;
```

### Pattern 2

```js
babel.transformFile(filename, options, callback)
```

### Pattern 3

```js
babel.transformFile("filename.js", options, function (err, result) {
  result; // => { code, map, ast }
});
```

## Configuration
```js
babel.transform(code, options) // => { code, map, ast }
```

## Tips & Gotchas
- Current version: 6.26.3. Check the changelog when upgrading across major versions.
- Refer to the official npm page for edge cases and advanced configuration.
