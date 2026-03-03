export interface PackageScore {
  downloads: number;
  version: string;
  description: string;
}

export async function scorePackage(name: string): Promise<PackageScore> {
  const [downloadsRes, registryRes] = await Promise.all([
    fetch(`https://api.npmjs.org/downloads/point/last-month/${name}`),
    fetch(`https://registry.npmjs.org/${name}`),
  ]);

  if (!downloadsRes.ok) {
    throw new Error(
      `Failed to fetch download stats for ${name}: ${downloadsRes.statusText}`
    );
  }
  if (!registryRes.ok) {
    throw new Error(
      `Failed to fetch registry info for ${name}: ${registryRes.statusText}`
    );
  }

  const downloadsData = (await downloadsRes.json()) as { downloads: number };
  const registryData = (await registryRes.json()) as {
    "dist-tags": { latest: string };
    description?: string;
  };

  return {
    downloads: downloadsData.downloads,
    version: registryData["dist-tags"].latest,
    description: registryData.description ?? "",
  };
}
