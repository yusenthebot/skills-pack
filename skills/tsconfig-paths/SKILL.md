---
name: "tsconfig-paths"
version: "4.2.0"
downloads: 263.5M/month
description: >
  Load node modules according to tsconfig paths, in run-time or via API.. Use when: `-P, --project [path]` Path to TypeScript JSON project file (`TS_NODE_PROJECT`); createMatchPath / createMatchPathAsync; matchFromAbsolutePaths / [matchFromAbsolutePathsAsync](#matchFr. NOT for: database replacement; network storage without proper SDKs.
---

# tsconfig-paths

## Overview
Load node modules according to tsconfig paths, in run-time or via API.. Both loading at run-time and via API are supported.

## Installation
```bash
npm install tsconfig-paths
```

## Core API / Usage
```bash
yarn add --dev tsconfig-paths
```

```bash
npm install --save-dev tsconfig-paths
```

## Common Patterns
### Pattern 1

```js
mocha -r ts-node/register -r tsconfig-paths/register "test/**/*.ts"
```

### Pattern 2

```js
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Functions",
      "request": "launch",
      "type": "node",
      "runtimeArgs": [
        "-r",
        "${workspaceFolder}/functions/node_modules/ts-node/register",
        "-r",
        "${workspaceFolder}/functions/node_modules/tsconfig-paths/register"
      ],
      "args": ["${workspaceFolder}/functions/src/index.ts"],
      "cwd": "${workspaceFolder}",
      "protocol": "inspector",
      "env": {
        "NODE_ENV": "development",
        "TS_NODE_PROJECT": "${workspaceFolder}/functions/tsconfig.json"
      },
      "outFiles": ["${workspaceFolder}/functions/lib/**/*.js"]
    }
  ]
}
```

### Pattern 3

```js
const tsConfig = require("./tsconfig.json");
const tsConfigPaths = require("tsconfig-paths");

const baseUrl = "./"; // Either absolute or relative path. If relative it's resolved to current working directory.
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});

// When path registration is no longer needed
cleanup();
```

## Configuration
```bash
yarn add --dev tsconfig-paths
```

## Tips & Gotchas
- Includes built-in TypeScript type definitions.
- Current version: 4.2.0. Check the changelog when upgrading across major versions.
