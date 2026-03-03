import type { PackageEntry } from './types.js';

interface DownloadStats {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export async function fetchDownloads(packageName: string): Promise<number> {
  const url = `https://api.npmjs.org/downloads/point/last-month/${packageName}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch downloads for ${packageName}: ${res.statusText}`);
  }

  const data = (await res.json()) as DownloadStats;
  return data.downloads;
}

export async function scorePackages(packages: PackageEntry[]): Promise<Map<string, number>> {
  const scores = new Map<string, number>();

  for (const pkg of packages) {
    const downloads = await fetchDownloads(pkg.name);
    // Normalized score — downloads component only for now
    // Full formula: downloads×0.4 + stars×0.3 + mentions×0.3
    scores.set(pkg.name, downloads);
  }

  return scores;
}
