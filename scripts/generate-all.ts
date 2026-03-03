import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSkill } from '../src/generator.js';
import type { PackageEntry } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_SIZE = 5;

async function main() {
  const dataPath = path.resolve(__dirname, '../data/top100.json');
  const packages: PackageEntry[] = await fs.readJson(dataPath);

  console.log(`Generating skills for ${packages.length} packages (batch size: ${BATCH_SIZE})...\n`);

  for (let i = 0; i < packages.length; i += BATCH_SIZE) {
    const batch = packages.slice(i, i + BATCH_SIZE);
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.map((p) => p.name).join(', ')}`);

    await Promise.all(batch.map((pkg) => generateSkill(pkg)));

    console.log(`  ✓ Batch complete\n`);
  }

  console.log('Done! All skills generated.');
}

main().catch((err) => {
  console.error('Generation failed:', err);
  process.exit(1);
});
