---
name: "inquirer"
version: "13.3.0"
downloads: 177.8M/month
description: >
  A collection of common interactive command line user interfaces.. Use when: providing _error feedback_; _asking questions_; _validating_ answers. NOT for: web browser UI rendering; server-side HTML generation.
---

# inquirer

## Overview
A collection of common interactive command line user interfaces.. While it still receives maintenance, it is not actively developed.

## Installation
```bash
npm install inquirer
```

## Core API / Usage
```bash
npm install inquirer
```

```bash
yarn add inquirer
```

## Common Patterns
### Pattern 1

```js
import inquirer from 'inquirer';

inquirer
  .prompt([
    /* Pass your questions in here */
  ])
  .then((answers) => {
    // Use user feedback for... whatever!!
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
```

### Pattern 2

```bash
yarn node packages/inquirer/examples/pizza.js
yarn node packages/inquirer/examples/checkbox.js
# etc...
```

### Pattern 3

```js
const prompt = inquirer.createPromptModule();

prompt(questions).then(/* ... */);
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/inquirer) for configuration options and advanced settings.

## Tips & Gotchas
- This is the legacy version of Inquirer.js. While it still receives maintenance, it is not actively developed. For the new Inquirer, see @inquirer/prompts.
- Current version: 13.3.0. Check the changelog when upgrading across major versions.
