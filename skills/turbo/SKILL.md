---
name: turbo
description: >
  High-performance monorepo build system with intelligent caching. Use when: managing monorepos, orchestrating multi-package builds, caching CI/CD tasks, running parallel scripts across packages. NOT for: single-package projects, application bundling, replacing npm/pnpm workspaces (it complements them).
---

# turbo

## Overview
Turborepo is a high-performance build system for JavaScript and TypeScript monorepos. It provides intelligent task scheduling with dependency awareness, local and remote caching to avoid redundant work, and parallel task execution. Turborepo integrates seamlessly with npm, pnpm, and yarn workspaces, typically cutting CI build times by 40-80% through its caching layer.

## Installation
```bash
# Global install
npm install turbo --global

# Per-project install (recommended)
npm install turbo --save-dev

# Initialize in an existing monorepo
npx turbo init
```

## Core API / Commands

### Running Tasks
```bash
# Run the "build" task in all packages
npx turbo run build

# Run build and test
npx turbo run build test

# Run only in specific packages
npx turbo run build --filter=@myorg/web
npx turbo run build --filter=@myorg/ui...  # ui and its dependents

# Dry run to see what would execute
npx turbo run build --dry-run
```

### turbo.json Configuration
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "env": ["NODE_ENV"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": [],
      "env": ["CI"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Common Patterns

### Task Dependencies
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "deploy": {
      "dependsOn": ["build", "test", "lint"]
    }
  }
}
```
- `^build` means "run `build` in all dependency packages first" (topological).
- `build` without `^` means "run `build` in the same package first".

### Filtering Packages
```bash
# By package name
npx turbo run build --filter=@myorg/web

# By directory
npx turbo run build --filter=./apps/*

# Include dependencies
npx turbo run build --filter=...@myorg/web

# Include dependents
npx turbo run build --filter=@myorg/ui...

# Since a git ref
npx turbo run build --filter=[HEAD^1]

# Combine filters
npx turbo run build --filter=@myorg/web...  --filter=!@myorg/docs
```

### Remote Caching
```bash
# Login to Vercel for remote caching
npx turbo login

# Link your repo
npx turbo link

# Or self-host with environment variables
# TURBO_TEAM=my-team
# TURBO_TOKEN=my-token
# TURBO_API=https://my-cache-server.com
```

## Configuration

### Environment Variable Inputs
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "env": ["API_URL", "DATABASE_URL"],
      "passThroughEnv": ["npm_lifecycle_event"]
    }
  },
  "globalEnv": ["CI", "VERCEL"],
  "globalPassThroughEnv": ["HOME", "PATH"]
}
```

### Package-Specific Configuration
```json
// packages/web/turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
}
```

### Pruning for Docker
```bash
# Generate a sparse monorepo with only the packages needed for "web"
npx turbo prune @myorg/web --docker

# Produces:
# out/
#   json/       -> package.json files only (for install layer caching)
#   full/       -> full source for the pruned workspace
#   json/pnpm-lock.yaml (or yarn.lock / package-lock.json)
```

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY out/json/ .
RUN npm install
COPY out/full/ .
RUN npx turbo run build --filter=@myorg/web
```

## Tips & Gotchas
- The `^` prefix in `dependsOn` is critical: `"^build"` means upstream dependencies, while `"build"` means the same package. Mixing these up breaks topological ordering.
- Always list `outputs` for cacheable tasks; if you omit `outputs`, Turbo caches the task's exit code but cannot restore output files from cache.
- Set `"cache": false` for long-running dev tasks and `"persistent": true` for tasks that do not exit (like `dev` servers).
- Turbo hashes inputs (source files, env vars, dependency versions) to create cache keys; changing any input invalidates the cache.
- Use `--filter` extensively in CI to only run tasks for changed packages: `--filter=[origin/main...HEAD]`.
- The `env` field in tasks is important — if a build depends on `API_URL`, list it so cache invalidation works correctly when it changes.
- Turbo respects `packageManager` in root `package.json` to determine which package manager commands to use.
- Use `npx turbo run build --summarize` to generate a run summary JSON file for debugging cache behavior.
- Remote caching shares build artifacts across team members and CI — this is the single biggest performance win for most teams.
