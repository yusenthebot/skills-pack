import { execSync } from 'node:child_process';
import path from 'node:path';
import type { PackageEntry } from './types.js';

const skillsDir = path.resolve(import.meta.dirname ?? '.', '../skills');

export async function generateSkill(pkg: PackageEntry): Promise<void> {
  const outputPath = path.join(skillsDir, pkg.name, 'SKILL.md');
  console.log(`Generating skill for ${pkg.name}...`);

  execSync(
    `skill-gen --npm ${pkg.name} --output ${outputPath}`,
    { stdio: 'inherit' },
  );
}
