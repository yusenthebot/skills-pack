---
name: "@clack/prompts"
version: "1.1.0"
downloads: 22.8M/month
description: >
  Effortlessly build beautiful command-line apps 🪄 [Try the demo](https://stackblitz.com/edit/clack-prompts?file=index.js). Use when: 🤏 80% smaller than other options; 💎 Beautiful, minimal UI; 🧱 Comes with `text`, `confirm`, `select`, `multiselect`, and `spinner` components. NOT for: web browser UI rendering; server-side HTML generation.
---

# @clack/prompts

## Overview
Effortlessly build beautiful command-line apps 🪄 [Try the demo](https://stackblitz.com/edit/clack-prompts?file=index.js). ```js import { intro, outro } from '@clack/prompts'; intro(`create-my-app`); // Do stuff outro(`You're all set!`); ``` ### Cancellation The `isCancel` function is a guard that detects when a user cancels a question with `CTRL + C`.

## Installation
```bash
npm install @clack/prompts
```

## Core API / Usage
```js
import { intro, outro } from '@clack/prompts';

intro(`create-my-app`);
// Do stuff
outro(`You're all set!`);
```

```js
import { isCancel, cancel, text } from '@clack/prompts';

const value = await text({
  message: 'What is the meaning of life?',
});

if (isCancel(value)) {
  cancel('Operation cancelled.');
  process.exit(0);
}
```

## Common Patterns
### Pattern 1

```js
import { text } from '@clack/prompts';

const meaning = await text({
  message: 'What is the meaning of life?',
  placeholder: 'Not sure',
  initialValue: '42',
  validate(value) {
    if (value.length === 0) return `Value is required!`;
  },
});
```

### Pattern 2

```js
import { confirm } from '@clack/prompts';

const shouldContinue = await confirm({
  message: 'Do you want to continue?',
});
```

### Pattern 3

```js
import { select } from '@clack/prompts';

const projectType = await select({
  message: 'Pick a project type.',
  options: [
    { value: 'ts', label: 'TypeScript' },
    { value: 'js', label: 'JavaScript', disabled: true },
    { value: 'coffee', label: 'CoffeeScript', hint: 'oh no' },
  ],
});
```

## Configuration
```js
import { select } from '@clack/prompts';

const projectType = await select({
  message: 'Pick a project type.',
  options: [
    { value: 'ts', label: 'TypeScript' },
    { value: 'js', label: 'JavaScript', disabled: true },
    { value: 'coffee', label: 'CoffeeScript', hint: 'oh no' },
  ],
});
```

## Tips & Gotchas
- Includes built-in TypeScript type definitions.
- Current version: 1.1.0. Check the changelog when upgrading across major versions.
