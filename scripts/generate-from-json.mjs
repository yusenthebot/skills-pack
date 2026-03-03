#!/usr/bin/env node
/**
 * Generates SKILL.md for all 100 packages from /tmp/top100_with_meta.json
 * Each file is based on real readme_excerpt content from npm registry + Jina.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const SKILLS_DIR = join(import.meta.dirname, '..', 'skills');
const INPUT = '/tmp/top100_with_meta.json';

const packages = JSON.parse(readFileSync(INPUT, 'utf8'));

function safeName(name) {
  return name.replace(/\//g, '__').replace(/@/g, '');
}

function formatDownloads(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B/month`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M/month`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K/month`;
  return `${n}/month`;
}

/** Extract code blocks from readme */
function extractCodeBlocks(readme) {
  const blocks = [];
  const re = /```(\w*)\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(readme)) !== null) {
    blocks.push({ lang: m[1] || 'js', code: m[2].trim() });
  }
  return blocks;
}

/** Extract install command from readme */
function extractInstallCmd(readme, name) {
  // Look for npm install / yarn add / pnpm add lines
  const lines = readme.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(npm\s+i(nstall)?|yarn\s+add|pnpm\s+(add|install)|bun\s+(add|install))\s/.test(trimmed) && trimmed.includes(name.split('/').pop())) {
      return trimmed;
    }
  }
  // Fallback: look in code blocks
  const codeBlocks = extractCodeBlocks(readme);
  for (const b of codeBlocks) {
    if ((b.lang === 'bash' || b.lang === 'sh' || b.lang === '' || b.lang === 'shell' || b.lang === 'console') && /npm\s+i(nstall)?/.test(b.code)) {
      const installLine = b.code.split('\n').find(l => /npm\s+i(nstall)?/.test(l));
      if (installLine) return installLine.replace(/^\$\s*/, '').trim();
    }
  }
  return `npm install ${name}`;
}

/** Extract features/highlights from readme */
function extractFeatures(readme) {
  const features = [];
  const lines = readme.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for bullet points that describe features
    if (/^[\*\-]\s+\*?\*?[A-Z]/.test(trimmed) || /^[\*\-]\s+[A-Z]/.test(trimmed)) {
      const clean = trimmed.replace(/^[\*\-]\s+/, '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
      if (clean.length > 10 && clean.length < 200 && !clean.startsWith('[') && !clean.startsWith('Image')) {
        features.push(clean);
      }
    }
  }
  return features.slice(0, 8);
}

/** Extract section content from readme by heading */
function extractSection(readme, headingPattern) {
  const lines = readme.split('\n');
  let capturing = false;
  let content = [];
  let headingLevel = 0;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      if (capturing) {
        // Stop if we hit same or higher level heading
        if (headingMatch[1].length <= headingLevel) break;
      }
      if (headingPattern.test(headingMatch[2])) {
        capturing = true;
        headingLevel = headingMatch[1].length;
        continue;
      }
    }
    if (capturing) {
      content.push(line);
    }
  }
  return content.join('\n').trim();
}

/** Build use-when cases from readme content */
function buildUseCases(readme, description, name) {
  const features = extractFeatures(readme);
  const lower = (readme + ' ' + description).toLowerCase();
  const cases = [];

  // Category-based heuristics
  const categoryMap = [
    [/cli|command.line|terminal|console/i, 'building CLI tools'],
    [/http|server|request|api|route|endpoint/i, 'building HTTP servers or APIs'],
    [/test|spec|assert|mock|stub/i, 'writing and running tests'],
    [/style|css|color|terminal.*styl/i, 'styling terminal output'],
    [/parse|argument|option|argv/i, 'parsing command-line arguments'],
    [/file|glob|path|directory|fs/i, 'working with files and directories'],
    [/date|time|moment|calendar/i, 'date and time manipulation'],
    [/schema|valid|type.*check/i, 'data validation and type checking'],
    [/database|sql|query|orm|model/i, 'database operations'],
    [/react|component|jsx|hook/i, 'building React applications'],
    [/websocket|real.time|socket/i, 'real-time communication'],
    [/encrypt|hash|auth|jwt|token|password/i, 'authentication and security'],
    [/email|mail|smtp/i, 'sending emails'],
    [/image|sharp|resize|transform/i, 'image processing'],
    [/pdf|document/i, 'PDF generation or parsing'],
    [/redis|cache|store/i, 'caching and data storage'],
    [/build|bundle|compile|transpile/i, 'build tooling and bundling'],
    [/lint|format|prettier|eslint/i, 'code formatting and linting'],
    [/log|debug|monitor/i, 'logging and debugging'],
    [/stream|pipe|transform/i, 'stream processing'],
    [/env|config|setting/i, 'environment configuration'],
    [/uuid|id|unique|random/i, 'generating unique identifiers'],
    [/compress|zip|archive/i, 'file compression'],
    [/schedule|cron|job/i, 'task scheduling'],
    [/process|spawn|exec|child/i, 'running shell commands'],
  ];

  for (const [pattern, desc] of categoryMap) {
    if (pattern.test(lower) && cases.length < 3) {
      cases.push(desc);
    }
  }

  // Add from features
  for (const f of features) {
    if (cases.length >= 3) break;
    const short = f.length > 60 ? f.slice(0, 57) + '...' : f;
    if (!cases.some(c => c.toLowerCase().includes(short.slice(0, 20).toLowerCase()))) {
      cases.push(short.toLowerCase().replace(/^\w/, c => c.toUpperCase()));
    }
  }

  // Fallback
  while (cases.length < 3) {
    cases.push(`projects that need ${name} functionality`);
    break;
  }

  return cases.slice(0, 3);
}

/** Build NOT-for anti-patterns */
function buildAntiPatterns(readme, description, name) {
  const lower = (readme + ' ' + description).toLowerCase();
  const anti = [];

  const antiMap = [
    [/browser/i, /not.*browser|does not work in.*browser/i, 'browser-side code (Node.js only)'],
    [/node|server/i, /not.*browser/i, null],
    [/esm|es.module/i, /commonjs.*not|no.*commonjs/i, 'CommonJS-only projects (ESM only)'],
    [/cli/i, null, 'GUI applications without terminal interaction'],
    [/react/i, null, 'non-React frameworks (Vue, Angular, Svelte)'],
    [/express/i, null, 'serverless-only deployments without Express'],
    [/test/i, null, 'production runtime code'],
    [/websocket/i, null, 'simple REST APIs without real-time needs'],
    [/database|sql|orm/i, null, 'in-memory-only data without persistence'],
    [/style|css/i, null, 'server-side-only code without terminal/UI'],
  ];

  for (const [match, extra, desc] of antiMap) {
    if (match.test(lower) && desc && anti.length < 2) {
      anti.push(desc);
    }
  }

  if (anti.length < 1) anti.push(`projects that don't need ${name}`);
  if (anti.length < 2) anti.push('cases where a lighter alternative suffices');

  return anti.slice(0, 2);
}

/** Pick the best code blocks for Core API section */
function pickCoreCodeBlocks(codeBlocks, readme, name) {
  // Filter out install-only blocks and image/badge blocks
  const useful = codeBlocks.filter(b => {
    if (b.code.length < 15) return false;
    if (/^(npm|yarn|pnpm|bun)\s+(i|install|add)/.test(b.code) && b.code.split('\n').length <= 2) return false;
    if (b.code.includes('img.shields.io')) return false;
    return true;
  });

  // Prefer blocks that import/require the package
  const withImport = useful.filter(b =>
    b.code.includes(`'${name}'`) ||
    b.code.includes(`"${name}"`) ||
    b.code.includes(`from '${name}`) ||
    b.code.includes(`require('${name}`) ||
    b.code.includes(`from "${name}`) ||
    b.code.includes(`require("${name}`)
  );

  const picks = withImport.length > 0 ? withImport : useful;

  // Take up to 2 blocks, max ~40 lines each
  return picks.slice(0, 2).map(b => {
    const lines = b.code.split('\n');
    const trimmed = lines.length > 40 ? lines.slice(0, 40).join('\n') + '\n// ...' : b.code;
    return { lang: b.lang || 'js', code: trimmed };
  });
}

/** Pick code blocks for Common Patterns section */
function pickPatternCodeBlocks(codeBlocks, readme, name) {
  const useful = codeBlocks.filter(b => {
    if (b.code.length < 30) return false;
    if (/^(npm|yarn|pnpm|bun)\s+(i|install|add)/.test(b.code) && b.code.split('\n').length <= 2) return false;
    return true;
  });

  // Skip the first couple (those go to Core API), take next ones
  const remaining = useful.slice(2, 5);

  return remaining.map(b => {
    const lines = b.code.split('\n');
    const trimmed = lines.length > 30 ? lines.slice(0, 30).join('\n') + '\n// ...' : b.code;
    return { lang: b.lang || 'js', code: trimmed };
  });
}

/** Extract gotchas, tips, warnings from readme */
function extractGotchas(readme, name, version) {
  const tips = [];
  const lines = readme.split('\n');

  // Look for NOTE, WARNING, IMPORTANT, tip patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^\>?\s*\[!\s*(NOTE|WARNING|IMPORTANT|TIP|CAUTION)\]/.test(line) ||
        /^\>?\s*\*\*(Note|Warning|Important|Tip|Caution)\*?\*?:/.test(line) ||
        /^(Note|Warning|Important|IMPORTANT|⚠|💡|📝):?\s/.test(line)) {
      // Grab the next line(s) as the tip content
      let content = line.replace(/^\>?\s*\[!\s*\w+\]\s*/, '').replace(/^\>?\s*\*\*(Note|Warning|Important|Tip|Caution)\*?\*?:\s*/, '').trim();
      if (!content && i + 1 < lines.length) {
        content = lines[i + 1].replace(/^>\s*/, '').trim();
      }
      if (content && content.length > 10 && content.length < 300) {
        tips.push(content);
      }
    }
  }

  // Look for lines mentioning breaking changes, migration, deprecation
  for (const line of lines) {
    const trimmed = line.trim();
    if (/breaking|deprecat|migrat|upgrade/i.test(trimmed) && trimmed.length > 20 && trimmed.length < 200) {
      const clean = trimmed.replace(/^[\*\-#>\s]+/, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
      if (clean.length > 15) tips.push(clean);
    }
  }

  // Deduplicate and limit
  const unique = [...new Set(tips)].slice(0, 5);

  // Add version-specific note if we have version info
  if (version) {
    const major = version.split('.')[0];
    if (parseInt(major) >= 2) {
      unique.push(`Current version is ${version}. Check migration guides when upgrading across major versions.`);
    }
  }

  return unique.slice(0, 5);
}

/** Generate a single SKILL.md */
function generateSkillMd(pkg) {
  const { name, version, downloads, description, readme_excerpt } = pkg;
  const readme = readme_excerpt || '';
  const dlFormatted = formatDownloads(downloads);

  const installCmd = extractInstallCmd(readme, name);
  const useCases = buildUseCases(readme, description, name);
  const antiPatterns = buildAntiPatterns(readme, description, name);
  const codeBlocks = extractCodeBlocks(readme);
  const coreBlocks = pickCoreCodeBlocks(codeBlocks, readme, name);
  const patternBlocks = pickPatternCodeBlocks(codeBlocks, readme, name);
  const features = extractFeatures(readme);
  const gotchas = extractGotchas(readme, name, version);

  // Build overview from description + features
  let overview = description;
  if (features.length > 0) {
    overview += '\n\nKey features:\n' + features.slice(0, 5).map(f => `- ${f}`).join('\n');
  }

  // Build Core API section
  let coreApi = '';
  if (coreBlocks.length > 0) {
    coreApi = coreBlocks.map(b => '```' + b.lang + '\n' + b.code + '\n```').join('\n\n');
  } else {
    // Fallback: basic import
    coreApi = '```js\nimport ' + (name.includes('/') ? `pkg from '${name}'` : `${name.replace(/[-@/.]/g, '_')} from '${name}'`) + ';\n```';
  }

  // Build Common Patterns section
  let patterns = '';
  if (patternBlocks.length > 0) {
    patterns = patternBlocks.map(b => '```' + b.lang + '\n' + b.code + '\n```').join('\n\n');
  } else if (features.length > 2) {
    patterns = features.slice(0, 4).map(f => `- ${f}`).join('\n');
  } else {
    patterns = `See the [${name} documentation](https://www.npmjs.com/package/${name}) for advanced patterns.`;
  }

  // Build Tips & Gotchas
  let tipsSection = '';
  if (gotchas.length > 0) {
    tipsSection = gotchas.map(g => `- ${g}`).join('\n');
  } else {
    tipsSection = `- Current version is ${version}. Check the changelog for breaking changes when upgrading.\n- See the official docs for full API reference.`;
  }

  const useCaseStr = useCases.map(c => c.endsWith('.') ? c : c).join('; ');
  const antiStr = antiPatterns.join('; ');

  return `---
name: "${name}"
version: "${version}"
downloads_per_month: ${dlFormatted}
description: >
  ${description}. Use when: ${useCaseStr}. NOT for: ${antiStr}.
---

# ${name}

## Overview
${overview}

## Installation
\`\`\`bash
${installCmd}
\`\`\`

## Core API / Usage
${coreApi}

## Common Patterns
${patterns}

## Tips & Gotchas
${tipsSection}
`;
}

// Main
let count = 0;
for (const pkg of packages) {
  const safe = safeName(pkg.name);
  const dir = join(SKILLS_DIR, safe);
  mkdirSync(dir, { recursive: true });

  const content = generateSkillMd(pkg);
  writeFileSync(join(dir, 'SKILL.md'), content, 'utf8');
  count++;

  if (count % 25 === 0) {
    console.log(`=== Progress: ${count}/100 ===`);
  }
}

console.log(`\nDone! Generated ${count} SKILL.md files.`);
