import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { PackageEntry } from './types.js';

const skillsDir = path.resolve(import.meta.dirname ?? '.', '../skills');
const tmpBase = path.resolve(import.meta.dirname ?? '.', '../.tmp');

export interface GenerateResult {
  success: boolean;
  path: string;
  error?: string;
}

export async function generateSkill(
  pkg: PackageEntry,
  outputBase = skillsDir,
): Promise<GenerateResult> {
  const safeName = pkg.name.replace(/\//g, '__').replace(/@/g, '');
  const skillDir = path.join(outputBase, safeName);
  const skillPath = path.join(skillDir, 'SKILL.md');
  const tmpDir = path.join(tmpBase, safeName);

  mkdirSync(skillDir, { recursive: true });
  mkdirSync(tmpDir, { recursive: true });

  try {
    console.log(`  Installing ${pkg.name}...`);
    execSync('npm init -y', { cwd: tmpDir, stdio: 'pipe' });
    execSync(`npm install ${pkg.name}@latest`, { cwd: tmpDir, stdio: 'pipe', timeout: 120_000 });

    const pkgPath = path.join(tmpDir, 'node_modules', pkg.name);
    if (!existsSync(pkgPath)) {
      throw new Error(`Package not found at ${pkgPath}`);
    }

    console.log(`  Running skill-gen for ${pkg.name}...`);
    execSync(`skill-gen "${pkgPath}" -o "${skillPath}"`, { stdio: 'pipe', timeout: 30_000 });
    console.log(`  Done: ${pkg.name}`);

    return { success: true, path: skillPath };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[warn] Failed to generate skill for ${pkg.name}: ${message}`);
    return { success: false, path: skillPath, error: message };
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}
