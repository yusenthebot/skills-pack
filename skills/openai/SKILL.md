---
name: openai
description: >
  Official OpenAI Node.js SDK. Use when: calling GPT-4/o1/o3 APIs, streaming completions, embeddings, function calling, vision. NOT for: local models (use ollama), non-OpenAI providers.
---

# openai

## Installation
```bash
npm install openai
```

## Core API

```ts
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Chat completion
const res = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is 2+2?' },
  ],
  max_tokens: 1000,
  temperature: 0.7,
});
console.log(res.choices[0].message.content);
```

## Streaming

```ts
const stream = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}
```

## Function Calling / Tools

```ts
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [{
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name' },
        unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
      },
      required: ['location'],
    },
  },
}];

const res = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Weather in Tokyo?' }],
  tools,
  tool_choice: 'auto',
});

const toolCall = res.choices[0].message.tool_calls?.[0];
if (toolCall) {
  const args = JSON.parse(toolCall.function.arguments);
  // { location: 'Tokyo', unit: 'celsius' }
}
```

## Embeddings

```ts
const res = await client.embeddings.create({
  model: 'text-embedding-3-small',
  input: ['Hello world', 'How are you?'],
});
const vectors = res.data.map(d => d.embedding); // number[][]
```

## Vision

```ts
const res = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What is in this image?' },
      { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
    ],
  }],
});
```

## Common Patterns

### Structured output (JSON mode)
```ts
const res = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'List 3 capitals as JSON array' }],
  response_format: { type: 'json_object' },
});
const data = JSON.parse(res.choices[0].message.content!);
```

### Retry + timeout
```ts
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30_000,
});
```

## Tips & Gotchas
- `gpt-4o` is the recommended model for most tasks (cheaper + faster than gpt-4-turbo)
- Always check `choices[0].finish_reason` — `'length'` means the response was truncated
- For production, use `OPENAI_API_KEY` env var — SDK picks it up automatically
- Rate limits vary by tier — implement exponential backoff for batch jobs
- `client.beta.chat.completions.parse()` for auto-validated structured outputs with Zod
