# skills-pack — Project Spec

## What
A curated collection of SKILL.md files for the Top 100 most useful npm packages,
auto-generated via skill-gen and installable with one command.

## Two components
1. **scorer** — Python/Node script that ranks npm packages by utility score
   - Data: npm download stats + GitHub stars + community mentions (Exa search)
   - Formula: downloads×0.4 + stars×0.3 + mentions×0.3 (normalized)
   - Output: top100.json with ranked package list + categories

2. **installer CLI** — `skills-pack` command
   - `skills-pack install all` — install all 100 skills to ~/.openclaw/skills/
   - `skills-pack install zod prisma vitest` — install specific skills
   - `skills-pack list` — show all available skills with categories
   - `skills-pack update` — regenerate outdated skills (check package version)
   - `skills-pack search <query>` — fuzzy search available skills

## Categories (100 total)
- CLI tools: 12 (commander, chalk, ora, inquirer, yargs, execa, boxen, figlet, gradient-string, cli-table3, listr2, terminal-link)
- HTTP/API: 8 (axios, got, node-fetch, ky, undici, superagent, wretch, ofetch)
- Validation: 6 (zod, joi, yup, valibot, arktype, typebox)
- Database/ORM: 8 (prisma, drizzle-orm, mongoose, ioredis, pg, mysql2, better-sqlite3, typeorm)
- Testing: 8 (vitest, jest, playwright, supertest, msw, nock, faker-js, sinon)
- Build tools: 8 (vite, esbuild, tsup, rollup, turbo, nx, unbuild, bunchee)
- AI SDK: 6 (openai, @anthropic-ai/sdk, ai, @google/generative-ai, ollama, replicate)
- File/Path: 6 (fs-extra, glob, chokidar, archiver, sharp, pdf-lib)
- Date/Util: 8 (date-fns, dayjs, lodash, ramda, mathjs, decimal.js, nanoid, uuid)
- Process/System: 6 (execa, shelljs, dotenv, cross-env, pm2, nodemon)
- Server framework: 10 (express, fastify, hono, koa, nestjs, trpc, h3, elysia, polka, restify)
- Dev tools: 14 (typescript, eslint, prettier, husky, lint-staged, changelogen, bumpp, release-it, tsconfig-paths, tsx, jiti, depcheck, knip, publint)

## Tech stack
- Node.js + TypeScript
- Uses skill-gen (npm install -g skill-gen) to generate each SKILL.md
- Stores generated skills in ./skills/<name>/SKILL.md
- Installer copies to ~/.openclaw/skills/<name>/SKILL.md

## Repo structure
```
skills-pack/
├── src/
│   ├── cli.ts          # installer CLI (commander)
│   ├── scorer.ts       # npm scoring logic
│   ├── generator.ts    # batch skill-gen runner
│   └── types.ts
├── skills/             # pre-generated SKILL.md files (committed to repo)
│   ├── zod/SKILL.md
│   ├── prisma/SKILL.md
│   └── ...
├── data/
│   └── top100.json     # curated package list with metadata
├── scripts/
│   └── generate-all.ts # batch generation script
└── README.md
```

## Key insight
skills/ directory is COMMITTED to the repo — users don't need ANTHROPIC_API_KEY
to use skills-pack. The maintainer (Will) runs generation, users just install.
