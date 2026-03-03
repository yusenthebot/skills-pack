#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSkill, installSkill, hasPreGenerated, isInstalled, repoSkillsDir } from './generator.js';
import { scorePackage } from './scorer.js';
import type { PackageEntry } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '../data/top100.json');

function loadPackages(): PackageEntry[] {
  return fs.readJsonSync(dataPath) as PackageEntry[];
}

const program = new Command();

program
  .name('skills-pack')
  .description('100 curated OpenClaw SKILL.md files — install in one command')
  .version('0.1.0');

// ── install ──────────────────────────────────────────────────────────────────
// Copies pre-generated skills from repo → ~/.openclaw/skills/
// No API key needed. Fast (file copy).
program
  .command('install [packages...]')
  .description('Install pre-generated skills to ~/.openclaw/skills/')
  .option('--regenerate', 'Re-generate from scratch instead of using pre-built (needs ANTHROPIC_API_KEY)', false)
  .action(async (packages: string[], opts: { regenerate: boolean }) => {
    const allPkgs = loadPackages();
    const isAll = packages.length === 0 || packages[0] === 'all';
    const targets = isAll ? allPkgs : allPkgs.filter(p => packages.includes(p.name));

    if (!isAll) {
      const found = new Set(targets.map(t => t.name));
      const missing = packages.filter(p => p !== 'all' && !found.has(p));
      if (missing.length > 0) {
        console.log(chalk.yellow(`Not in top100: ${missing.join(', ')}. Use \`skills-pack generate\` for arbitrary packages.`));
      }
    }

    if (targets.length === 0) {
      console.log(chalk.red('No matching packages found.')); return;
    }

    if (opts.regenerate) {
      // Re-generate mode: requires API key
      if (!process.env.ANTHROPIC_API_KEY) {
        console.log(chalk.red('ANTHROPIC_API_KEY required for --regenerate mode.'));
        process.exit(1);
      }
      const spinner = ora(`Regenerating ${targets.length} skills...`).start();
      let ok = 0, fail = 0;
      for (const pkg of targets) {
        spinner.text = `Generating ${pkg.name}...`;
        const r = await generateSkill(pkg);
        if (r.success) { installSkill(pkg.name); ok++; } else { fail++; }
      }
      spinner.succeed(`Done: ${ok} installed, ${fail} failed`);
      return;
    }

    // Fast copy mode: use pre-generated skills from repo
    let ok = 0, fail = 0, missing = 0;
    const spinner = ora(`Installing ${targets.length} skills...`).start();

    for (const pkg of targets) {
      spinner.text = `Installing ${pkg.name}...`;
      if (!hasPreGenerated(pkg.name)) { missing++; continue; }
      const r = installSkill(pkg.name);
      if (r.success) ok++; else fail++;
    }

    spinner.succeed(
      `Done: ${chalk.green(ok + ' installed')}, ${missing > 0 ? chalk.yellow(missing + ' not pre-generated') : ''} ${fail > 0 ? chalk.red(fail + ' failed') : ''}`.trim()
    );
    if (missing > 0) {
      console.log(chalk.gray(`Tip: run ${chalk.white('skills-pack generate --all')} to generate missing skills (needs ANTHROPIC_API_KEY)`));
    }
  });

// ── generate ─────────────────────────────────────────────────────────────────
// Generates SKILL.md files into repo skills/ directory (maintainer tool)
program
  .command('generate [packages...]')
  .description('Generate SKILL.md files (writes to repo skills/ dir, needs ANTHROPIC_API_KEY)')
  .option('--all', 'Generate all 100 packages')
  .option('--missing', 'Only generate packages without a pre-built skill')
  .option('--concurrency <n>', 'Parallel jobs', '5')
  .action(async (packages: string[], opts: { all: boolean; missing: boolean; concurrency: string }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log(chalk.red('ANTHROPIC_API_KEY is required to generate skills.'));
      process.exit(1);
    }
    const allPkgs = loadPackages();
    let targets = opts.all || packages.length === 0 ? allPkgs : allPkgs.filter(p => packages.includes(p.name));
    if (opts.missing) targets = targets.filter(p => !hasPreGenerated(p.name));

    if (targets.length === 0) { console.log(chalk.green('All skills already generated!')); return; }

    const concurrency = parseInt(opts.concurrency, 10);
    console.log(chalk.bold(`Generating ${targets.length} skills (${concurrency} parallel)...\n`));

    let ok = 0, fail = 0;
    for (let i = 0; i < targets.length; i += concurrency) {
      const batch = targets.slice(i, i + concurrency);
      const results = await Promise.allSettled(batch.map(pkg => generateSkill(pkg)));
      for (let j = 0; j < results.length; j++) {
        const r = results[j];
        const pkg = batch[j];
        if (r.status === 'fulfilled' && r.value.success) {
          console.log(`  ${chalk.green('✔')} ${pkg.name}`);
          ok++;
        } else {
          const err = r.status === 'rejected' ? r.reason : r.value.error;
          console.log(`  ${chalk.red('✖')} ${pkg.name} ${chalk.gray(err)}`);
          fail++;
        }
      }
    }
    console.log(`\n${chalk.bold(`Generated: ${ok} succeeded, ${fail} failed`)}`);
    console.log(chalk.gray(`Skills written to ${repoSkillsDir}`));
    console.log(chalk.gray(`Commit with: git add skills/ && git commit -m 'chore: update pre-generated skills'`));
  });

// ── list ─────────────────────────────────────────────────────────────────────
program
  .command('list')
  .description('Show all available skills grouped by category')
  .option('-c, --category <cat>', 'Filter by category')
  .option('--installed', 'Show only installed skills')
  .action((opts: { category?: string; installed?: boolean }) => {
    const pkgs = loadPackages();
    let filtered = opts.category ? pkgs.filter(p => p.category.toLowerCase() === opts.category!.toLowerCase()) : pkgs;
    if (opts.installed) filtered = filtered.filter(p => isInstalled(p.name));

    const grouped = new Map<string, PackageEntry[]>();
    for (const pkg of filtered) {
      const list = grouped.get(pkg.category) ?? [];
      list.push(pkg); grouped.set(pkg.category, list);
    }

    for (const [cat, items] of [...grouped.entries()].sort()) {
      console.log(`\n${chalk.bold.cyan(cat)} ${chalk.gray(`(${items.length})`)}`);
      console.log(chalk.gray('─'.repeat(50)));
      for (const pkg of items) {
        const pre = hasPreGenerated(pkg.name) ? chalk.green('●') : chalk.gray('○');
        const inst = isInstalled(pkg.name) ? chalk.blue('↓') : ' ';
        console.log(`  ${pre}${inst} ${chalk.white.bold(pkg.name.padEnd(28))} ${chalk.gray(pkg.description)}`);
      }
    }

    const total = filtered.length;
    const preGen = filtered.filter(p => hasPreGenerated(p.name)).length;
    const installed = filtered.filter(p => isInstalled(p.name)).length;
    console.log(`\n${chalk.gray(`${total} packages  ${chalk.green('●')} ${preGen} pre-generated  ${chalk.blue('↓')} ${installed} installed`)}`);
  });

// ── search ───────────────────────────────────────────────────────────────────
program
  .command('search <query>')
  .description('Search available skills by name, description or category')
  .action((query: string) => {
    const pkgs = loadPackages();
    const q = query.toLowerCase();
    const matches = pkgs.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    if (matches.length === 0) { console.log(chalk.yellow(`No matches for "${query}"`)); return; }
    console.log(chalk.bold(`\n${matches.length} match(es) for "${query}":\n`));
    for (const pkg of matches) {
      const pre = hasPreGenerated(pkg.name) ? chalk.green('●') : chalk.gray('○');
      console.log(`  ${pre} ${chalk.bold.white(pkg.name.padEnd(25))} ${chalk.cyan(pkg.category.padEnd(16))} ${chalk.gray(pkg.description)}`);
    }
  });

// ── update ───────────────────────────────────────────────────────────────────
program
  .command('update [packages...]')
  .description('Check for newer npm versions and regenerate outdated skills')
  .option('-a, --all', 'Check all installed skills')
  .action(async (packages: string[], opts: { all?: boolean }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log(chalk.red('ANTHROPIC_API_KEY required to regenerate skills.'));
      process.exit(1);
    }
    const allPkgs = loadPackages();
    const targets = (opts.all || packages.length === 0)
      ? allPkgs.filter(p => isInstalled(p.name))
      : allPkgs.filter(p => packages.includes(p.name));

    if (targets.length === 0) { console.log(chalk.yellow('No installed skills to update.')); return; }

    const spinner = ora(`Checking ${targets.length} skill(s)...`).start();
    let updated = 0;

    for (const pkg of targets) {
      spinner.text = `Checking ${pkg.name}...`;
      try {
        const score = await scorePackage(pkg.name);
        // Compare against the version stored in the SKILL.md frontmatter or top100.json
        const storedVersion = pkg.version && pkg.version !== 'latest' ? pkg.version : null;
        if (!storedVersion || score.version !== storedVersion) {
          spinner.text = `Updating ${pkg.name} → ${score.version}...`;
          const r = await generateSkill(pkg);
          if (r.success) { installSkill(pkg.name); updated++; }
          // Update version in top100.json
          pkg.version = score.version;
        }
      } catch { /* skip */ }
    }

    spinner.succeed(`Updated ${updated} skill(s)`);
  });

program.parse();
