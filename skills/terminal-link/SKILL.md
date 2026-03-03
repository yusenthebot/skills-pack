---
name: terminal-link
description: >
  Create clickable hyperlinks in the terminal. Use when: linking to URLs in CLI output, creating clickable file paths, adding documentation links to help text. NOT for: styling text (use chalk), non-terminal environments, terminals without hyperlink support (provides fallback).
---

# terminal-link

## Overview
Terminal-link creates clickable hyperlinks in supported terminal emulators using the OSC 8 escape sequence. When a terminal supports hyperlinks, the text is rendered as a clickable link (like an HTML anchor tag). For unsupported terminals, it provides a configurable fallback that displays the URL alongside the text. ESM-only from v3+.

## Installation
```bash
npm install terminal-link
# or
yarn add terminal-link
# or
pnpm add terminal-link
```

> Terminal-link v3+ is ESM-only. For CommonJS, use `terminal-link@2`.

## Core API / Commands

```ts
import terminalLink from 'terminal-link';

// Basic clickable link
const link = terminalLink('My Website', 'https://example.com');
console.log(link);
// In supported terminals: "My Website" is clickable
// In unsupported terminals: "My Website (https://example.com)"

// Check terminal support
import { isSupported } from 'terminal-link';
console.log(isSupported); // true or false
```

## Common Patterns

### CLI help text with links
```ts
import terminalLink from 'terminal-link';

console.log(`
  Usage: mycli <command> [options]

  Commands:
    init        Initialize a new project
    build       Build for production
    deploy      Deploy to cloud

  Documentation: ${terminalLink('docs', 'https://mycli.dev/docs')}
  Report bugs:   ${terminalLink('issues', 'https://github.com/org/mycli/issues')}
  Changelog:     ${terminalLink('releases', 'https://github.com/org/mycli/releases')}
`);
```

### Custom fallback format
```ts
import terminalLink from 'terminal-link';

// Default fallback: "text (url)"
const link1 = terminalLink('Click here', 'https://example.com');

// Custom fallback
const link2 = terminalLink('Click here', 'https://example.com', {
  fallback: (text, url) => `${text} [${url}]`,
});
// In unsupported terminals: "Click here [https://example.com]"

// No fallback (just show text, hide URL)
const link3 = terminalLink('Click here', 'https://example.com', {
  fallback: (text) => text,
});
```

### Conditional rendering based on support
```ts
import terminalLink, { isSupported } from 'terminal-link';

if (isSupported) {
  console.log(terminalLink('View results', 'https://ci.example.com/run/123'));
} else {
  console.log('View results: https://ci.example.com/run/123');
}
```

### With chalk for styled links
```ts
import terminalLink from 'terminal-link';
import chalk from 'chalk';

const styledLink = chalk.cyan.underline(
  terminalLink('documentation', 'https://docs.example.com')
);
console.log(`See the ${styledLink} for more info.`);
```

### File path links
```ts
import terminalLink from 'terminal-link';
import path from 'path';

const filePath = path.resolve('./src/index.ts');
const fileLink = terminalLink('src/index.ts', `file://${filePath}`);
console.log(`Error in ${fileLink}:23:5`);
// Clicking opens the file in supported terminals
```

### Links in error output
```ts
import terminalLink from 'terminal-link';

function reportError(code: string, message: string) {
  const docsLink = terminalLink(code, `https://mycli.dev/errors/${code}`);
  console.error(`Error ${docsLink}: ${message}`);
}

reportError('E001', 'Configuration file not found');
// Output: "Error E001: Configuration file not found"
// where "E001" is a clickable link to the error docs
```

## Configuration

```ts
terminalLink(text, url, {
  // Custom fallback for unsupported terminals
  // Default: (text, url) => `${text} (${url})`
  fallback: (text: string, url: string) => string,
});
```

### Terminal support
Terminals that support clickable links (OSC 8):
- iTerm2 3.1+
- Windows Terminal
- GNOME Terminal 3.26+
- WezTerm
- Hyper
- VS Code integrated terminal
- Alacritty 0.11+

Terminals that do NOT support clickable links:
- macOS Terminal.app
- PuTTY
- older xterm versions

## Tips & Gotchas
- Terminal-link v3+ is ESM-only. Use `terminal-link@2` for CommonJS / `require()`.
- The `isSupported` export tells you at runtime whether the current terminal supports clickable links. Use it for conditional rendering when the fallback is not adequate.
- Fallback format is `"text (url)"` by default. Override with the `fallback` option if you want a different format or want to hide the URL entirely.
- Links work with `file://` protocol for local file paths, not just `http://` and `https://`.
- When combining with chalk, apply chalk styles around the `terminalLink()` call, not inside it. The link escape sequences must not be broken by color codes.
- The OSC 8 sequence is invisible in unsupported terminals -- your fallback handles those cases. Always test in Terminal.app and Windows CMD for coverage.
- Link text can be anything, including emoji or styled text. The URL is the actual link target.
- For stderr output, the same `isSupported` check applies since it checks `stdout` by default. Use `terminalLink.stderr` and `terminalLink.isSupported` for stderr-specific detection.
