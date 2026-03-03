---
name: gradient-string
description: >
  Apply color gradients to terminal strings. Use when: creating colorful CLI banners, styling ASCII art, adding visual flair to terminal output. NOT for: single-color styling (use chalk), non-terminal environments, performance-critical hot paths.
---

# gradient-string

## Overview
Gradient-string applies beautiful color gradients to text in the terminal. It supports built-in gradient presets, custom gradients with arbitrary color stops, and multiline text rendering. Commonly paired with figlet for eye-catching ASCII art banners.

## Installation
```bash
npm install gradient-string
# TypeScript types
npm install --save-dev @types/gradient-string
```

## Core API / Commands

```ts
import gradient from 'gradient-string';

// Built-in gradients
console.log(gradient.rainbow('Rainbow text!'));
console.log(gradient.pastel('Soft pastel colors'));
console.log(gradient.cristal('Crystal blue'));
console.log(gradient.teen('Teen gradient'));
console.log(gradient.mind('Mind gradient'));
console.log(gradient.morning('Morning sunrise'));
console.log(gradient.vice('Vice city'));
console.log(gradient.passion('Passion red'));
console.log(gradient.fruit('Fruity colors'));
console.log(gradient.instagram('Instagram gradient'));
console.log(gradient.atlas('Atlas gradient'));
console.log(gradient.retro('Retro vibes'));
console.log(gradient.summer('Summer warmth'));

// Custom gradient with color stops
const coolGradient = gradient(['#ff0000', '#00ff00', '#0000ff']);
console.log(coolGradient('Red to green to blue'));

// Named colors work too
const warm = gradient(['red', 'orange', 'yellow']);
console.log(warm('Warm gradient text'));
```

## Common Patterns

### ASCII art banner with gradient
```ts
import figlet from 'figlet';
import gradient from 'gradient-string';

const ascii = figlet.textSync('My App', { font: 'ANSI Shadow' });
console.log(gradient.pastel.multiline(ascii));
```

### Multiline text
```ts
const multiline = `
  Line one of the banner
  Line two of the banner
  Line three of the banner
`;
// .multiline() applies the gradient across all lines consistently
console.log(gradient.rainbow.multiline(multiline));

// Without .multiline(), each line gets its own full gradient
console.log(gradient.rainbow(multiline));
```

### Custom gradient with specific color positions
```ts
// Control where each color appears in the gradient
const custom = gradient([
  { color: '#FF5F6D', pos: 0 },
  { color: '#FFC371', pos: 0.5 },
  { color: '#2196F3', pos: 1 },
]);
console.log(custom('Custom positioned gradient'));
```

### Combining with boxen
```ts
import boxen from 'boxen';
import gradient from 'gradient-string';

const title = gradient.vice('Welcome to My CLI');
console.log(boxen(title, {
  padding: 1,
  borderColor: 'magenta',
  borderStyle: 'round',
}));
```

### Dynamic gradient from theme
```ts
// Create branded gradients for your CLI
const brandGradient = gradient(['#667eea', '#764ba2']);
const successGradient = gradient(['#11998e', '#38ef7d']);
const errorGradient = gradient(['#eb3349', '#f45c43']);

console.log(brandGradient('Processing your request...'));
console.log(successGradient('All checks passed!'));
console.log(errorGradient('Build failed with 3 errors'));
```

## Configuration

### Built-in gradient presets
| Preset | Colors |
|--------|--------|
| `rainbow` | Full rainbow spectrum |
| `pastel` | Soft pastel colors |
| `cristal` | Crystal blue tones |
| `teen` | Pink to cyan |
| `mind` | Purple to blue |
| `morning` | Sunrise orange to yellow |
| `vice` | Vice City pink to blue |
| `passion` | Red to magenta |
| `fruit` | Berry to citrus |
| `instagram` | Instagram brand colors |
| `atlas` | Green to blue |
| `retro` | Retro warm tones |
| `summer` | Summer warm colors |

### Custom gradient options
```ts
// Accepts hex strings, CSS color names, or position objects
gradient(['#ff0000', '#00ff00']);                    // 2-stop gradient
gradient(['red', 'yellow', 'green']);                // 3-stop with names
gradient([{ color: '#ff0', pos: 0.3 }, { color: '#0ff', pos: 0.7 }]); // positioned stops
```

## Tips & Gotchas
- Use `.multiline(text)` for multi-line strings (like figlet output) to get a consistent gradient across all lines. Without it, each line gets its own independent gradient.
- The gradient is applied per-character, so very short strings (1-3 chars) may not show a visible gradient effect.
- Gradients work with any string, including ANSI-styled text, but mixing with chalk can produce unexpected results. Apply gradient last.
- Custom gradients need at least 2 color stops. More stops create more complex color transitions.
- Color values can be hex (`#ff0000`), short hex (`#f00`), or CSS color names (`red`, `cyan`).
- Gradient rendering adds ANSI codes to every character, significantly increasing string length. Avoid in hot loops or very long strings.
- The library depends on `tinygradient` and `chalk` internally. It respects `NO_COLOR` and `FORCE_COLOR` env vars via chalk.
- For TypeScript, install `@types/gradient-string` for type definitions.
