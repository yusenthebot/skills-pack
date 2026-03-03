---
name: release-it
description: >
  Automate versioning and package publishing. Use when: releasing npm packages, creating GitHub releases, generating changelogs, automating the full release pipeline. NOT for: simple version bumps only (use bumpp), changelog-only generation (use changelogen).
---

# release-it

## Overview
release-it automates the tedious tasks of software releases: bumping version, creating git tags, pushing to remote, publishing to npm, and creating GitHub releases. It supports plugins for changelog generation, conventional commits, and custom hooks. It works for both single packages and monorepos.

## Installation
```bash
npm install -D release-it
yarn add -D release-it
pnpm add -D release-it

# With conventional changelog plugin
npm install -D release-it @release-it/conventional-changelog
```

## Core API / Commands

### CLI Usage
```bash
# Interactive release (prompts for version)
npx release-it

# Specific version increment
npx release-it minor
npx release-it major
npx release-it 2.0.0-beta.1

# Pre-release
npx release-it --preRelease=beta
# 1.2.3 → 1.2.4-beta.0

npx release-it --preRelease
# 1.2.4-beta.0 → 1.2.4-beta.1

# Dry run (preview what would happen)
npx release-it --dry-run

# Non-interactive (CI mode)
npx release-it --ci

# Skip specific steps
npx release-it --no-npm.publish
npx release-it --no-github.release
npx release-it --no-git.push

# Only npm publish (no git operations)
npx release-it --npm.publish --no-git.tag --no-git.push --no-github.release
```

## Common Patterns

### `.release-it.json` Configuration
```json
{
  "git": {
    "commitMessage": "chore: release v${version}",
    "tagName": "v${version}",
    "tagAnnotation": "Release v${version}",
    "push": true,
    "requireCleanWorkingDir": true,
    "requireBranch": "main",
    "requireUpstream": true
  },
  "npm": {
    "publish": true,
    "publishPath": ".",
    "publishArgs": ["--access public"]
  },
  "github": {
    "release": true,
    "releaseName": "v${version}",
    "autoGenerate": true,
    "draft": false,
    "preRelease": false
  },
  "hooks": {
    "before:init": ["npm run lint", "npm test"],
    "after:bump": "npm run build",
    "after:release": "echo Successfully released v${version}"
  }
}
```

### With Conventional Changelog Plugin
```bash
npm install -D @release-it/conventional-changelog
```
```json
{
  "plugins": {
    "@release-it/conventional-changelog": {
      "preset": {
        "name": "conventionalcommits",
        "types": [
          { "type": "feat", "section": "Features" },
          { "type": "fix", "section": "Bug Fixes" },
          { "type": "perf", "section": "Performance" },
          { "type": "revert", "section": "Reverts" }
        ]
      },
      "infile": "CHANGELOG.md"
    }
  },
  "git": {
    "commitMessage": "chore: release v${version}"
  },
  "github": {
    "release": true,
    "autoGenerate": true
  }
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "release": "release-it",
    "release:dry": "release-it --dry-run",
    "release:ci": "release-it --ci",
    "release:beta": "release-it --preRelease=beta",
    "release:patch": "release-it patch --ci",
    "release:minor": "release-it minor --ci"
  }
}
```

### CI/CD Release (GitHub Actions)
```yaml
# .github/workflows/release.yml
name: Release
on:
  workflow_dispatch:
    inputs:
      version:
        description: "Version increment (patch, minor, major)"
        required: true
        default: "patch"

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: "https://registry.npmjs.org"
      - run: npm ci
      - run: npm test
      - run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
      - run: npx release-it ${{ github.event.inputs.version }} --ci
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Configuration

### Config File Formats
- `.release-it.json`
- `.release-it.js` / `release-it.config.js`
- `.release-it.ts` / `release-it.config.ts`
- `.release-it.yaml` / `.release-it.yml`
- `"release-it"` key in `package.json`

### Hook Lifecycle
```
before:init → before:bump → bump → after:bump → before:release →
  before:git → git → after:git →
  before:github → github → after:github →
  before:npm → npm → after:npm →
after:release
```

### Key Configuration Options

| Section | Option | Default | Description |
|---------|--------|---------|-------------|
| `git` | `commitMessage` | `"Release ${version}"` | Git commit message template |
| `git` | `tagName` | `"${version}"` | Tag name template |
| `git` | `requireBranch` | — | Only allow release from this branch |
| `git` | `requireCleanWorkingDir` | `true` | Abort if uncommitted changes |
| `npm` | `publish` | `true` | Publish to npm registry |
| `npm` | `publishArgs` | `[]` | Extra args to `npm publish` |
| `github` | `release` | `false` | Create GitHub release |
| `github` | `autoGenerate` | `false` | Auto-generate release notes |
| `github` | `draft` | `false` | Create as draft release |

## Tips & Gotchas

- **`--dry-run` is essential**: always preview a release first. It shows every step that would be executed without making any changes.
- **Set `GITHUB_TOKEN` for GitHub releases**: release-it needs a token with `repo` scope. In GitHub Actions, `secrets.GITHUB_TOKEN` works automatically.
- **`requireBranch: "main"` prevents accidental releases** from feature branches. Highly recommended for production packages.
- **Hooks run shell commands at specific lifecycle points**. Use `before:init` for validation (lint, test), `after:bump` for building, and `after:release` for notifications.
- **The `--ci` flag skips all prompts** and uses default answers. Required for automated pipelines.
- **Pre-release workflow**: use `--preRelease=beta` for beta versions, then `npx release-it` (without `--preRelease`) to graduate to stable.
- **`npm.publishArgs: ["--access public"]`** is required for scoped packages (`@org/pkg`) to publish publicly.
- **release-it supports plugins** for extending functionality. The `@release-it/conventional-changelog` plugin is the most common, handling both changelog generation and version determination from commit history.
- **Use `--no-npm.publish` when releasing non-npm packages** (e.g., CLIs distributed via GitHub releases only).
