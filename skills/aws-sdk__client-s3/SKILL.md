---
name: "@aws-sdk/client-s3"
version: "3.1001.0"
downloads: 73.8M/month
description: >
  AWS SDK for JavaScript S3 Client for Node.js, Browser and React Native. Use when: `yarn add @aws-sdk/client-s3`; Initiate client with configuration (e.g. credentials, region); Initiate command with input parameters. NOT for: web browser UI rendering; server-side HTML generation.
---

# @aws-sdk/client-s3

## Overview
AWS SDK for JavaScript S3 Client for Node.js, Browser and React Native.

## Installation
```bash
npm install @aws-sdk/client-s3
```

## Core API / Usage
```js
// ES5 example
const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");
```

```js
// ES6+ example
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
```

## Common Patterns
### Pattern 1

```js
// a client can be shared by different commands.
const client = new S3Client({ region: "REGION" });

const params = { /** input parameters */ };
const command = new ListBucketsCommand(params);
```

### Pattern 2

```js
// async/await.
try {
  const data = await client.send(command);
  // process data.
} catch (error) {
  // error handling.
} finally {
  // finally.
}
```

### Pattern 3

```js
client.send(command).then(
  (data) => {
    // process data.
  },
  (error) => {
    // error handling.
  }
);
```

## Configuration
```js
// a client can be shared by different commands.
const client = new S3Client({ region: "REGION" });

const params = { /** input parameters */ };
const command = new ListBucketsCommand(params);
```

## Tips & Gotchas
- Works in both Node.js and browser environments.
- Current version: 3.1001.0. Check the changelog when upgrading across major versions.
