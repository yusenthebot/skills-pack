export interface PackageEntry {
  name: string;
  category: string;
  description: string;
  npmUrl: string;
  version: string;
}

export interface SkillMeta {
  name: string;
  generatedAt: string;
  packageVersion: string;
  skillPath: string;
}

export interface InstallOptions {
  packages?: string[];
  all?: boolean;
  outputDir?: string;
  force?: boolean;
}
