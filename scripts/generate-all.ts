#!/usr/bin/env node
/**
 * Maintainer script: generate all SKILL.md files using claude CLI (OAuth, no API key needed).
 * Usage: node --import tsx/esm scripts/generate-all.ts [--missing]
 */
import { execSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import type { PackageEntry } from '../src/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packages: PackageEntry[] = fs.readJsonSync(path.resolve(__dirname, '../data/top100.json'));
const skillsDir = path.resolve(__dirname, '../skills');

const CONCURRENCY = 3;
const ONLY_MISSING = process.argv.includes('--missing');

const SKILL_PROMPT = (pkg: PackageEntry) => `Generate a high-quality OpenClaw SKILL.md for the npm package "${pkg.name}".

${pkg.description}

Output ONLY the raw SKILL.md content. No explanation. Use this exact format:

---
name: ${pkg.name}
description: >
  One sentence. Use when: [3 specific use cases]. NOT for: [2 anti-patterns].
---

# ${pkg.name}

## Overview
Brief explanation of what it does and why developers use it.

## Installation
\`\`\`bash
npm install ${pkg.name}
\`\`\`

## Core API / Commands
The most important functions, methods, or CLI commands with real working examples.

## Common Patterns
3-5 real-world patterns developers actually use. Include complete code snippets.

## Configuration
Key config options with types and defaults.

## Tips & Gotchas
- Non-obvious behaviors
- Common mistakes and how to avoid them
- Performance considerations if relevant

Make it genuinely useful — real examples from the actual package API, not generic placeholders.`;

function hasContent(pkgName: string): boolean {
  const safeName = pkgName.replace(/\//g, '__').replace(/@/g, '');
  const p = path.join(skillsDir, safeName, 'SKILL.md');
  return existsSync(p) && statSync(p).size > 800;
}

async function generateOne(pkg: PackageEntry): Promise<{ success: boolean; error?: string }> {
  const safeName = pkg.name.replace(/\//g, '__').replace(/@/g, '');
  const skillDir = path.join(skillsDir, safeName);
  const skillPath = path.join(skillDir, 'SKILL.md');
  mkdirSync(skillDir, { recursive: true });

  try {
    const prompt = SKILL_PROMPT(pkg);
    // Use claude CLI with -p flag (non-interactive, uses OAuth auth)
    const result = execSync(
      `claude -p ${JSON.stringify(prompt)}`,
      { encoding: 'utf8', timeout: 60_000, stdio: ['pipe', 'pipe', 'pipe'] }
    );
    const content = result.trim();
    if (content.length < 800) throw new Error('Output too short');
    writeFileSync(skillPath, content, 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err).slice(0, 120) };
  }
}

const targets = ONLY_MISSING ? packages.filter(p => !hasContent(p.name)) : packages;

console.log(chalk.bold(`\n📦 Generating ${targets.length} SKILL.md files (${CONCURRENCY} parallel)\n`));

let ok = 0, fail = 0;
const failed: string[] = [];

for (let i = 0; i < targets.length; i += CONCURRENCY) {
  const batch = targets.slice(i, i + CONCURRENCY);
  const results = await Promise.allSettled(batch.map(pkg => generateOne(pkg)));

  for (let j = 0; j < results.length; j++) {
    const r = results[j];
    const pkg = batch[j];
    const idx = i + j + 1;
    if (r.status === 'fulfilled' && r.value.success) {
      console.log(`  ${chalk.green('✔')} [${idx}/${targets.length}] ${pkg.name}`);
      ok++;
    } else {
      const err = r.status === 'rejected' ? r.reason : r.value?.error;
      console.log(`  ${chalk.red('✖')} [${idx}/${targets.length}] ${pkg.name} — ${chalk.gray(String(err).slice(0, 80))}`);
      fail++;
      failed.push(pkg.name);
    }
  }
}

console.log(`\n${chalk.bold.green(`✔ ${ok} succeeded`)}  ${chalk.bold.red(`✖ ${fail} failed`)}`);
if (failed.length > 0) console.log(chalk.gray(`Failed: ${failed.join(', ')}`));
