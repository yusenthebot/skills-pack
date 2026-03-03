---
name: "winston"
version: "3.19.0"
downloads: 81.8M/month
description: >
  A logger for just about everything.. Use when: Creating your logger; Streams, `objectMode`, and `info` objects; Combining formats. NOT for: error tracking/APM services; application metrics collection.
---

# winston

## Overview
A logger for just about everything.. # winston A logger for just about everything.

## Installation
```bash
npm install winston
```

## Core API / Usage
```js
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not trace)
    //
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

```js
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
```

## Common Patterns
### Pattern 1

```js
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/winston) for configuration options and advanced settings.

## Tips & Gotchas
- Works in both Node.js and browser environments.
- Current version: 3.19.0. Check the changelog when upgrading across major versions.
