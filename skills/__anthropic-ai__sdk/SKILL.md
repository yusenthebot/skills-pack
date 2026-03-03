---
name: "@anthropic-ai/sdk"
description: >
  Official Anthropic Claude SDK. Use when: calling Claude API, streaming responses, vision, tool use, multi-turn conversations. NOT for: local inference, non-Anthropic models.
---

# @anthropic-ai/sdk

## Installation
```bash
npm install @anthropic-ai/sdk
```

## Core API

```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const msg = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(msg.content[0].text);
```

## Streaming

```ts
const stream = client.messages.stream({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Write a poem' }],
});

for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
    process.stdout.write(event.delta.text);
  }
}
const finalMsg = await stream.finalMessage();
```

## System Prompt + Multi-turn

```ts
const msg = await client.messages.create({
  model: 'claude-opus-4-5',
  max_tokens: 2048,
  system: 'You are a helpful coding assistant.',
  messages: [
    { role: 'user', content: 'How do I reverse a string in Python?' },
    { role: 'assistant', content: 'Use slicing: `s[::-1]`' },
    { role: 'user', content: 'What about in JavaScript?' },
  ],
});
```

## Tool Use

```ts
const tools: Anthropic.Tool[] = [{
  name: 'get_stock_price',
  description: 'Get current stock price',
  input_schema: {
    type: 'object' as const,
    properties: { symbol: { type: 'string', description: 'Ticker symbol' } },
    required: ['symbol'],
  },
}];

const msg = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  tools,
  messages: [{ role: 'user', content: 'What is NVDA trading at?' }],
});

if (msg.stop_reason === 'tool_use') {
  const toolUse = msg.content.find(b => b.type === 'tool_use');
  // toolUse.input: { symbol: 'NVDA' }
}
```

## Vision

```ts
const msg = await client.messages.create({
  model: 'claude-opus-4-5',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'url', url: 'https://example.com/chart.png' } },
      { type: 'text', text: 'Describe this chart' },
    ],
  }],
});
```

## Tips & Gotchas
- `ANTHROPIC_API_KEY` env var is auto-detected — no need to pass explicitly
- `max_tokens` is required — there's no default
- Claude doesn't have a `system` role in messages — use the top-level `system` param
- `stop_reason: 'max_tokens'` means response was truncated
- Use `claude-haiku-4-5` for fast/cheap tasks, `claude-opus-4-5` for complex reasoning
- Streaming: use `.stream()` helper which handles reconnects automatically
