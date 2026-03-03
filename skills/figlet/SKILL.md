---
name: figlet
description: >
  Generate ASCII art text from strings using FIGlet fonts. Use when: creating CLI banners, welcome screens, decorative headers, logo text in terminals. NOT for: runtime text rendering in production, web/browser use, small terminal widths.
---

# figlet

## Overview
Figlet generates large ASCII art text from ordinary strings using a variety of FIGlet fonts. It is widely used for CLI application banners, welcome messages, and decorative terminal output. The library supports both synchronous and asynchronous APIs, horizontal and vertical layout control, and dozens of built-in fonts.

## Installation
```bash
npm install figlet
# TypeScript types
npm install --save-dev @types/figlet
```

## Core API / Commands

### Synchronous API
```ts
import figlet from 'figlet';

// Simple text rendering
const banner = figlet.textSync('Hello!');
console.log(banner);
// Output:
//  _   _      _ _       _
// | | | | ___| | | ___ | |
// | |_| |/ _ \ | |/ _ \| |
// |  _  |  __/ | | (_) |_|
// |_| |_|\___|_|_|\___/(_)

// With font
console.log(figlet.textSync('CLI', { font: 'Big' }));
```

### Asynchronous API
```ts
import figlet from 'figlet';

figlet.text('Hello World', { font: 'Standard' }, (err, result) => {
  if (err) {
    console.error('Figlet error:', err);
    return;
  }
  console.log(result);
});

// Promise wrapper
function figletAsync(text: string, options?: figlet.Options): Promise<string> {
  return new Promise((resolve, reject) => {
    figlet.text(text, options ?? {}, (err, result) => {
      if (err) reject(err);
      else resolve(result!);
    });
  });
}

const art = await figletAsync('Deploy', { font: 'Slant' });
console.log(art);
```

### List available fonts
```ts
figlet.fontsSync();
// Returns: ['1Row', '3-D', '3D Diagonal', '3D-ASCII', '3x5', 'ANSI Shadow', 'Banner', 'Big', ...]

figlet.fonts((err, fonts) => {
  console.log(`${fonts.length} fonts available`);
});
```

## Common Patterns

### CLI welcome banner with chalk
```ts
import figlet from 'figlet';
import chalk from 'chalk';

const banner = figlet.textSync('My CLI', { font: 'ANSI Shadow' });
console.log(chalk.cyan(banner));
console.log(chalk.dim('  v1.2.3 - Type --help for usage\n'));
```

### Banner with gradient
```ts
import figlet from 'figlet';
import gradient from 'gradient-string';

const text = figlet.textSync('Awesome', { font: 'Big Money-ne' });
console.log(gradient.pastel.multiline(text));
```

### Layout control
```ts
// Horizontal layout
figlet.textSync('AB', {
  font: 'Standard',
  horizontalLayout: 'fitted',     // default | full | fitted | controlled smushing | universal smushing
});

// Vertical layout
figlet.textSync('Hi\nWorld', {
  font: 'Standard',
  verticalLayout: 'fitted',
});

// Width limiting
figlet.textSync('Long Text Here', {
  font: 'Standard',
  width: 60,
  whitespaceBreak: true,  // break at whitespace boundaries
});
```

## Configuration

```ts
figlet.textSync(text, {
  font: 'Standard',              // FIGlet font name
  horizontalLayout: 'default',  // default | full | fitted | controlled smushing | universal smushing
  verticalLayout: 'default',    // default | full | fitted | controlled smushing | universal smushing
  width: 80,                    // max output width
  whitespaceBreak: false,       // break on whitespace when width is set
});
```

### Popular fonts
| Font | Style |
|------|-------|
| `Standard` | Default clean font |
| `Big` | Large blocky letters |
| `Slant` | Italicized appearance |
| `ANSI Shadow` | Shadow effect |
| `Banner` | Wide banner style |
| `Doom` | DOOM-game style |
| `Ghost` | Ghostly outline |
| `Small` | Compact version |
| `Mini` | Minimal size |

## Tips & Gotchas
- Use `textSync` for quick banner generation at startup. The async API is only needed if you are loading custom font files.
- Large fonts like `Banner` or `Big` can exceed terminal width. Set `width: process.stdout.columns` and `whitespaceBreak: true` to auto-wrap.
- Font names are case-sensitive. Use `figlet.fontsSync()` to get the exact names available.
- Combine with `chalk` for colored ASCII art: `chalk.green(figlet.textSync('OK'))`.
- Combine with `gradient-string` for rainbow/gradient ASCII banners.
- Some fonts only support uppercase or ASCII characters. Test with your actual text before shipping.
- The library ships with 200+ fonts built in. No external font files are required.
- For production CLIs, generate the banner at build time and embed the string to avoid the figlet dependency at runtime.
