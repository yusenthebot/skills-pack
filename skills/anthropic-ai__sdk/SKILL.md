---
name: "@anthropic-ai/sdk"
description: >
  Official Anthropic TypeScript SDK for Claude models. Use when: building applications with Claude, streaming responses, using tool use, sending images/vision, creating multi-turn conversations. NOT for: OpenAI-compatible APIs, running models locally.
---

# @anthropic-ai/sdk

## Overview

The `@anthropic-ai/sdk` package is the official TypeScript/Node.js SDK for Anthropic's Claude models. It provides a typed client for the Messages API with support for streaming, tool use (function calling), vision (image inputs), and multi-turn conversations. The SDK handles authentication, retries, and error handling out of the box.

## Installation

```bash
npm install @anthropic-ai/sdk
yarn add @anthropic-ai/sdk
pnpm add @anthropic-ai/sdk
```

## Core API / Commands

### Client initialization

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // defaults to this env var
});
```

### Basic message creation

```ts
const message = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "What is the capital of France?" },
  ],
});

console.log(message.content[0].text);
```

### System prompts

```ts
const message = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  system: "You are a senior TypeScript developer. Be concise and use code examples.",
  messages: [
    { role: "user", content: "How do I use generics with React components?" },
  ],
});
```

### Streaming with `client.messages.stream`

```ts
const stream = client.messages.stream({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Write a short story about a robot." }],
});

stream.on("text", (text) => {
  process.stdout.write(text);
});

const finalMessage = await stream.finalMessage();
console.log("\n\nTotal tokens:", finalMessage.usage.input_tokens + finalMessage.usage.output_tokens);
```

### Streaming with async iteration

```ts
const stream = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Explain quantum computing." }],
  stream: true,
});

for await (const event of stream) {
  if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
    process.stdout.write(event.delta.text);
  }
}
```

## Common Patterns

### Multi-turn conversation

```ts
const messages: Anthropic.MessageParam[] = [
  { role: "user", content: "My name is Alice." },
  { role: "assistant", content: "Hello Alice! How can I help you today?" },
  { role: "user", content: "What's my name?" },
];

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 256,
  messages,
});
// Response will reference "Alice"
```

### Tool use (function calling)

```ts
const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  tools: [
    {
      name: "get_weather",
      description: "Get the current weather for a given location.",
      input_schema: {
        type: "object",
        properties: {
          location: { type: "string", description: "City and state, e.g. San Francisco, CA" },
        },
        required: ["location"],
      },
    },
  ],
  messages: [{ role: "user", content: "What's the weather in London?" }],
});

// Check if Claude wants to use a tool
const toolUseBlock = response.content.find((block) => block.type === "tool_use");
if (toolUseBlock && toolUseBlock.type === "tool_use") {
  const toolInput = toolUseBlock.input as { location: string };
  const weatherResult = await fetchWeather(toolInput.location);

  // Send tool result back to Claude
  const followUp = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    tools: [/* same tools array */],
    messages: [
      { role: "user", content: "What's the weather in London?" },
      { role: "assistant", content: response.content },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUseBlock.id,
            content: JSON.stringify(weatherResult),
          },
        ],
      },
    ],
  });
}
```

### Vision (image input)

```ts
import fs from "fs";

const imageData = fs.readFileSync("photo.jpg").toString("base64");

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: imageData,
          },
        },
        {
          type: "text",
          text: "Describe what you see in this image.",
        },
      ],
    },
  ],
});
```

### Image from URL

```ts
const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "url",
            url: "https://example.com/image.png",
          },
        },
        { type: "text", text: "What is in this image?" },
      ],
    },
  ],
});
```

## Configuration

```ts
const client = new Anthropic({
  apiKey: "sk-ant-...",             // API key (default: ANTHROPIC_API_KEY env var)
  baseURL: "https://custom-proxy.example.com", // Custom base URL
  timeout: 60_000,                  // Request timeout in ms (default: 10 minutes)
  maxRetries: 3,                    // Auto-retry count (default: 2)
  defaultHeaders: {
    "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15",
  },
});
```

### Key parameters for `messages.create`

| Parameter | Description |
|---|---|
| `model` | Model ID, e.g. `claude-sonnet-4-20250514`, `claude-haiku-4-20250514` |
| `max_tokens` | **Required.** Maximum tokens to generate. |
| `system` | System prompt string or array of content blocks. |
| `temperature` | Randomness 0.0-1.0. Lower = more deterministic. |
| `top_p` | Nucleus sampling threshold. |
| `stop_sequences` | Array of strings that stop generation, e.g. `["\n\nHuman:"]`. |
| `metadata` | Object with `user_id` for abuse tracking. |

## Tips & Gotchas

- **`max_tokens` is required**: Unlike OpenAI, you must always specify `max_tokens`. There is no default. Omitting it throws an error.
- **Content is an array**: `message.content` is always an array of content blocks (text, tool_use, etc.), not a plain string. Access text via `message.content[0].text`.
- **Stop reason matters**: Check `message.stop_reason` -- it can be `"end_turn"`, `"max_tokens"`, `"stop_sequence"`, or `"tool_use"`. If it's `"tool_use"`, you need to handle the tool call.
- **Tool results go in the user role**: When sending tool results back, they are sent as `role: "user"` messages with `type: "tool_result"` content blocks, not as a separate role.
- **Messages must alternate roles**: The API requires strictly alternating `user` and `assistant` messages. You cannot have two consecutive `user` or `assistant` messages.
- **Streaming has two APIs**: Use `client.messages.stream()` for the high-level helper with events like `"text"`, `"message"`, etc. Use `stream: true` in `create()` for raw SSE events.
- **Image size limits**: Images are resized if they exceed 1568px on the longest edge. Keep images under 5MB for base64 input. Supported formats: JPEG, PNG, GIF, WebP.
- **Error handling**: Catch `Anthropic.APIError` for typed errors. Common status codes: 400 (invalid request), 401 (auth), 429 (rate limit), 529 (overloaded).
  ```ts
  try {
    await client.messages.create({ ... });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      if (e.status === 429) console.log("Rate limited, retry after backoff");
    }
  }
  ```
- **Token counting**: Use `message.usage.input_tokens` and `message.usage.output_tokens` to track costs. These are always present in the response.
