# skills-pack

[![npm version](https://img.shields.io/npm/v/skills-pack)](https://www.npmjs.com/package/skills-pack)
[![license](https://img.shields.io/npm/l/skills-pack)](./LICENSE)
[![OpenClaw compatible](https://img.shields.io/badge/OpenClaw-compatible-blue)](https://github.com/nicepkg/openclaw)

> SKILL.md files for the **top 100 most downloaded npm packages** — ranked by real npm download stats, generated from actual package documentation

## Quick Start

```bash
npx skills-pack install all
```

This installs all 100 skill files to `~/.openclaw/skills/`, ready for your AI coding assistant.

## Commands

| Command | Description |
|---------|-------------|
| `skills-pack install all` | Install all 100 skills to `~/.openclaw/skills/` |
| `skills-pack install zod prisma vitest` | Install specific skills by name |
| `skills-pack list` | List all available skills with categories |
| `skills-pack search <query>` | Fuzzy search available skills |
| `skills-pack update` | Regenerate outdated skills |

## Categories

| Category | Count | Examples |
|----------|-------|---------|
| CLI tools | 12 | commander, chalk, ora, inquirer, yargs, execa |
| HTTP/API | 8 | axios, got, node-fetch, ky, undici |
| Validation | 6 | zod, joi, yup, valibot, arktype |
| Database/ORM | 8 | prisma, drizzle-orm, mongoose, ioredis, pg |
| Testing | 8 | vitest, jest, playwright, supertest, msw |
| Build tools | 8 | vite, esbuild, tsup, rollup, turbo |
| AI SDK | 6 | openai, @anthropic-ai/sdk, ai, ollama |
| File/Path | 6 | fs-extra, glob, chokidar, sharp |
| Date/Util | 8 | date-fns, dayjs, lodash, nanoid, uuid |
| Process/System | 6 | execa, shelljs, dotenv, cross-env, pm2 |
| Server framework | 10 | express, fastify, hono, koa, nestjs |
| Dev tools | 14 | typescript, eslint, prettier, husky, tsx |

## How It Works

1. **Curated list**: We maintain a ranked list of the top 100 most useful npm packages across 12 categories, scored by downloads, GitHub stars, and community mentions.

2. **Auto-generated skills**: Each `SKILL.md` is generated using [`skill-gen`](https://www.npmjs.com/package/skill-gen), which reads the package's source, exports, and README to produce a structured skill file.

3. **Pre-built & committed**: All skill files are committed to the repo — you don't need an API key to use them. The maintainer runs generation; users just install.

4. **Install anywhere**: Skills are copied to `~/.openclaw/skills/<name>/SKILL.md`, where OpenClaw-compatible AI tools can discover and use them.

## Contributing

Want to request a new package? Open an issue with:
- Package name and npm URL
- Category it belongs to
- Why it's useful for AI-assisted development

## License

ISC
