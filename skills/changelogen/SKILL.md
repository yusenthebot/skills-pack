---
name: changelogen
description: >
  Changelog generator based on conventional commits. Use when: generating CHANGELOG.md from git history, preparing releases, automating version bumps. NOT for: complex release workflows (use release-it), non-conventional commit histories.
---

# changelogen

## Overview
Changelogen generates beautiful changelogs from Git history using conventional commit messages. Built by the unjs ecosystem, it parses commits following the conventional commits specification (e.g., `feat:`, `fix:`, `chore:`) and produces a structured CHANGELOG.md. It can also bump versions and create GitHub releases.

## Installation
```bash
npm install -D changelogen
yarn add -D changelogen
pnpm add -D changelogen

# Or use directly with npx (no install needed)
npx changelogen
```

## Core API / Commands

### CLI Usage
```bash
# Generate changelog and print to stdout
npx changelogen

# Write to CHANGELOG.md
npx changelogen --output CHANGELOG.md

# Bump version in package.json based on commits
npx changelogen --bump

# Bump + write changelog + commit + tag
npx changelogen --release

# Specify version range
npx changelogen --from v1.0.0 --to v2.0.0

# Dry run (show what would happen)
npx changelogen --dry

# Push after release
npx changelogen --release --push

# Include all commits (not just since last tag)
npx changelogen --from ""
```

### Programmatic API
```ts
import {
  generateMarkDown,
  parseCommits,
  getGitDiff,
  loadChangelogConfig,
  bumpVersion,
} from "changelogen";

// Generate changelog markdown
const config = await loadChangelogConfig(process.cwd());
const rawCommits = await getGitDiff(config.from, config.to);
const commits = parseCommits(rawCommits, config);
const markdown = await generateMarkDown(commits, config);
console.log(markdown);
```

## Common Patterns

### Basic Release Workflow
```bash
# 1. Ensure all changes use conventional commits
git log --oneline

# 2. Generate changelog, bump version, commit, and tag
npx changelogen --release

# 3. Push with tags
git push --follow-tags

# 4. Publish to npm
npm publish
```

### Package.json Scripts
```json
{
  "scripts": {
    "changelog": "changelogen --output CHANGELOG.md",
    "release": "changelogen --release --push",
    "release:dry": "changelogen --release --dry"
  }
}
```

### Conventional Commit Format
```bash
# Features (minor version bump)
git commit -m "feat: add user authentication"
git commit -m "feat(api): add rate limiting endpoint"

# Bug fixes (patch version bump)
git commit -m "fix: resolve memory leak in connection pool"
git commit -m "fix(auth): handle expired token refresh"

# Breaking changes (major version bump)
git commit -m "feat!: redesign API response format"
git commit -m "feat: change default export\n\nBREAKING CHANGE: default export is now named"

# Other types (no version bump, included in changelog)
git commit -m "perf: optimize database queries"
git commit -m "docs: update API documentation"
git commit -m "chore: update dependencies"
git commit -m "refactor: simplify error handling"
```

## Configuration

### `changelog.config.ts` / `.changelogenrc`
```ts
// changelog.config.ts
export default {
  // Commit types to include in changelog
  types: {
    feat: { title: "Features", semver: "minor" },
    fix: { title: "Bug Fixes", semver: "patch" },
    perf: { title: "Performance", semver: "patch" },
    refactor: { title: "Refactors" },
    docs: { title: "Documentation" },
    chore: { title: "Chores" },
    test: { title: "Tests" },
    build: { title: "Build" },
    ci: { title: "CI" },
  },

  // Output file
  output: "CHANGELOG.md",

  // Repository info for commit links
  repo: {
    provider: "github",
    repo: "owner/repo-name",
    domain: "github.com",
  },

  // Scopes to include/exclude
  excludeAuthors: ["dependabot[bot]"],

  // Version bump configuration
  bump: {
    // Files to update version in
    files: ["package.json", "packages/*/package.json"],
  },
};
```

### `.changelogenrc` (JSON format)
```json
{
  "output": "CHANGELOG.md",
  "types": {
    "feat": { "title": "Features", "semver": "minor" },
    "fix": { "title": "Bug Fixes", "semver": "patch" },
    "perf": { "title": "Performance", "semver": "patch" }
  }
}
```

## Tips & Gotchas

- **Changelogen requires conventional commit messages** (e.g., `feat:`, `fix:`, `chore:`). Non-conventional commits will be ignored or grouped under "Other Changes".
- **Use `--release` for the full workflow**: it bumps the version, writes the changelog, creates a git commit, and tags the release in one command.
- **The `--from` flag defaults to the last git tag**. If there are no tags, use `--from ""` to include all commits.
- **Breaking changes** are detected from `feat!:` / `fix!:` syntax or `BREAKING CHANGE:` in the commit body. They trigger a major version bump.
- **Changelogen is from the unjs ecosystem** (same team behind Nuxt, Nitro, etc.) and is designed for simplicity. For more complex release workflows with npm publishing and GitHub releases, consider `release-it`.
- **GitHub release integration**: use `npx changelogen --release` with the `repo` config to automatically generate GitHub release URLs.
- **Scoped commits** (`feat(scope): message`) are grouped by scope in the changelog for better readability.
- **Use `--dry` to preview changes** before running a release. This shows the version bump and changelog without modifying any files.
