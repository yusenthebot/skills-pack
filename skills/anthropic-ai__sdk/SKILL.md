---
name: "@anthropic-ai/sdk"
version: "0.78.0"
downloads: 25.9M/month
description: >
  The official TypeScript library for the Anthropic API. Use when: bundling and transpiling source code; development server with HMR; production builds. NOT for: runtime application logic; package management (use npm/yarn).
---

# @anthropic-ai/sdk

## Overview
The official TypeScript library for the Anthropic API. The full API documentation can be found at platform.claude.com/docs or in api.md.

## Installation
```bash
npm install @anthropic-ai/sdk
```

## Core API / Usage
```bash
npm install @anthropic-ai/sdk
```

```js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'], // This is the default and can be omitted
});

const message = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
  model: 'claude-sonnet-4-5-20250929',
});

console.log(message.content);
```

## Common Patterns
### Pattern 1

```js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const stream = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
  model: 'claude-sonnet-4-5-20250929',
  stream: true,
});
for await (const messageStreamEvent of stream) {
  console.log(messageStreamEvent.type);
}
```

### Pattern 2

```js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'], // This is the default and can be omitted
});

const params: Anthropic.MessageCreateParams = {
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
  model: 'claude-sonnet-4-5-20250929',
};
const message: Anthropic.Message = await client.messages.create(params);
```

### Pattern 3

```js
const message = await client.messages.create(...)
console.log(message.usage)
// { input_tokens: 25, output_tokens: 13 }
```

## Configuration
```js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'], // This is the default and can be omitted
});

const message = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
  model: 'claude-sonnet-4-5-20250929',
});

console.log(message.content);
```

## Tips & Gotchas
- Includes built-in TypeScript type definitions.
- Current version: 0.78.0. Check the changelog when upgrading across major versions.
