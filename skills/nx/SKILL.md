---
name: nx
description: >
  Smart monorepo build system with computation caching and task orchestration. Use when: managing large monorepos, needing affected-based CI, generating code with workspace generators, orchestrating complex task graphs. NOT for: single standalone packages, simple scripts, projects that need zero tooling overhead.
---

# nx

## Overview
Nx is a powerful build system and monorepo management tool that provides computation caching, task orchestration, dependency graph visualization, and code generation. It supports any language or framework and offers first-class plugins for React, Angular, Node.js, and more. Nx scales from single projects to enterprise monorepos with hundreds of packages.

## Installation
```bash
# Create a new Nx workspace
npx create-nx-workspace@latest my-org

# Add Nx to an existing monorepo
npx nx@latest init

# Install globally (optional)
npm install -g nx
```

## Core API / Commands

### Running Tasks
```bash
# Run a target on a specific project
npx nx build my-app
npx nx test my-lib
npx nx lint my-app

# Run a target on all projects
npx nx run-many -t build
npx nx run-many -t build test lint

# Run only affected projects (changed since main)
npx nx affected -t build
npx nx affected -t test --base=main --head=HEAD
```

### Project Graph
```bash
# Visualize the dependency graph in browser
npx nx graph

# Show what projects are affected by recent changes
npx nx affected:graph
```

## Common Patterns

### nx.json Configuration
```json
{
  "$schema": "https://nx.dev/reference/nx-json",
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "outputs": ["{projectRoot}/dist"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "cache": true
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"],
      "cache": true
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": ["default", "!{projectRoot}/**/*.spec.ts"],
    "sharedGlobals": ["{workspaceRoot}/tsconfig.base.json"]
  },
  "defaultBase": "main"
}
```

### project.json (per-project config)
```json
{
  "name": "my-app",
  "sourceRoot": "apps/my-app/src",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "options": {
        "outputPath": "dist/apps/my-app",
        "main": "apps/my-app/src/main.ts",
        "tsConfig": "apps/my-app/tsconfig.app.json"
      },
      "configurations": {
        "production": {
          "optimization": true,
          "sourceMap": false
        }
      }
    },
    "serve": {
      "executor": "@nx/webpack:dev-server",
      "options": {
        "buildTarget": "my-app:build"
      }
    }
  }
}
```

### Code Generation
```bash
# Generate a new library
npx nx generate @nx/js:library my-utils --directory=libs/my-utils

# Generate a React component
npx nx generate @nx/react:component Button --project=ui --directory=src/lib

# Generate a Node.js application
npx nx generate @nx/node:application my-api --directory=apps/my-api

# Dry run to preview changes
npx nx generate @nx/js:library my-lib --dry-run
```

## Configuration

### Remote Caching with Nx Cloud
```bash
# Connect to Nx Cloud
npx nx connect

# Or set in nx.json
# { "nxCloudAccessToken": "your-token" }

# Self-hosted runner
# { "tasksRunnerOptions": { "default": { "runner": "@nrwl/nx-cloud", "options": { "url": "https://my-nx-cloud.com" } } } }
```

### Fine-Grained Inputs
```json
{
  "targetDefaults": {
    "build": {
      "inputs": [
        "production",
        "^production",
        { "env": "NODE_ENV" },
        { "runtime": "node --version" },
        { "externalDependencies": ["webpack"] }
      ]
    }
  }
}
```

### Inferred Tasks (via Plugins)
```json
{
  "plugins": [
    {
      "plugin": "@nx/vite/plugin",
      "options": {
        "buildTargetName": "build",
        "serveTargetName": "dev"
      }
    },
    "@nx/eslint/plugin",
    "@nx/jest/plugin"
  ]
}
```

## Tips & Gotchas
- Use `nx affected` in CI instead of running all tasks — it analyzes the git diff and project dependency graph to skip unaffected projects.
- The `^` prefix in `dependsOn` means "upstream dependencies must run first" (topological ordering), same convention as Turborepo.
- `namedInputs` let you define reusable file sets; the `production` input typically excludes test files so test changes do not invalidate build caches.
- Run `npx nx graph` regularly to visualize and validate your dependency graph; circular dependencies are flagged automatically.
- Use `npx nx reset` to clear the local Nx cache if you encounter stale cache issues (`node_modules/.cache/nx`).
- For existing repos, `npx nx init` adds Nx incrementally without restructuring — you can adopt it gradually.
- The `project.json` file is optional if using inferred targets via plugins; Nx can detect targets from `package.json` scripts.
- `nx run-many -t build --parallel=3` controls parallelism; by default Nx uses the number of CPU cores.
- Use `nx migrate latest` to update Nx and all plugins together; it generates a `migrations.json` that automates breaking-change fixes.
- Module boundary rules via `@nx/enforce-module-boundaries` ESLint rule prevent unintended cross-project imports using tags.
