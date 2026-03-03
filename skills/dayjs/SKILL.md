---
name: "dayjs"
version: "1.11.19"
downloads: 155.6M/month
description: >
  2KB immutable date time library alternative to Moment.js with the same modern API . Use when: 🕒 Familiar Moment.js API & patterns; 📦 2kb mini library; 👫 All browsers supported. NOT for: timezone database hosting; building calendar UIs.
---

# dayjs

## Overview
2KB immutable date time library alternative to Moment.js with the same modern API . If you use Moment.js, you already know how to use Day.js.

## Installation
```bash
npm install dayjs
```

## Core API / Usage
```js
dayjs().startOf('month').add(1, 'day').set('year', 2018).format('YYYY-MM-DD HH:mm:ss');
```

```js
📚[Installation Guide](https://day.js.org/docs/en/installation/installation)

### API

It's easy to use Day.js APIs to parse, validate, manipulate, and display dates and times.
```

## Common Patterns
### Pattern 1

```js
📚[API Reference](https://day.js.org/docs/en/parse/parse)

### I18n

Day.js has great support for internationalization.

But none of them will be included in your build unless you use it.
```

### Pattern 2

```js
📚[Internationalization](https://day.js.org/docs/en/i18n/i18n)

### Plugin

A plugin is an independent module that can be added to Day.js to extend functionality or add new features.
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/dayjs) for configuration options and advanced settings.

## Tips & Gotchas
- Works in both Node.js and browser environments.
- Current version: 1.11.19. Check the changelog when upgrading across major versions.
