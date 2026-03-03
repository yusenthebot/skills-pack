import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSkill } from "../src/generator.js";
import type { PackageEntry } from "../src/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, "../data/top100.json");
const BATCH_SIZE = 5;

async function main() {
  const packages: PackageEntry[] = await fs.readJson(dataPath);
  let success = 0;
  let failed = 0;

  console.log(
    `Generating skills for ${packages.length} packages (batches of ${BATCH_SIZE})...\n`
  );

  for (let i = 0; i < packages.length; i += BATCH_SIZE) {
    const batch = packages.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(packages.length / BATCH_SIZE);

    console.log(
      `[Batch ${batchNum}/${totalBatches}] ${batch.map((p) => p.name).join(", ")}`
    );

    const results = await Promise.allSettled(
      batch.map((pkg) => generateSkill(pkg))
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.success) {
        success++;
      } else {
        failed++;
      }
    }

    console.log(`  Done\n`);
  }

  console.log(
    `\nDone: ${success} succeeded, ${failed} failed out of ${packages.length}`
  );
}

main().catch(console.error);
