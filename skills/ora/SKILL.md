---
name: "ora"
version: "9.3.0"
downloads: 237.1M/month
description: >
  Elegant terminal spinner. Use when: building interactive command-line tools; styled terminal output; progress indicators and spinners. NOT for: web browser UI rendering; server-side HTML generation.
---

# ora

## Overview
Elegant terminal spinner. #### options Type: `object` ##### text Type: `string` The text to display next to the spinner.

## Installation
```bash
npm install ora
```

## Core API / Usage
```js
import ora from 'ora';

const spinner = ora('Loading unicorns').start();

setTimeout(() => {
	spinner.color = 'yellow';
	spinner.text = 'Loading rainbows';
}, 1000);
```

```js
{
	frames: ['-', '+', '-'],
	interval: 80 // Optional
}
```

## Common Patterns
Refer to the [official documentation](https://github.com/sindresorhus/ora) for common patterns, recipes, and advanced usage examples.

```js
{
	frames: ['-', '+', '-'],
	interval: 80 // Optional
}
```

## Configuration
```js
{
	frames: ['-', '+', '-'],
	interval: 80 // Optional
}
```

## Tips & Gotchas
- Current version: 9.3.0. Check the changelog when upgrading across major versions.
- Refer to the official npm page for edge cases and advanced configuration.
