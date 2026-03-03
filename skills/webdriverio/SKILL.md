---
name: "webdriverio"
version: "9.24.0"
downloads: 12.5M/month
description: >
  Next-gen browser and mobile automation test framework for Node.js. Use when: writing unit and integration tests; mocking dependencies and APIs; snapshot testing. NOT for: production runtime logic; replacing static type checking.
---

# webdriverio

## Overview
Next-gen browser and mobile automation test framework for Node.js. You can use WebdriverIO as a standalone package or via a test runner using `@wdio/cli`.

## Installation
```bash
npm install webdriverio
```

## Core API / Usage
```bash
npm install webdriverio
```

```js
import { remote } from 'webdriverio'

const browser = await remote({
    capabilities: { browserName: 'chrome' }
})

await browser.navigateTo('https://www.google.com/ncr')

const searchInput = await browser.$('#lst-ib')
await searchInput.setValue('WebdriverIO')

const searchBtn = await browser.$('input[value="Google Search"]')
await searchBtn.click()

console.log(await browser.getTitle()) // outputs "WebdriverIO - Google Search"

await browser.deleteSession()
```

## Common Patterns
Refer to the [official documentation](https://github.com/webdriverio/webdriverio) for common patterns, recipes, and advanced usage examples.

```js
import { remote } from 'webdriverio'

const browser = await remote({
    capabilities: { browserName: 'chrome' }
})

await browser.navigateTo('https://www.google.com/ncr')

const searchInput = await browser.$('#lst-ib')
await searchInput.setValue('WebdriverIO')

const searchBtn = await browser.$('input[value="Google Search"]')
await searchBtn.click()

console.log(await browser.getTitle()) // outputs "WebdriverIO - Google Search"

await browser.deleteSession()
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/webdriverio) for configuration options and advanced settings.

## Tips & Gotchas
- Works in both Node.js and browser environments.
- Current version: 9.24.0. Check the changelog when upgrading across major versions.
