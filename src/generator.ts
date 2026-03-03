import { execSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PackageEntry } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoSkillsDir = path.resolve(__dirname, '../skills');
export const openclaw_SKILLS_DIR = `${process.env.HOME}/.openclaw/skills`;

export interface GenerateResult {
  success: boolean;
  path: string;
  error?: string;
}

/**
 * Generate a SKILL.md for a package using skill-gen.
 * Writes to the repo's skills/ directory (pre-generated, committed to repo).
 */
export async function generateSkill(
  pkg: PackageEntry,
  outputBase = repoSkillsDir,
): Promise<GenerateResult> {
  const safeName = pkg.name.replace(/\//g, '__').replace(/@/g, '');
  const skillDir = path.join(outputBase, safeName);
  const skillPath = path.join(skillDir, 'SKILL.md');

  mkdirSync(skillDir, { recursive: true });

  try {
    // Use our skill-gen with --npm flag — fetches from npm registry + generates via Claude
    const skillGenCli = path.resolve(__dirname, '../../skill-gen/src/cli.ts');
    execSync(
      `node --import tsx/esm "${skillGenCli}" --npm "${pkg.name}" --output "${skillPath}"`,
      { stdio: 'pipe', timeout: 60_000 }
    );

    // Validate output exists and has real content (>500 bytes)
    if (!existsSync(skillPath) || statSync(skillPath).size < 500) {
      throw new Error(`Generated file too small or missing`);
    }

    return { success: true, path: skillPath };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, path: skillPath, error: message };
  }
}

/**
 * Install a pre-generated skill from repo skills/ to ~/.openclaw/skills/
 * No API key needed — just a file copy.
 */
export function installSkill(pkgName: string): { success: boolean; error?: string } {
  const safeName = pkgName.replace(/\//g, '__').replace(/@/g, '');
  const src = path.join(repoSkillsDir, safeName, 'SKILL.md');
  const destDir = path.join(openclaw_SKILLS_DIR, safeName);
  const dest = path.join(destDir, 'SKILL.md');

  if (!existsSync(src)) {
    return { success: false, error: `No pre-generated skill found for ${pkgName}. Run: skills-pack generate ${pkgName}` };
  }

  mkdirSync(destDir, { recursive: true });

  try {
    execSync(`cp "${src}" "${dest}"`, { stdio: 'pipe' });
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Check if a skill is pre-generated in the repo
 */
export function hasPreGenerated(pkgName: string): boolean {
  const safeName = pkgName.replace(/\//g, '__').replace(/@/g, '');
  const skillPath = path.join(repoSkillsDir, safeName, 'SKILL.md');
  return existsSync(skillPath) && statSync(skillPath).size > 500;
}

/**
 * Check if a skill is installed in OpenClaw
 */
export function isInstalled(pkgName: string): boolean {
  const safeName = pkgName.replace(/\//g, '__').replace(/@/g, '');
  return existsSync(path.join(openclaw_SKILLS_DIR, safeName, 'SKILL.md'));
}
