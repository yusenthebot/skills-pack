---
name: "meow"
version: "14.1.0"
downloads: 133.6M/month
description: >
  CLI app helper. Use when: Parses arguments; Converts flags to camelCase; Negates flags when using the `--no-` prefix. NOT for: web browser UI rendering; server-side HTML generation.
---

# meow

## Overview
CLI app helper. A popular CLI package for Node.js with 133.6M monthly downloads.

## Installation
```bash
npm install meow
```

## Core API / Usage
```bash
npm install meow
```

```js
./foo-app.js unicorns --rainbow
```

## Common Patterns
### Pattern 1

```js
#!/usr/bin/env node
import meow from 'meow';
import foo from './lib/index.js';

const cli = meow(`
	Usage
	  $ foo <input>

	Options
	  --rainbow, -r  Include a rainbow

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`, {
	importMeta: import.meta, // This is required
	flags: {
		rainbow: {
			type: 'boolean',
			shortFlag: 'r'
		}
	}
});
/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

foo(cli.input.at(0), cli.flags);
```

### Pattern 2

```js
input: {
	isRequired: true
}
```

### Pattern 3

```js
if (!cli.command) {
	cli.showHelp(); // or showHelp(0), or a custom message, or a default command
}
```

## Configuration
```js
#!/usr/bin/env node
import meow from 'meow';
import foo from './lib/index.js';

const cli = meow(`
	Usage
	  $ foo <input>

	Options
	  --rainbow, -r  Include a rainbow

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`, {
	importMeta: import.meta, // This is required
	flags: {
		rainbow: {
			type: 'boolean',
			shortFlag: 'r'
		}
	}
});
/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

foo(cli.input.at(0), cli.flags);
```

## Tips & Gotchas
- Supports both ESM (`import`) and CommonJS (`require()`).
- Current version: 14.1.0. Check the changelog when upgrading across major versions.
