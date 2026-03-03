---
name: "kleur"
version: "4.1.5"
downloads: 211.1M/month
description: >
  The fastest Node.js library for formatting terminal text with ANSI colors~!. Use when: Super lightweight & performant; Supports nested & chained colors; Conditional color support. NOT for: production runtime logic; replacing static type checking.
---

# kleur

## Overview
The fastest Node.js library for formatting terminal text with ANSI colors~!. > Note: Both `kleur` and `kleur/colors` share the same detection logic.

## Installation
```bash
npm install kleur
```

## Core API / Usage
```js
$ npm install --save kleur
```

```js
import kleur from 'kleur';

// basic usage
kleur.red('red text');

// chained methods
kleur.blue().bold().underline('howdy partner');

// nested methods
kleur.bold(`${ white().bgRed('[ERROR]') } ${ kleur.red().italic('Something happened')}`);
```

## Common Patterns
### Pattern 1

```js
const { bold, green } = require('kleur');

console.log(bold().red('this is a bold red message'));
console.log(bold().italic('this is a bold italicized message'));
console.log(bold().yellow().bgRed().italic('this is a bold yellow italicized message'));
console.log(green().bold().underline('this is a bold green underlined message'));
```

### Pattern 2

```js
const { yellow, red, cyan } = require('kleur');

console.log(yellow(`foo ${red().bold('red')} bar ${cyan('cyan')} baz`));
console.log(yellow('foo ' + red().bold('red') + ' bar ' + cyan('cyan') + ' baz'));
```

### Pattern 3

```js
import kleur from 'kleur';

// manually disable
kleur.enabled = false;

// or use another library to detect support
kleur.enabled = require('color-support').level > 0;

console.log(kleur.red('I will only be colored red if the terminal supports colors'));
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/kleur) for configuration options and advanced settings.

## Tips & Gotchas
- Current version: 4.1.5. Check the changelog when upgrading across major versions.
- Refer to the official npm page for edge cases and advanced configuration.
