#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSkill } from "./generator.js";
import { scorePackage } from "./scorer.js";
import type { PackageEntry } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, "../data/top100.json");
const skillsDir = path.resolve(__dirname, "../skills");

function loadPackages(): PackageEntry[] {
  return fs.readJsonSync(dataPath) as PackageEntry[];
}

const program = new Command();

program
  .name("skills-pack")
  .description("One-command installer for 100 curated OpenClaw SKILL.md files")
  .version("0.1.0");

// ── install ──────────────────────────────────────────────────
program
  .command("install [packages...]")
  .description("Generate SKILL.md files for specified packages (or all)")
  .option("-o, --output <dir>", "Output directory", skillsDir)
  .option("-f, --force", "Regenerate even if SKILL.md already exists", false)
  .action(
    async (
      packages: string[],
      opts: { output: string; force: boolean }
    ) => {
      const allPkgs = loadPackages();
      const isAll = packages.length === 0 || packages.includes("all");

      const targets = isAll
        ? allPkgs
        : allPkgs.filter((p) => packages.includes(p.name));

      if (!isAll) {
        const found = new Set(targets.map((t) => t.name));
        const missing = packages.filter((p) => p !== "all" && !found.has(p));
        if (missing.length > 0) {
          console.log(
            chalk.yellow(`Packages not in top100: ${missing.join(", ")}`)
          );
        }
      }

      if (targets.length === 0) {
        console.log(chalk.red("No matching packages found."));
        return;
      }

      const spinner = ora(
        `Installing ${targets.length} skill(s)...`
      ).start();
      let success = 0;
      let failed = 0;

      for (const pkg of targets) {
        const skillPath = path.join(opts.output, pkg.name, "SKILL.md");

        if (!opts.force && (await fs.pathExists(skillPath))) {
          success++;
          continue;
        }

        spinner.text = `Generating ${pkg.name}...`;
        const result = await generateSkill(pkg, opts.output);
        if (result.success) {
          success++;
        } else {
          failed++;
        }
      }

      spinner.succeed(
        `Done: ${success} succeeded, ${failed} failed out of ${targets.length}`
      );
    }
  );

// ── list ─────────────────────────────────────────────────────
program
  .command("list")
  .description("Show all available skills grouped by category")
  .option("-c, --category <category>", "Filter by category")
  .action((opts: { category?: string }) => {
    const pkgs = loadPackages();
    const filtered = opts.category
      ? pkgs.filter(
          (p) => p.category.toLowerCase() === opts.category!.toLowerCase()
        )
      : pkgs;

    const grouped = new Map<string, PackageEntry[]>();
    for (const pkg of filtered) {
      const list = grouped.get(pkg.category) ?? [];
      list.push(pkg);
      grouped.set(pkg.category, list);
    }

    const sortedCategories = [...grouped.keys()].sort();

    for (const category of sortedCategories) {
      const items = grouped.get(category)!;
      console.log(
        `\n${chalk.bold.cyan(category)} ${chalk.gray(`(${items.length})`)}`
      );
      console.log(chalk.gray("─".repeat(50)));

      for (const pkg of items) {
        const installed = fs.pathExistsSync(
          path.join(skillsDir, pkg.name, "SKILL.md")
        );
        const status = installed ? chalk.green("●") : chalk.gray("○");
        console.log(
          `  ${status} ${chalk.white.bold(pkg.name.padEnd(25))} ${chalk.gray(pkg.description)}`
        );
      }
    }

    console.log(
      `\n${chalk.gray(`Total: ${filtered.length} packages across ${sortedCategories.length} categories`)}`
    );
  });

// ── search ───────────────────────────────────────────────────
program
  .command("search <query>")
  .description("Fuzzy search available skills by name or description")
  .action((query: string) => {
    const pkgs = loadPackages();
    const q = query.toLowerCase();

    const matches = pkgs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      console.log(chalk.yellow(`No matches for "${query}"`));
      return;
    }

    console.log(
      chalk.bold(`\nFound ${matches.length} match(es) for "${query}":\n`)
    );
    for (const pkg of matches) {
      console.log(
        `  ${chalk.bold.white(pkg.name.padEnd(25))} ${chalk.cyan(pkg.category.padEnd(18))} ${chalk.gray(pkg.description)}`
      );
    }
  });

// ── update ───────────────────────────────────────────────────
program
  .command("update [packages...]")
  .description("Check installed skills and regenerate if outdated")
  .option("-a, --all", "Update all installed skills")
  .action(async (packages: string[], opts: { all?: boolean }) => {
    const allPkgs = loadPackages();
    let targets: PackageEntry[];

    if (opts.all || packages.length === 0) {
      targets = allPkgs.filter((p) =>
        fs.pathExistsSync(path.join(skillsDir, p.name, "SKILL.md"))
      );
    } else {
      targets = allPkgs.filter((p) => packages.includes(p.name));
    }

    if (targets.length === 0) {
      console.log(chalk.yellow("No installed skills to update."));
      return;
    }

    const spinner = ora(
      `Checking ${targets.length} skill(s) for updates...`
    ).start();
    let updated = 0;

    for (const pkg of targets) {
      spinner.text = `Checking ${pkg.name}...`;
      try {
        const score = await scorePackage(pkg.name);
        if (score.version !== pkg.version) {
          spinner.text = `Updating ${pkg.name} (${pkg.version} → ${score.version})...`;
          const result = await generateSkill(pkg);
          if (result.success) {
            updated++;
          }
        }
      } catch {
        // skip packages we can't check
      }
    }

    spinner.succeed(
      `Updated ${updated} skill(s) out of ${targets.length} checked`
    );
  });

program.parse();
