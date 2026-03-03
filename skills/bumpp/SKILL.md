---
name: bumpp
description: >
  Interactive version bumper for npm packages. Use when: bumping package.json version, creating git tags, preparing releases interactively or in CI. NOT for: changelog generation (use changelogen), full release automation (use release-it).
---

# bumpp

## Overview
bumpp is an interactive CLI tool for bumping the version of your npm package. It prompts you to select the version increment (major, minor, patch, or custom), updates `package.json`, creates a git commit and tag, and optionally pushes to the remote. It is a maintained fork of `version-bump-prompt` with additional features like pre-release support.

## Installation
```bash
npm install -D bumpp
yarn add -D bumpp
pnpm add -D bumpp

# Or use directly with npx
npx bumpp
```

## Core API / Commands

### Interactive Mode (default)
```bash
# Opens interactive prompt to select version
npx bumpp

# Output:
# ? Current version: 1.2.3
# ? Select version:
#   major (2.0.0)
#   minor (1.3.0)
#   patch (1.2.4)
#   pre-release (1.2.4-beta.0)
#   custom
```

### Explicit Version Bumps
```bash
# Bump patch: 1.2.3 → 1.2.4
npx bumpp patch

# Bump minor: 1.2.3 → 1.3.0
npx bumpp minor

# Bump major: 1.2.3 → 2.0.0
npx bumpp major

# Set exact version
npx bumpp 3.0.0-beta.1

# Pre-release versions
npx bumpp prepatch    # 1.2.3 → 1.2.4-beta.0
npx bumpp preminor    # 1.2.3 → 1.3.0-beta.0
npx bumpp premajor    # 1.2.3 → 2.0.0-beta.0
npx bumpp prerelease  # 1.2.4-beta.0 → 1.2.4-beta.1
```

### CI Mode (non-interactive)
```bash
# Skip prompts, auto-confirm
npx bumpp patch --yes

# Skip prompts with all options
npx bumpp minor --yes --tag --commit "release: v%s" --push

# No git operations (just update files)
npx bumpp patch --yes --no-tag --no-commit --no-push
```

## Common Patterns

### Package.json Scripts
```json
{
  "scripts": {
    "release": "bumpp",
    "release:patch": "bumpp patch --yes",
    "release:minor": "bumpp minor --yes",
    "release:major": "bumpp major --yes",
    "release:beta": "bumpp prerelease --preid beta --yes"
  }
}
```

### Combined with Changelogen
```json
{
  "scripts": {
    "release": "changelogen --release && bumpp --yes --no-commit --no-tag && git add -A && git commit -m 'chore: release' && git tag v$(node -p \"require('./package.json').version\") && git push --follow-tags"
  }
}
```

A simpler approach:
```json
{
  "scripts": {
    "release": "bumpp && npm publish"
  }
}
```

### Monorepo Version Sync
```bash
# Bump version in multiple package.json files
npx bumpp patch --yes \
  --files package.json \
  --files packages/core/package.json \
  --files packages/cli/package.json
```

### Pre-release Workflow
```bash
# Start a beta cycle
npx bumpp premajor --preid beta
# 1.2.3 → 2.0.0-beta.0

# Iterate on beta
npx bumpp prerelease
# 2.0.0-beta.0 → 2.0.0-beta.1

npx bumpp prerelease
# 2.0.0-beta.1 → 2.0.0-beta.2

# Graduate to stable
npx bumpp major
# 2.0.0-beta.2 → 2.0.0
```

## Configuration

### CLI Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--yes` / `-y` | `false` | Skip confirmation prompt |
| `--tag` | `true` | Create git tag |
| `--commit` | `"release: v%s"` | Commit message (`%s` = version) |
| `--push` | `true` | Push commit and tag to remote |
| `--no-tag` | — | Skip git tag |
| `--no-commit` | — | Skip git commit |
| `--no-push` | — | Skip git push |
| `--preid` | `"beta"` | Pre-release identifier |
| `--files` | `["package.json"]` | Files to update version in |
| `--recursive` | `false` | Update all package.json files |
| `--execute` | — | Run command after bump (e.g., `npm run build`) |

### Configuration in `package.json`
```json
{
  "bumpp": {
    "commit": "release: v%s",
    "tag": true,
    "push": true,
    "files": ["package.json"],
    "execute": "npm run build"
  }
}
```

## Tips & Gotchas

- **bumpp updates `package.json` version field** and optionally `package-lock.json`. It does not update version references in source code files.
- **Use `--yes` in CI/CD pipelines** to skip the interactive prompt. Without it, bumpp waits for user input and will hang in automated environments.
- **The default commit message template is `"release: v%s"`** where `%s` is replaced with the new version. Customize with `--commit "chore(release): %s"`.
- **`--execute` runs a command after version bump** but before git commit. Useful for rebuilding or regenerating files that include the version.
- **Pre-release identifiers** default to `beta`. Use `--preid alpha`, `--preid rc`, etc. for different pre-release stages.
- **bumpp does not generate changelogs**. Pair it with `changelogen` or `conventional-changelog` for changelog generation.
- **The `--files` flag accepts multiple values** for monorepo setups where you need to sync versions across multiple `package.json` files.
- **bumpp creates annotated git tags** (not lightweight tags), which include the tagger info and timestamp.
