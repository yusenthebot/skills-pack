#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PackageEntry, InstallOptions } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.resolve(__dirname, '../data/top100.json');
const skillsDir = path.resolve(__dirname, '../skills');
const defaultOutputDir = path.join(
  process.env.HOME || process.env.USERPROFILE || '~',
  '.openclaw',
  'skills',
);

function loadPackages(): PackageEntry[] {
  return fs.readJsonSync(dataPath) as PackageEntry[];
}

const program = new Command();

program
  .name('skills-pack')
  .description(
    'One-command installer for 100 curated OpenClaw SKILL.md files',
  )
  .version('0.1.0');

program
  .command('install [packages...]')
  .description('Install skill files (use "all" to install everything)')
  .option('-o, --output <dir>', 'Output directory', defaultOutputDir)
  .option('-f, --force', 'Overwrite existing skills', false)
  .action(async (packages: string[], opts: { output: string; force: boolean }) => {
    const allPackages = loadPackages();
    const isAll = packages.length === 0 || packages.includes('all');

    const toInstall = isAll
      ? allPackages
      : allPackages.filter((p) => packages.includes(p.name));

    if (toInstall.length === 0) {
      console.log(chalk.yellow('No matching packages found.'));
      return;
    }

    const spinner = ora(
      `Installing ${toInstall.length} skill(s)...`,
    ).start();

    let installed = 0;
    for (const pkg of toInstall) {
      const src = path.join(skillsDir, pkg.name, 'SKILL.md');
      const dest = path.join(opts.output, pkg.name, 'SKILL.md');

      if (!await fs.pathExists(src)) {
        spinner.warn(
          chalk.yellow(`Skill not generated yet: ${pkg.name}`),
        );
        spinner.start();
        continue;
      }

      if (!opts.force && (await fs.pathExists(dest))) {
        continue;
      }

      await fs.ensureDir(path.dirname(dest));
      await fs.copy(src, dest);
      installed++;
    }

    spinner.succeed(
      chalk.green(`Installed ${installed} skill(s) to ${opts.output}`),
    );
  });

program
  .command('list')
  .description('List all available skills with categories')
  .option('-c, --category <category>', 'Filter by category')
  .action((opts: { category?: string }) => {
    const packages = loadPackages();
    const filtered = opts.category
      ? packages.filter(
          (p) => p.category.toLowerCase() === opts.category!.toLowerCase(),
        )
      : packages;

    const categories = new Map<string, PackageEntry[]>();
    for (const pkg of filtered) {
      const list = categories.get(pkg.category) || [];
      list.push(pkg);
      categories.set(pkg.category, list);
    }

    for (const [category, pkgs] of categories) {
      console.log(chalk.bold.cyan(`\n${category} (${pkgs.length})`));
      for (const pkg of pkgs) {
        console.log(`  ${chalk.white(pkg.name)} — ${chalk.gray(pkg.description)}`);
      }
    }

    console.log(chalk.gray(`\nTotal: ${filtered.length} packages`));
  });

program
  .command('update')
  .description('Regenerate outdated skills (check package version)')
  .action(async () => {
    const spinner = ora('Checking for outdated skills...').start();
    // TODO: compare installed versions with latest npm versions
    spinner.info('Update not yet implemented — run scripts/generate-all.ts to regenerate.');
  });

program
  .command('search <query>')
  .description('Fuzzy search available skills')
  .action((query: string) => {
    const packages = loadPackages();
    const q = query.toLowerCase();
    const matches = packages.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );

    if (matches.length === 0) {
      console.log(chalk.yellow(`No skills matching "${query}"`));
      return;
    }

    console.log(chalk.bold(`Found ${matches.length} result(s):\n`));
    for (const pkg of matches) {
      console.log(
        `  ${chalk.cyan(pkg.name)} ${chalk.gray(`[${pkg.category}]`)} — ${pkg.description}`,
      );
    }
  });

program.parse();
